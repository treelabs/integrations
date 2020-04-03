import querystring from 'querystring';
import axios from 'axios';
import moment from 'moment-timezone';
import { User, Event } from '../types';

export const userTimezone = async (user: User): Promise<string> => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/users/me/settings/timezone',
      {
        headers: {
          'Authorization': `Bearer ${user.googleAccessToken?.accessToken}`
        }
      }
    );
    return response.data.value;
  } catch (err) {
    console.error('Error fetching user timezone: ', err);
    return 'UTC';
  }
};

export const todaysEvents = async (user: User, timezone: string): Promise<Array<Event>> => {
  try {
    const today = moment.tz(new Date(), timezone);
    const params = querystring.stringify({
      timeMin: today.format(),
      timeMax: today.endOf('day').format()
    });

    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${user.googleAccessToken?.accessToken}`
        }
      }
    );

    return (response.data.items as Array<Event>).sort(
      (a, b) => moment.tz(a.start.dateTime, timezone).diff(moment.tz(b.start.dateTime, timezone))
    );
  } catch (err) {
    throw err;
  }
};
