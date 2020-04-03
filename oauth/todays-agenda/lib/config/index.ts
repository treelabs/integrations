const getEnv = (e: string, def?: string) => {
  let v = process.env[e] || def;
  if (v) {
    return v;
  } else {
    throw new Error(`Could not find env ${e}`);
  }
};

export const TREE_GRAPHQL_URL: string = getEnv('TREE_GRAPHQL_URL'); // e.g. https://api.withtree.com/graphql
export const TREE_APP_URL: string = getEnv('TREE_APP_URL'); // e.g. https://withtree.com
export const TREE_INTEGRATION_ID: string = getEnv('TREE_INTEGRATION_ID');
export const TREE_CLIENT_ID: string = getEnv('TREE_CLIENT_ID');
export const TREE_CLIENT_SECRET: string = getEnv('TREE_CLIENT_SECRET');

export const GOOGLE_CLIENT_ID: string = getEnv('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET: string = getEnv('GOOGLE_CLIENT_SECRET');
export const GOOGLE_AUTH_URL: string = getEnv('GOOGLE_AUTH_URL');
export const GOOGLE_TOKEN_URL: string = getEnv('GOOGLE_TOKEN_URL');
export const GOOGLE_TOKEN_INFO_URL: string = getEnv('GOOGLE_TOKEN_INFO_URL');

export const FAUNADB_SECRET: string = getEnv('FAUNADB_SECRET');
export const USERS_COLLECTION = 'users';
export const USERS_INDEX = 'users_by_userId';
