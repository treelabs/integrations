# Tree Integration: Contentful

A [UI Hook](https://treedocs.now.sh/docs/v1/hooks/ui/introduction/) serving pages created with [Contentful](https://www.contentful.com/).

## Prerequisites

- [Node.js](https://nodejs.org)
- [ngrok](https://ngrok.com)

## Run Locally

Run this UI Hook locally with:

```bash
npm start
```

Then create a tunnel to localhost on port 3000 using ngrok:

```bash
ngrok http 3000
```

Take note of the forwarding URL created by ngrok (ending in ".ngrok.io").

Then create a [Tree Integration](https://treedocs.now.sh/docs/v1/getting-started/) and set the UI Hook URL to the ngrok forwarding URL.

You can now log in to the Tree mobile app and see your Integration in action.

### Accessing FaunaDB

Create a file named `.env` and add the following:

```
FAUNADB_TYPEFORM_SECRET_KEY=<your_secret_key>
```

Make sure to gitignore this file.

## Deploying to Now

Add the FaunaDB secret key to Now:

```bash
now secrets add FAUNADB_TYPEFORM_SECRET_KEY <your_secret_key>
```

## UI Hook

An instance of this integration is running at:

```
https://tree-contentful-integration.now.sh
```

If you want to use this integration with a predefined Contentful entry, simply provide them in the URL of your integration's UI Hook:

```
https://tree-contentful-integration.now.sh?\
    spaceId=<your_contentful_space_id>&\
    accessToken=<your_contentful_access_token>&\
    entryId=<your_contentful_entry_id>
```