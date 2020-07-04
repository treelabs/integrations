const { json, send } = require('micro')
const { get, find, defaultTo } = require('lodash')
const cors = require('micro-cors')()
const contentful = require('contentful')
const parseContentfulEntry = require('./parser')
const { saveConfiguration, loadConfiguration } = require('./db')
const { parse } = require('url');

const cachedClients = {};
const PAGE_ID_SETTINGS = 'settings';

const handler = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return sendMessage(res, 404, 'Page not found.');
    }

    const { query } = parse(req.url, true);
    const isConfigured = checkIsConfigured(query);
    const payload = await json(req);

    if (!hasAccess(payload)) {
        return sendMessage(res, 403, 'You do not have access to this content.');
    }

    const isAdmin = get(payload, 'permissions', []).includes('full_access');
    const installationId = payload.installation_id;

    if (!installationId) {
        return sendMessage(res, 400, 'No Installation ID provided.')
    }

    if (payload.action === 'submit') {
        try {
            const { contentfulSpaceId, contentfulAccessToken, contentfulEntryId } = parseActionProps(payload);
            await saveConfiguration(installationId, contentfulSpaceId, contentfulAccessToken, contentfulEntryId);
            return sendRedirect(res, null, 'Configuration has been saved.');
        } catch (error) {
            return sendNotification(res, `Error saving configuration. ${defaultTo(error.message, '')}`);
        }
    }

    let pageId = get(payload, 'page_id', null);
    const isEntryPage = pageId === null;
    if (isEntryPage) {
        pageId = defaultTo(await getHomePageId(installationId, query), null);
    } else {
        pageId = defaultTo(payload.page_id, null);
    }

    if (pageId === null) {
        return sendNeedsConfiguration(res, isAdmin);
    }

    const client = await getContentfulClient(installationId, query);
    if (!client) {
        return sendNeedsConfiguration(res, isAdmin);
    }

    if (pageId === PAGE_ID_SETTINGS) {
        if (isAdmin) {
            return sendPage(res, 200, renderForm());
        } else {
            return sendMessage(res, 403, 'You do not have access to this content.');
        }
    }

    let entry = null;
    try {
        entry = await fetchContentfulEntry(client, pageId)
    } catch (e) {
        return sendNotFound(res, isEntryPage, isAdmin);
    }

    if (!entry) {
        return sendNotFound(res, isEntryPage, isAdmin);
    }

    try {
        const page = await parseContentfulEntry(entry);
        if (isAdmin && isEntryPage && !isConfigured) {
            // Append settings button on main page for admins
            page.blocks = page.blocks.concat(getSettingsBlocks());
        }
        return sendPage(res, 200, page);
    } catch (e) {
        return sendNotFound(res, isEntryPage, isAdmin);
    }
}

const sendPage = (res, code, payload) => {
    send(res, 200, { code, ...payload });
}

const sendMessage = (res, code, message) => {
    send(res, 200, { code, message });
}

const sendNotification = (res, notification) => {
    send(res, 200, { code: 200, notification });
}

const sendRedirect = (res, pageId, notification) => {
    send(res, 200, { code: 301, pageId, notification });
}

const sendNeedsConfiguration = (res, isAdmin) => {
    if (isAdmin) {
        sendPage(res, 200, renderForm());
    } else {
        sendMessage(res, 501, 'This integration is not yet configured. This can only be done by someone with Full Access permissions.');
    }
}

const sendNotFound = (res, isEntryPage, isAdmin) => {
    if (isAdmin && isEntryPage) {
        return sendPage(res, 200, renderForm());
    }
    return sendMessage(res, 404, 'Page not found.');
}

const getContentfulClient = async (installationId, query) => {
    if (installationId in cachedClients) {
        return cachedClients[installationId];
    }
    const info = await getContentfulInfo(installationId, query);
    if (!info) {
        return null
    }
    const client = contentful.createClient({
        space: info.contentfulSpaceId,
        accessToken: info.contentfulAccessToken
    })
    cachedClients[installationId] = client
    return client
}

const getContentfulInfo = async (installationId, query) => {
    // Check whether info is included in query URL.
    const querySpaceId = get(query, 'spaceId', null);
    const queryAccessToken = get(query, 'accessToken', null);
    if (querySpaceId != null && queryAccessToken !== null) {
        return {
            contentfulSpaceId: querySpaceId,
            contentfulAccessToken: queryAccessToken,
        };
    }

    // If info is not included in query URL, fetch it from config store.
    const config = await loadConfiguration(installationId);
    if (config) {
        return {
            contentfulSpaceId: get(config, 'data.contentfulSpaceId', null),
            contentfulAccessToken: get(config, 'data.contentfulAccessToken', null),
        };
    }
    return null;
}

const getHomePageId = async (installationId, query) => {
    // Check whether info is included in query URL.
    const entryId = get(query, 'entryId', null);
    if (entryId != null) {
        return entryId;
    }

    // If info is not included in query URL, fetch it from config store.
    const config = await loadConfiguration(installationId);
    return get(config, 'data.contentfulEntryId', null);
}

const checkIsConfigured = (query) => {
    // Check whether all required parameters (space id, access token, entry id)
    // are provided in the URL.
    const entryId = get(query, 'entryId', null);
    const querySpaceId = get(query, 'spaceId', null);
    const queryAccessToken = get(query, 'accessToken', null);
    return entryId !== null && querySpaceId !== null && queryAccessToken != null;
}

const fetchContentfulEntry = async (client, pageId) => {
    return await client.getEntry(pageId);
}

const hasAccess = (payload) => {
    return get(payload, 'permissions', []).length > 0;
}

const parseActionProps = (payload) => {
    const contentfulSpaceId = getPropValue(payload.props, 'space_id');
    const contentfulAccessToken = getPropValue(payload.props, 'access_token');
    const contentfulEntryId = getPropValue(payload.props, 'entry_id');
    let missingProps = [];
    if (contentfulSpaceId === '') {
        missingProps.push('Space ID');
    }
    if (contentfulAccessToken === '') {
        missingProps.push('Access Token');
    }
    if (contentfulEntryId === '') {
        missingProps.push('Entry ID');
    }
    if (missingProps.length > 0) {
        throw new Error(`Please provide the following: ${missingProps.join(', ')}.`);
    }
    return { contentfulSpaceId, contentfulAccessToken, contentfulEntryId };
}

const getPropValue = (props, name) => {
    return get(find(props, (prop) => get(prop, 'name', '') === name), 'value', '');
}

const renderForm = (spaceId, accessToken, entryId) => {
    return {
        title: 'Settings',
        props: [
            { name: 'space_id', type: 'text', value: spaceId },
            { name: 'access_token', type: 'text', value: accessToken },
            { name: 'entry_id', type: 'text', value: entryId }
        ],
        blocks: [
            { type: 'heading1', value: 'Welcome!' },
            { type: 'text', value: 'This Integration is backed by [Contentful](https://app.contentful.com/), which is a CMS (Content Managment System) that allows you to create rich pages to be displayed. In order to get started, please provide the information below. Follow our [Contentful guide](https://www.notion.so/withtree/Contentful-a473d6ae70254bbba6e79a89970546a3) to get started.' },
            { type: 'heading3', value: 'Contentful Configuration'  },
            { type: 'input', bindToProp: 'space_id', value: spaceId, attrs: { label: 'Space ID', placeholder: 'Hidden', display_type: 'legend' }},
            { type: 'input', bindToProp: 'access_token', value: accessToken, attrs: { label: 'Access Token', placeholder: 'Hidden', display_type: 'legend' }},
            { type: 'input', bindToProp: 'entry_id', value: entryId, attrs: { label: 'Entry ID', placeholder: 'Hidden', display_type: 'legend' }},
            { type: 'text', value: '👉 [How do I find these values?](https://www.notion.so/withtree/Contentful-a473d6ae70254bbba6e79a89970546a3#ce259e32a41c4e1da13e23790396a45c)', attrs: {size: 'small', appearance: 'light' }},
            { type: 'spacer' },
            { type: 'button', value: 'Submit', attrs: { action: 'submit', disabled: false }},
            { type: 'text', value: 'Note: as a user with Full Access permissions, you can update this information at any time. Just tap the "⚙️ Configure Integration" link at the bottom of the main page.', attrs: {size: 'small', appearance: 'light' }}
        ]
    };
}

const getSettingsBlocks = () => {
    return [
        { type: 'divider' },
        { type: 'link', value: '⚙️ Configure Integration', attrs: { pageId: PAGE_ID_SETTINGS }}
    ];
}

module.exports = cors(handler)
