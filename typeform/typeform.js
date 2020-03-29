const fetch = require('isomorphic-fetch');

const fetchWorkspaces = async (accessToken) => {
    const response = await fetch('https://api.typeform.com/workspaces', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
        }
    });
    return response.json();
}

const getForms = async (accessToken, workspaceId) => {
    const response = await fetch('https://api.typeform.com/forms', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
        },
        body: JSON.stringify({
            page_size: 20,
            workspace_id: workspaceId
        })
    });
    return response.json();
}

const getForm = async (accessToken, formId) => {
    const response = await fetch(`https://api.typeform.com/forms/${formId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
        }
    });
    return response.json();
}

module.exports = {
    fetchWorkspaces,
    getForms,
    getForm,
};
