# JnaanBot

A telegram app bot whose data could be customized by specifying different URL containing data.json.

## Setup Bot

### ENV variables

Set the following environmnet variables

```bash
DATA_URL="<url containing json data>"
NOTIFY_TIME="<Time at which notification should be sent>"
NOTIFY_MESSAGE="<Message to be notified>"
NOTIFY_RECEIVERS="<Recepients to be notified>"
RECEIVERS="<receiver1>, <receiver2>, ... <receiverN>"
SCHEDULE_URL="<url containing schedule data>"
# replace the value below with the Telegram token you receive from @BotFather
TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
```

### Sample JSONs

#### Query Data

The query data json must have queries as the keys, and it's values could either the string or an array consisting of `text` and `callback_data` as shown below...

```json
{
    "stories": [
        [
            {
                "text": "Kids Animated",
                "callback_data": "stories_kids_animated"
            }
        ],
        [
            {
                "text": "Sponsor",
                "callback_data": "stories_sponsor"
            }
        ]
    ],
    "stories_kids_animated": "[Kids section - Know Jainism through Stories - Playlist](https://www.youtube.com/watch?v=HFtSMNrMeyQ&list=PLojk56IbG34w_f95WzPY0m51LE_Z2gSKU).",
    "vidhyanjali": "Vidhyanjali:\n Video: https: //youtu.be/4t-kxa38KG4."
}
```

#### Schedule

The schedule json should contain the key as month and date in the `mm-dd` format, and it's value should be a list of objects consisting of `Title` and `Description`.

```json
{
    "07-19": [
        {
            "Title": "Ashtanika Parva",
            "Description": "Ashtanika Parva"
        }
    ],
    "7-31": [
        {
            "Title": "Jul 31 event 1 title",
            "Description": "July 31st event 1 description"
        },
        {
            "Title": "Jul 31 event 2 title",
            "Description": "July 31st event 2 description"
        }
    ]
}
```
