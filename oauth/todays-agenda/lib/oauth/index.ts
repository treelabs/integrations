import url from 'url';
import querystring from 'querystring';
import axios from 'axios';
import {
  TREE_APP_URL,
  TREE_INTEGRATION_ID,
  GOOGLE_AUTH_URL,
  GOOGLE_TOKEN_URL,
  GOOGLE_TOKEN_INFO_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} from '../config';
import { User, TreeRequest } from '../types';
import { getSpaceSlug } from '../tree';

const toState = (state: any): string => Buffer.from(JSON.stringify(state)).toString('base64');
const fromState = (state: string): any => JSON.parse(Buffer.from(state, 'base64').toString('ascii'));

export const getRedirectUri = (hostname: string): string => `https://${hostname}/api/auth`;

export const getAuthorizeUrl = async (req: TreeRequest): Promise<string> => {
  let treeAppUrl = TREE_APP_URL;

  try {
    const slug = await getSpaceSlug(req);
    treeAppUrl = `${TREE_APP_URL}/${slug}/workspace/${TREE_INTEGRATION_ID}`;
  } catch (err) {
    console.error('Failed to generate tree app URI. Falling back to ', treeAppUrl);
  }

  const params = querystring.stringify(
    {
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: getRedirectUri(req.host),
      response_type: 'code',
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      state: toState({ treeAppUrl, userId: req.userId })
    }
  );

  return `${GOOGLE_AUTH_URL}?${params}`;
};

const refreshAccessToken = async (user: User): Promise<string> => {
  try {
    const response = await axios.post(
      GOOGLE_TOKEN_URL,
      querystring.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: user.googleAccessToken?.refreshToken,
        grant_type: 'refresh_token'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    return response.data.access_token;
  } catch (err) {
    throw err;
  }
};

export const authorizeUser = async (user: User): Promise<[User|null, boolean]> => {
  if (!user.googleAccessToken) return [null, false];

  try {
    await axios.get(
      `${GOOGLE_TOKEN_INFO_URL}?access_token=${user.googleAccessToken.accessToken}`
    );

    return [user, false];
  } catch (err) {
    console.debug('Access token is invalid, trying to refresh...');
    try {
      const accessToken = await refreshAccessToken(user);
      user.googleAccessToken.accessToken = accessToken;
      return [user, true];
    } catch (err) {
      console.debug('Failed to refresh access token');
      return [null, false];
    }
  }
};

export const handleAuthorizationCodeGrant = async (host: string, path: string): Promise<[User, string]> => {
  const parsed = url.parse(path, true);
  const params = parsed.query;

  if (!params) {
    throw new Error('Expecting query parameters');
  }

  const code = params.code;
  if (!code) {
    throw new Error('Missing `code` parameter');
  }

  let accessToken;
  let refreshToken;
  try {
    const response = await axios.post(
      GOOGLE_TOKEN_URL,
      querystring.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: getRedirectUri(host),
        code: code,
        grant_type: 'authorization_code'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
  } catch (err) {
    console.error('Failed to exchange authorization code: ', err);
    throw new Error('Failed to get access token');
  }

  const state = fromState(params.state as string);
  return [
    {
      userId: state.userId,
      googleAccessToken: {
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    },
    state.treeAppUrl
  ];
}
