#!/bin/bash

set -x;

LANG=en_US.UTF-8
LC_CTYPE=en_US.UTF-8

receivers=${NOTIFY_RECEIVERS[@]}
echo "Sending notification to ${NOTIFY_RECEIVERS[@]}..."
text=${NOTIFY_MESSAGE:-"Jai Jinendra 🙏 !"}
receivers=${NOTIFY_RECEIVERS}
token=${TOKEN}

# To get chat ID, first sent msg from that ID, and then click on
# https://api.telegram.org/bot$token/getUpdates.

TIME="10"
sendMessageURL="https://api.telegram.org/bot$token/sendMessage"
# sendPollURL="https://api.telegram.org/bot$token/sendPoll"
echo "Sending notification to ${receivers[@]}."
for cid in ${receivers[@]}; do
    echo "Sending notification message \"$text\" to receiver \"${cid}\"..."
    # curl -s --max-time $TIME -d "chat_id=$cid&text=$text" $sendMessageURL >/dev/null
    curl -s --max-time $TIME -d "chat_id=$cid&disable_web_page_preview=1&text=$text" $sendMessageURL # >/dev/null
done

# song='/Users/abhijith.da/desktop backup/songs/karishma nagda/jeni aankho prasam zarti.mp3'
# song=/Users/abhijith.da/desktop\ backup/songs/karishma\ nagda/jeni\ aankho\ prasam\ zarti.mp3
# curl -d "chat_id=-1001296397891&audio=$song" https://api.telegram.org/bot$token/sendAudio