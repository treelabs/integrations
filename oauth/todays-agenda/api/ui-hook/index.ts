import { NowRequest, NowResponse } from '@now/node';
import moment from 'moment-timezone';
import { User, TreeRequest, Event } from '../../lib/types';
import { fetchUser, saveUser } from '../../lib/db';
import { authorizeUser, getAuthorizeUrl } from '../../lib/oauth';
import { userTimezone, todaysEvents } from '../../lib/gcal';
import { verifyTreeRequest } from '../../lib/tree';

const asTreeRequest = (req: NowRequest): TreeRequest => {
  const host = req.headers['host'] as string;
  const accessToken = req.headers['x-tree-access-token'] as string;
  const payload = req.body;

  return {
    accessToken,
    host,
    userId: payload['user_id'],
    spaceId: payload['space_id'],
    installationId: payload['installation_id'],
    permissions: payload['permissions'],

  };
};

const formatEvent = (event: Event, timezone: string, isFirst?: boolean): Array<any> => {
  const blocks = [];
  const eventMessage = `[${event.summary}](${event.htmlLink})`;

  if (isFirst) {
    blocks.push(...[
      { type: 'heading2', value: moment.tz(event.start.dateTime, timezone).fromNow() },
      { type: 'text', value: eventMessage },
    ]);
  } else {
    blocks.push(...[
      { type: 'heading2', value: moment.tz(event.start.dateTime, timezone).format('h:mm a') },
      { type: 'text', value: eventMessage }
    ]);
  }
  return blocks;
};

const authorizePage = async (req: TreeRequest): Promise<object> => {
  const authorizeUrl = await getAuthorizeUrl(req);
  return {
    blocks: [
      { type: 'text', value: 'To see events from your Google calendar, please **click the authorize** button below.' },
      {
        type: 'button',
        value: 'Authorize',
        attrs: {
          onClick: {
            action: 'open',
            payload: {
              url: authorizeUrl
            }
          }
        }
      }
    ]
  };
};

const mainPage = async (user: User): Promise<object> => {
  let events: Array<Event>;
  const timezone = await userTimezone(user);
  try {
    events = await todaysEvents(user, timezone);
  } catch (err) {
    console.error('Failed to fetch events: ', err);
    return [
      { type: 'text', value: 'Failed to fetch events' }
    ];
  }

  const blocks = [
    { type: 'heading1', value: 'Today\'s agenda' }
  ];
  if (events.length > 0) {
    blocks.push(...formatEvent(events[0], timezone, true));
    events.slice(1,).forEach( (event: Event) => blocks.push(...formatEvent(event, timezone)) );
  } else {
    blocks.push({ type: 'text', value: 'No agenda. You\'re free today.' });
  }
  return { blocks };
};

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    res.writeHead(405, 'Not allowed');
    res.end();
    return;
  }

  if (!verifyTreeRequest(req)) {
    res.writeHead(400, 'Request verification failed');
    res.end();
    return;
  }

  const treeReq = asTreeRequest(req);
  let user: User;
  try {
    user = await fetchUser(treeReq);
  } catch (err) {
    console.error('Failed to fetch user: ', err);
    res.writeHead(500, 'Failed to fetch user');
    res.end();
    return;
  }

  const [authUser, isUpdated] = await authorizeUser(user);
  if (!authUser) {
    res.json(await authorizePage(treeReq));
    return;
  }

  if (isUpdated) {
    try {
      await saveUser(authUser);
    } catch (err) {
      console.error('Failed to save user: ', err);
      res.writeHead(500, 'Failed to save user');
      res.end();
      return;
    }
  }

  res.json(await mainPage(authUser))
};
