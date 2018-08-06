const myConfig = require('./config');
// replace the value below with the Telegram token you receive from @BotFather
// const token = '${TELEGRAM_BOT_TOKEN}';
const token = myConfig.token()
const myData = require('./getdata')
const dataURL = myConfig.data_URL()
const calender_lunar_URL = myConfig.calender_lunar_URL()
const calender_solar_URL = myConfig.calender_solar_URL()

process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

var CronJob = require('cron').CronJob;
try {
  var job = new CronJob({
    cronTime: myConfig.notify_time(),
    onTick: function () {
      msg = sendEventMessage()
    },
    start: true,
    timeZone: 'America/Los_Angeles'
  })
} catch (ex) {
  console.log("cron pattern is not valid");
};

async function sendEventMessage() {
  var recvs = myConfig.notify_receivers()

  // getMonth returns from 0-11, so add 1.
  var mm = new Date().getMonth() + 1
  var dd = new Date().getDate()
  var mm_dd = mm + '-' + dd
  
  // TODO: Get tithi and pass it to getSchedule().
  var events = await myData.getSchedule(calender_lunar_URL, mm_dd)
  // console.log("Lunar Scheduled Events: ", events)
  for (e in events) {
    msg = mm_dd + ": *" + events[e]["Title"] + "*\n" + events[e]["Description"]
    for (r in recvs) {
      console.log("Sending notification message " + msg + " to reciever " + recvs[r])
      bot.sendMessage(recvs[r], msg, { parse_mode: "Markdown" })
    }
  }

  var events = await myData.getSchedule(calender_solar_URL, mm_dd)
  // console.log("Solar Scheduled Events: ", events)
  for (e in events) {
    msg = mm_dd + ": *" + events[e]["Title"] + "*\n" + events[e]["Description"]
    for (r in recvs) {
      console.log("Sending notification message " + msg + " to reciever " + recvs[r])
      bot.sendMessage(recvs[r], msg, { parse_mode: "Markdown" })
    }
  }
}

async function get_contents(cur_topic) {
  console.log("Current topic: " + cur_topic)
  var topics
  var send_msg = 0
  var new_msg = ""

  topics = await myData.getData(dataURL, cur_topic)
  console.log("topics from getData: ", topics)

  console.log(Object.prototype.toString.call(topics))
  if (Object.prototype.toString.call(topics) == '[object Undefined]') {
    send_msg = 1;
    new_msg = " I don't have any details of '" + cur_topic +
      "' yet. Please check with the group for the details."
  } else if (Object.prototype.toString.call(topics) == '[object String]') {
    send_msg = 1
    new_msg = topics
  } else if (topics.length != 0) {
    if (Object.prototype.toString.call(topics[0]) == '[object String]') {
      send_msg = 1
      new_msg = topics.join("\n")
    } else if ((Object.prototype.toString.call(topics[0]) == '[object Object]') ||
      (Object.prototype.toString.call(topics[0]) == '[object Array]')) {
      if (Object.prototype.toString.call(topics[0]) == '[object Object]') {
        topics = [topics]
      }
      var json_data = {
        inline_keyboard: topics
      }
      console.log("JSON data: ")
      console.log(json_data)
      return [send_msg, {
        reply_markup: JSON.stringify(
          json_data
        )
      }];
    }
  }

  console.log("Message: ", new_msg)
  return [send_msg, new_msg]
}

async function runCmd(msg) {
  var msgTxt = msg.text.split("@")
  var cmd = msgTxt[0]
  console.log("Running command: ", cmd)
  var resp = await get_contents(cmd)
  send_msg = resp[0]
  msgdata = resp[1]
  console.log("Command result: ", msgdata)
  if (Object.prototype.toString.call(msgdata) == '[object String]') {
    bot.sendMessage(msg.chat.id, msgdata, { parse_mode: "Markdown", reply_to_message_id: msg.message_id }).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
  }
  else {
    bot.sendMessage(msg.chat.id, msg.text, msgdata).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
  }
}

bot.onText(/\/.*/, (cmd) => {
  runCmd(cmd)
});


bot.on('callback_query', async function (message) {
  console.log("callback_query message: ", message)
  var msg = message.message;
  var resp = await get_contents(message.data)
  send_msg = resp[0]
  msgdata = resp[1]
  console.log("callback_query message data: ", msgdata)
  if (send_msg) {
    msgdata = "_Providing details to " + message.from.first_name + "_ (@" + message.from.username + ") " + `
    
`
      + msgdata
    bot.sendMessage(msg.chat.id, msgdata, { reply_to_message_id: msg.message_id, parse_mode: "Markdown" }).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
  } else {
    var editOptions = Object.assign({}, msgdata, { chat_id: msg.chat.id, message_id: msg.message_id });
    bot.editMessageText(message.data, editOptions);
  }
});

bot.onText(/\/Panchaparamesti/, (msg) => {
  bot.sendMessage(msg.chat.id, "Pancha Paramestis", {
    "reply_markup": {
      // "inline_keyboard": JSON.stringify([["Siddha"], ["Sadhu", "Arihanta", "Acharya"], ["Updhaya"]]}
      "keyboard": [["Siddha"], ["Sadhu", "Arihanta", "Acharya"], ["Updhaya"]],
      one_time_keyboard: true,
      // resize_keyboard: true
    }
  });
});

bot.onText(/\/leave_group/, (msg) => {
  const chatId = msg.chat.id;
  bot.kickChatMember(chatId, msg.from.id).catch((error) => {
    console.log(error.code);  // => 'ETELEGRAM'
    console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
    bot.sendMessage(chatId, error.response.body.description)
  });
});


// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/get_month/, (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;
  switch (new Date().getMonth() + 1) {
    case 1:
      mm = "January";
      break;
      break;
    case 2:
      mm = "February";
      break;
    case 3:
      mm = "March";
      break;
    case 4:
      mm = "April";
      break;
    case 5:
      mm = "May";
      break;
    case 6:
      mm = "June";
      break;
    case 7:
      mm = "July";
      break;
    case 8:
      mm = "August";
      break;
    case 9:
      mm = "September";
      break;
    case 10:
      mm = "October";
      break;
    case 11:
      mm = "November";
      break;
    case 12:
      mm = "December";
      break;
  }
  bot.sendMessage(chatId, mm);
});

bot.onText(/\/get_day/, (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;
  switch (new Date().getDay()) {
    case 0:
      day = "Sunday";
      break;
    case 1:
      day = "Monday";
      break;
    case 2:
      day = "Tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
  }
  bot.sendMessage(chatId, day);
});

bot.onText(/\/tithi/, (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "To Be Implemented! Need to gather data!!");
});


// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  var send_msg = 1
  var send_audio = 0
  switch (msg.text.toString().toLowerCase()) {
    // Greetings here...
    case "hi":
    case "hello":
    case "jj":
    case "jai jinendra":
      rmsg = "Jai Jinendra 🙏"
      break;

    case "bye":
    case "ciao":
    case "see you":
      rmsg = "Hope to see you around again, Bye"
      break;

    case "thanks":
    case "thank you":
      rmsg = "My pleasure 👍"
      break;

    case "leave group":
      rmsg = "Do you want to leave group? click here: /leave_group."
      break;
    case "play song":
      send_audio = 1
      send_msg = 0
      break
    default:
      send_msg = 0
      break;
  }
  if (send_msg) {
    bot.sendMessage(chatId, rmsg,
      {
        reply_to_message_id: msg.message_id
      }
    )
    // return
  }
  if (send_audio) {
    var song = "/Users/abhijith.da/desktop backup/songs/karishma nagda/jeni aankho prasam zarti.mp3"
    bot.sendMessage(chatId, "Sending song: " + song)
    console.log("Sending audio " + song)

    bot.sendAudio(chatId, song).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
    return
  }

  // send a message to the chat acknowledging receipt of their message
  // bot.sendMessage(chatId, chatId.toString() + '...!');
  // bot.sendMessage(chatId, '...!');

  // getUserProfilePhotos(chatId)
});
