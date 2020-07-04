# Tree Integration: Today's Agenda

This example demonstrates how to fetch events from a user's Google Calendar via OAuth 2.0.

## Prerequisites

- [Node.js](https://nodejs.org)
- [Now CLI](https://zeit.co/download)
- [ngrok](https://ngrok.com)
- [Google OAuth Client Setup](https://console.developers.google.com)
- [FaunaDB](https://dashboard.fauna.com)

## Run Locally

Create a `.env` file with the variables specified in the `now.json` using the appropriate values
configured on the Google developer console and FaunaDB.

Then run this UI Hook locally with:

```bash
now dev
```

Then create a tunnel to localhost on port 3000 using ngrok:

```bash
ngrok http 3000
```

Take note of the forwarding URL created by ngrok (ending in ".ngrok.io").

Then create a [Tree Integration](https://treedocs.now.sh/docs/v1/getting-started/) and set the UI Hook URL to the ngrok forwarding URL.

You can now log in to the Tree mobile app and see your Integration in action.

## Deploying to Now

Add the secrets (values starting with `@`) referenced in `now.json`.

```bash
now secrets add @<secret-name> <secret-value>
```

Then deploy to Now, following the user prompts:

```bash
now
```

## License

The Tree documentation is an open source project released under the [MIT
License](https://github.com/treelabs/integrations/blob/master/LICENSE.md).
