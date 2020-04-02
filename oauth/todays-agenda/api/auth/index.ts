import { NowRequest, NowResponse } from '@now/node';
import { handleAuthorizationCodeGrant } from '../../lib/oauth';
import { saveUser } from '../../lib/db';

export default async (req: NowRequest, res: NowResponse) => {
  const host = req.headers.host;
  const url = req.url;
  if (!url || !host) {
      res.writeHead(400, 'Invalid URL');
      res.end();
      return;
  }

  try {
    const [user, redirectUrl ] = await handleAuthorizationCodeGrant(host, url);

    try {
      await saveUser(user);
    } catch (err) {
      console.error('Failed to save user: ', err);
      res.writeHead(500, 'Failed to save user');
      res.end();
      return;
    }

    res.writeHead(302, {
      'Location': redirectUrl
    });
    res.end();
    return;
  } catch (err) {
    console.error('Failed to handle authorization code: ', err);
    res.writeHead(500, 'Failed to handle authorization code');
    res.end();
    return;
  }
};
