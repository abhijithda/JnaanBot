#!/bin/bash

LANG=en_US.UTF-8
LC_CTYPE=en_US.UTF-8

receivers=${NOTIFY_RECEIVERS}
text=${NOTIFY_MESSAGE:-"Jai Jinendra 🙏 !"}
token=${TOKEN}

# To get chat ID, first sent msg from that ID, and then click on
# https://api.telegram.org/bot$token/getUpdates.

TIME="10"
URL="https://api.telegram.org/bot$token/sendMessage"

for cid in ${receivers[@]}; do
    echo "Sending notification message \"$text\" to receiver \"${cid}\"..."
    # curl -s --max-time $TIME -d "chat_id=$cid&text=$text" $URL >/dev/null
    curl -s --max-time $TIME -d "chat_id=$cid&disable_web_page_preview=1&text=$text" $URL # >/dev/null
done

# song='/Users/abhijith.da/desktop backup/songs/karishma nagda/jeni aankho prasam zarti.mp3'
# song=/Users/abhijith.da/desktop\ backup/songs/karishma\ nagda/jeni\ aankho\ prasam\ zarti.mp3
# curl -d "chat_id=-1001296397891&audio=$song" https://api.telegram.org/bot$token/sendAudio