export type TreeRequest = {
  userId: string;
  spaceId: string;
  installationId: string;
  permissions: string;
  accessToken: string;
  host: string;
}

export type GoogleAccessToken = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  userId: string;
  googleAccessToken?: GoogleAccessToken;
};

// ref: https://developers.google.com/calendar/v3/reference/events#resource
export type EventDate = {
  date: string;
  dateTime: string;
  timeZone: string;
};

export type Event = {
  id: string;
  created: string;
  updated: string;
  summary: string;
  htmlLink: string;
  start: EventDate;
  end: EventDate;
};
