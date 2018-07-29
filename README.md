# JnaanBot

A telegram app bot whose data could be customized by specifying different URL containing data.json.

## Usage

### Available Commands

```commands
classes - show swadhay classes.
events - show upcoming events
initiatives - show initiatives group members are associated with
improvebot - join the Bot group to help improve it's abilities
tithi - show today's tithi
```

## Setup Bot

### ENV variables

Set the following environmnet variables

```bash
# replace the value below with the Telegram token you receive from @BotFather
TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
RECEIVERS="<receiver1>, <receiver2>, ... <receiverN>"
DATA_URL="<url containing json data>"
NOTIFY_TIME="<Time at which notification should be sent>"
NOTIFY_MESSAGE="<Message to be notified>"
NOTIFY_RECEIVERS="<Recepients to be notified>"
```
