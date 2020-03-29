# Tree Integration: Typeform

A [UI Hook](https://treedocs.now.sh/docs/v1/hooks/ui/introduction/) serving forms created with [Typeform](https://www.typeform.com/).

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