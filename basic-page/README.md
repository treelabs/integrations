# Tree Integration: Basic Page

A [UI Hook](https://treedocs.now.sh/docs/v1/hooks/ui/introduction/) serving a page with static [blocks](https://treedocs.now.sh/docs/v1/blocks/basic/).

## Prerequisites

- [Node.js](https://nodejs.org)
- [ngrok](https://ngrok.com)

## Run Locally

Run the UI Hook locally with:

```bash
node index.js 3000
```

Then create a tunnel to localhost on port 3000 using ngrok:

```bash
ngrok http 3000
```

Take note of the forwarding URL created by ngrok (ending in ".ngrok.io").

Then create a [Tree Integration](https://treedocs.now.sh/docs/v1/getting-started/) and set the UI Hook URL to the ngrok forwarding URL.

You can now log in to the Tree mobile app and see your Integration in action.
