const faunadb = require('faunadb')

// Read the FAUNADB_SECRET_KEY secret from the environment variable.
// If you don't want to use environment variables, you can paste the
// secret here directly, but we do not recommend this.
const client = new faunadb.Client({ secret: process.env.FAUNADB_CONTENTFUL_SECRET_KEY });
const q = faunadb.query;

const saveConfiguration = async (installationId, contentfulSpaceId, contentfulAccessToken, contentfulEntryId) => {
    const existing = await loadConfiguration(installationId);
    if (existing && existing.ref) {
        await replaceConfiguration(existing.ref, installationId, contentfulSpaceId, contentfulAccessToken, contentfulEntryId);
    } else {
        await createConfiguration(installationId, contentfulSpaceId, contentfulAccessToken, contentfulEntryId);
    }
}

const createConfiguration = async (installationId, contentfulSpaceId, contentfulAccessToken, contentfulEntryId) => {
    try {
        await client.query(q.Create(q.Collection('Configurations'),
            {
                data: {
                    installationId: installationId,
                    contentfulSpaceId: contentfulSpaceId,
                    contentfulAccessToken: contentfulAccessToken,
                    contentfulEntryId: contentfulEntryId
                }
            }
        ));
    } catch (error) {
        throw new Error(`Failed to access database.`);
    }
}

const replaceConfiguration = async (ref, installationId, contentfulSpaceId, contentfulAccessToken, contentfulEntryId) => {
    try {
        await client.query(
            q.Replace(ref,
                {
                    data: {
                        installationId: installationId,
                        contentfulSpaceId: contentfulSpaceId,
                        contentfulAccessToken: contentfulAccessToken,
                        contentfulEntryId: contentfulEntryId
                    }
                },
            ));
    } catch (error) {
        throw new Error(`Failed to access database.`);
    }
}

const loadConfiguration = async (installationId) => {
    try {
        return await client.query(q.Get(q.Match(q.Index('config_by_installation_id'), installationId)));
    } catch (error) {
        return null;
    }
}

module.exports = {
    saveConfiguration,
    loadConfiguration
};
