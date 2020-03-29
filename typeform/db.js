const faunadb = require('faunadb')
const { get, defaultTo } = require('lodash')

// Read the FAUNADB_SECRET_KEY secret from the environment variable.
// If you don't want to use environment variables, you can paste the
// secret here directly, but we do not recommend this.
const client = new faunadb.Client({ secret: process.env.FAUNADB_TYPEFORM_SECRET_KEY });
const q = faunadb.query;

const saveConfiguration = async (installationId, personalAccessToken, workspaceId) => {
    const existing = await loadConfiguration(installationId);
    console.log("existing", existing)
    if (existing && existing.ref) {
        await updateConfiguration(existing.ref, installationId, personalAccessToken, workspaceId);
    } else {
        await createConfiguration(installationId, personalAccessToken, workspaceId);
    }
}

const createConfiguration = async (installationId, personalAccessToken, workspaceId) => {
    try {
        await client.query(q.Create(q.Collection('Configurations'),
            {
                data: {
                    installationId: installationId,
                    personalAccessToken: personalAccessToken,
                    workspaceId: workspaceId,
                }
            }
        ));
    } catch (error) {
        throw new Error(`Failed to access database.`);
    }
}

const updateConfiguration = async (ref, installationId, personalAccessToken, workspaceId) => {
    let data = {};
    if (personalAccessToken !== null) {
        data = { personalAccessToken, ...data };
    }
    if (workspaceId !== null) {
        data = { workspaceId, ...data };
    }
    try {
        await client.query(
            q.Update(ref,
                {
                    data: data
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
