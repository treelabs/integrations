const { json, send } = require('micro');
const { get, find, defaultTo } = require('lodash');
const cors = require('micro-cors')();
const { fetchWorkspaces, getForms, getForm } = require('./typeform');
const { loadConfiguration, saveConfiguration } = require('./db');

const PAGE_ID_SETTINGS = 'settings';
const PAGE_ID_SELECT_WORKSPACE = 'select_workspace';
const PAGE_ID_FORM = 'form';
const ACTION_SUBMIT_ACCESS_KEY = 'submit_access_key';
const ACTION_SUBMIT_WORKSPACE = 'submit_workspace';

const handler = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return sendMessage(res, 404, 'Page not found.');
    }

    const payload = await json(req);

    if (!hasAccess(payload)) {
        return sendMessage(res, 401, 'You do not have access to this content.');
    }

    const hasFullAccess = get(payload, 'permissions', []).includes('full_access');
    const installationId = payload.installation_id;

    if (!installationId) {
        return sendMessage(res, 400, 'No Installation ID provided.')
    }

    const action = defaultTo(payload.action, '');
    try {
        if (action === ACTION_SUBMIT_ACCESS_KEY) {
            const personalAccessToken = parseAccessTokenFromProps(payload);
            await saveConfiguration(installationId, personalAccessToken, null);
            return sendRedirect(res, null, 'Configuration has been saved.');
        } else if (action === ACTION_SUBMIT_WORKSPACE) {
            const config = await getConfig(installationId);
            const personalAccessToken = get(config, 'personalAccessToken', null);
            const workspaces = await fetchWorkspaces(personalAccessToken);
            const workspaceId = parseWorkspaceIdFromProps(payload, workspaces);
            await saveConfiguration(installationId, null, workspaceId);
            return sendRedirect(res, null, 'Configuration has been saved.');
        }
    } catch (error) {
        return sendNotification(res, `Error saving configuration. ${defaultTo(error.message, '')}`);
    }


    const config = await getConfig(installationId);
    const personalAccessToken = get(config, 'personalAccessToken', null);
    if (personalAccessToken === null) {
        return sendNeedsConfiguration(res, hasFullAccess);
    }

    const pageId = get(payload, 'page_id', null);
    if (pageId !== null && pageId.startsWith(`${PAGE_ID_FORM}/`) && get(pageId.split('/'), '[1]', '').length > 0) {
        try {
            const formId = get(pageId.split('/'), '[1]', '');
            const form = await getForm(personalAccessToken, formId);
            return sendPage(res, 200, renderFormPage(form.title, get(form, '_links.display', null)));
        } catch (error) {
        }
    } else if (pageId === PAGE_ID_SETTINGS) {
        return sendPage(res, 200, renderSettingsForm());
    } else if (pageId === PAGE_ID_SELECT_WORKSPACE) {
        if (hasFullAccess) {
            const workspaces = await fetchWorkspaces(personalAccessToken);
            return sendPage(res, 200, renderWorkspaceSelector(get(workspaces, 'items', [])));
        } else {
            return sendNotYetConfigured(res);
        }
    }

    const workspaceId = get(config, 'workspaceId', null);
    if (workspaceId === null) {
        if (hasFullAccess) {
            const workspaces = await fetchWorkspaces(personalAccessToken);
            return sendPage(res, 200, renderWorkspaceSelector(get(workspaces, 'items', [])));
        } else {
            return sendNotYetConfigured(res);
        }
    }

    try {
        const forms = await getForms(personalAccessToken, workspaceId);
        return sendPage(res, 200, renderActiveForms(get(forms, 'items', []), hasFullAccess));
    } catch (e) {
        return sendPage(res, 200, renderActiveForms([], hasFullAccess));
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

const sendNeedsConfiguration = (res, hasFullAccess) => {
    if (hasFullAccess) {
        sendPage(res, 200, renderSettingsForm());
    } else {
        sendNotYetConfigured(res);
    }
}

const sendNotYetConfigured = (res) => {
    sendMessage(res, 501, 'This integration is not yet configured. This can only be done by someone with Full Access permissions.');
}

const getConfig = async (installationId) => {
    const config = await loadConfiguration(installationId);
    if (config) {
        const data = get(config, 'data', null);
        return data;
    }
    return null;
}

const hasAccess = (payload) => {
    return get(payload, 'permissions', []).length > 0;
}

const parseAccessTokenFromProps = (payload) => {
    const personalAccessToken = getPropValue(payload.props, 'personal_access_token');
    if (personalAccessToken === '') {
        throw new Error('Please enter your personal access token.');
    }
    return personalAccessToken;
}

const parseWorkspaceIdFromProps = (payload, workspaces) => {
    const workspaceSelectedIndex = getPropValue(payload.props, 'workspace_selected_index');
    const workspaceId = get(workspaces, `items[${workspaceSelectedIndex}].id`, null);
    if (workspaceId === null) {
        throw new Error('Please select a workspace.');
    }
    return workspaceId;
}

const getPropValue = (props, name) => {
    return get(find(props, (prop) => get(prop, 'name', '') === name), 'value', '');
}

const renderSettingsForm = (personalAccessToken) => {
    return {
        title: 'Settings',
        props: [
            {
                name: 'personal_access_token',
                type: 'text', value: personalAccessToken
            },
        ],
        blocks: [
            {
                type: 'heading1',
                value: 'Welcome!'
            },
            {
                type: 'text',
                value: 'This Integration is backed by [Typeform](https://www.typeform.com/), which is an online forms and surveys service. In order to get started, please provide the information below. Follow our [Typeform guide](https://www.notion.so/withtree/Typeform-8314af0825ab4d8caec124fee95de1c0) to get started.'
            },
            {
                type: 'heading3',
                value: 'Typeform Configuration' 
            },
            {
                type: 'input',
                bindToProp: 'personal_access_token',
                value: personalAccessToken,
                attrs: {
                    label: 'Personal Access Token',
                    placeholder: 'Hidden',
                    display_type: 'legend'
                }
            },
            {
                type: 'text',
                value: '👉 [How do I find my Personal Access Token?](https://www.notion.so/withtree/Typeform-8314af0825ab4d8caec124fee95de1c0)',
                attrs: {
                    size: 'small',
                    appearance: 'light'
                }
            },
            {
                type: 'spacer'
            },
            {
                type: 'button',
                value: 'Submit',
                attrs: {
                    action: ACTION_SUBMIT_ACCESS_KEY,
                    disabled: false
                }
            },
            {
                type: 'text',
                value: 'Note: as a user with Full Access permissions, you can update this information at any time. Just tap the "⚙️ Configure Integration" link at the bottom of the main page.',
                attrs: {
                    size: 'small',
                    appearance: 'light'
                }
            }
        ]
    };
}

const renderWorkspaceSelector = (workspaces) => {
    if (workspaces.length === 0) {
        return {
            title: 'Select Workspace',
            blocks: [
                {
                    type: 'text',
                    value: 'You don\'t have any workspaces yet. Head over to [Typeform](https://admin.typeform.com/) to create one.', 
                    attrs: {
                        appearance: 'light'
                    }
                }
            ]
        }
    }
    return {
        title: 'Select Workspace',
        props: [
            {
                name: 'workspace_selected_index',
                type: 'number',
                value: -1
            },
        ],
        blocks: [
            {
                type: 'heading2',
                value: 'What workspace do you want to use?'
            },
            {
                type: 'spacer'
            },
            {
                'type': 'singleselect',
                'bindToProp': 'workspace_selected_index',
                'value': {
                    'items': workspaces.map((w) => w.name)
                },
                'attrs': {
                    'label': 'Select a workspace...'
                }
            },
            {
                type: 'spacer'
            },
            {
                type: 'button',
                value: 'Save',
                attrs: {
                    action: ACTION_SUBMIT_WORKSPACE,
                    disabled: false
                }
            },
            ...configureBlocks()
        ]
    };
}

const renderActiveForms = (forms, hasFullAccess) => {
    let blocks = [];
    if (defaultTo(forms, []).length === 0) {
        blocks = [
            {
                type: 'heading2',
                value: 'There are no active polls.'
            },
        ]
    } else {
        blocks = [
            {
                type: 'heading2',
                value: 'Active Polls'
            },
            {
                type: 'spacer'
            },
            ...forms.map((form) => {
                return {
                    type: 'link',
                    value: `📋 ${defaultTo(form.title, 'Untitled Form')}`, 
                    attrs: {
                        pageId: `${PAGE_ID_FORM}/${form.id}`
                    } }
            })
        ]
    }
    if (hasFullAccess) {
        blocks = blocks.concat(configureBlocks());
    }
    return {
        title: 'Polls',
        blocks
    };
}

const configureBlocks = () => {
    return [
        {
            type: 'divider'
        },
        {
            type: 'link',
            value: '⚙️ Configure Integration',
            attrs: {
                pageId: PAGE_ID_SETTINGS
            }
        },
        {
            type: 'link',
            value: '🗂 Select Workspace',
            attrs: {
                pageId: PAGE_ID_SELECT_WORKSPACE
            }
        },
    ];
}

const renderFormPage = (name, url) => {
    return {
        title: defaultTo(name, 'Untitled Form'),
        blocks: [
            {
                type: 'typeform',
                value: url,
                attrs: {
                    fullscreen: true
                }
            }
        ]
    };
}

module.exports = cors(handler)
