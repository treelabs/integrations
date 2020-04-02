import querystring from 'querystring';
import axios from 'axios';
import moment from 'moment';
import { User, Event } from '../types';

const userTimezone = async (user: User): Promise<string> => {
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

export const todaysEvents = async (user: User): Promise<Array<Event>> => {
  try {
    const timezone = await userTimezone(user);
    const today = moment(new Date()).utcOffset(timezone);
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
      (a, b) => moment(a.start.dateTime).diff(moment(b.start.dateTime))
    );
  } catch (err) {
    throw err;
  }
};
