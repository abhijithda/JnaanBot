# JnaanBot

A telegram app bot which allows one to send event notifications based on either the solar or the lunar calender. The event data could be customized by specifying different CALENDER URLs containing data in json format.
It is also a chat bot, which allows providing answers to custom commands, and along with providing options to view even further details of answers through menu/list option. The menu/list or answers are based on the data already provided through data.json URL.

## Setup Bot

### ENV variables

Set the following environmnet variables

```bash
DATA_URL="<url containing json data>"
CALENDER_LUNAR_URL="<url containing lunar calender events data>"
CALENDER_SOLAR_URL="<url containing solar calender events data>"
CALENDER_AMAVASYAANTA_URL="<url containing amavasyaanta events data>"
NOTIFY_TIME="<Time at which notification should be sent>"
NOTIFY_MESSAGE="<Message to be notified>"
NOTIFY_RECEIVERS="<Recepients to be notified>" # Ex: "receiver1,receiver2,receiverN"
# replace the value below with the Telegram token you receive from @BotFather
TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
SHEET_ID="<Google sheet id>"
CLIENT_EMAIL="<email from service account json>"
PKEY="<private_key from service account json>"

# For Private key: refer https://www.npmjs.com/package/google-spreadsheet.
# Save your private key to a text file
# Replace \n with actual line breaks
# Replace \u003d with =
# heroku config:add GOOGLE_PRIVATE_KEY="$(cat yourfile.txt)"
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

The schedule json should contain the key as month and date in the `mm-dd` format, and it's value should be a list of objects consisting of `Title` and `Description`. The `Description` could be a string or a list.

```json
{
    "06-07": [
        {
            "Title": "Shurta Panchami",
            "Description": [
                "Shurta Panchami",
                "",
                ""
            ]
        }
    ],
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
