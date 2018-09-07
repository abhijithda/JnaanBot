require("console-stamp")(console)
const myConfig = require('./config');
// replace the value below with the Telegram token you receive from @BotFather
// const token = '${TELEGRAM_BOT_TOKEN}';
const token = myConfig.token()
const myData = require('./getdata')
const dataURL = myConfig.data_URL()
const calender_lunar_URL = myConfig.calender_lunar_URL()
const calender_solar_URL = myConfig.calender_solar_URL()

const myTithi = require('./tithi')

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

  sendLunarCalenderEvent(recvs, 1)
  sendSolarCalenderEvent(recvs)
}

// Implements Tithi command and also sends out notifications based on tithi from the cron job.
function sendLunarCalenderEvent(recvs, cron) {
  var http = require('http');
  console.log("Entering sendLunarCalenderEvent() to ...", recvs)

  var options = {
    host: 'panchangam.org',
    path: '/'
  }

  var request = http.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', async function () {
      // console.log(data);
      var xpath = require('xpath')
        , dom = require('xmldom').DOMParser
      var doc = new dom().parseFromString(data)

      // console.log(nodes[0].localName + ": " + nodes[0].firstChild.data)
      // console.log("Node: " + nodes[0].toString())
      var masa = "", paksha = "", tithi = -1, day = ""
      var masa_nodes = xpath.select("/html[1]/body[1]/div[1]/div[2]/div[1]/div[4]/table[1]/tbody[1]/tr[2]/td[2]", doc)
      masa = masa_nodes[0].firstChild.data
      console.log("Masa:", masa)

      var paksha_nodes = xpath.select("/html[1]/body[1]/div[1]/div[2]/div[1]/div[4]/table[1]/tbody[1]/tr[3]/td[2]", doc)
      paksha = paksha_nodes[0].firstChild.data
      paksha = paksha.split(" ")[0]
      console.log("Paksha:", paksha)

      var tithi_nodes = xpath.select("/html[1]/body[1]/div[1]/div[2]/div[1]/div[4]/table[1]/tbody[1]/tr[4]/td[2]", doc)
      tithi_info = tithi_nodes[0].firstChild.data
      tithi_name = tithi_info.split(" ")[0]
      tithi = myTithi.getTithiNumber(tithi_name)
      console.log("Tithi: %s(%d)", tithi_name, tithi)
      day = masa + '-' + paksha + '-' + tithi
      console.log("Day:", day)

      // NOTE:
      //  For `/tithi` command: Send any events along with tithi info for the command.
      //  For Cron: Send event details if any...
      var msgs = []

      if (!cron) {
        console.log("Sending today's masa, paksha and tithi details for /tithi command...")
        msgs.push('*' + masa + ' masa ' + paksha + ' paksha ' + tithi_name + '*')
      }

      days = [
        masa + '-' + paksha + '-' + tithi,
        masa + '-' + paksha + '-*',
        masa + '-*-' + tithi,
        masa + '-*-*',
        '*-' + paksha + '-' + tithi,
        '*-' + paksha + '-*',
        '*-*-' + tithi,
        '*-*-*',
      ]

      jsonData = await myData.getJsonDataFromUrl(calender_lunar_URL)
      for (d in days) {
        var events = myData.getKeyDataFromHash(jsonData, days[d])
        console.log("Lunar Scheduled Events: ", events)
        for (e in events) {
          msgs.push(day + ": *" + events[e]["Title"] + "*\n" + events[e]["Description"])
        }
      }
      if (cron && msgs.length == 0) {
        console.log("No events present.")
        return 0
      }

      for (m in msgs) {
        for (r in recvs) {
          var msg = msgs[m]
          console.log("Sending notification message " + msg + " to reciever " + recvs[r])
          bot.sendMessage(recvs[r], msg, { parse_mode: "Markdown" }).catch((error) => {
            console.log(error.code);  // => 'ETELEGRAM'
            console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
            // bot.sendMessage(msg.chat.id, error.response.body.description)
          });
        }
      }
    });
  });

  request.on('error', function (e) {
    console.log(e.message);
  });
  request.end();
}


async function sendSolarCalenderEvent(recvs) {
  // getMonth returns from 0-11, so add 1.
  var mm = new Date().getMonth() + 1
  var dd = new Date().getDate()
  var mm_dd = mm + '-' + dd

  var events = await myData.getSchedule(calender_solar_URL, mm_dd)
  // console.log("Solar Scheduled Events: ", events)
  for (e in events) {
    msg = mm_dd + ": *" + events[e]["Title"] + "*\n" + events[e]["Description"]
    for (r in recvs) {
      console.log("Sending notification message " + msg + " to reciever " + recvs[r])
      bot.sendMessage(recvs[r], msg, { parse_mode: "Markdown" }).catch((error) => {
        console.log(error.code);  // => 'ETELEGRAM'
        console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
        // bot.sendMessage(msg.chat.id, error.response.body.description)
      });
    }
  }
}

async function get_contents(cur_topic) {
  console.log("Current topic: " + cur_topic)
  var topics
  var send_msg = 0
  var new_msg = ""

  topics = await myData.getData(dataURL, cur_topic)
  // console.log("topics from getData: ", topics)

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

  // console.log("Message: ", new_msg)
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
    if (msgdata.length == 0) {
      // console.log("No data available to send for %s from %s!", cmd, dataURL)
      return
    }
    bot.sendMessage(msg.chat.id, msgdata, { parse_mode: "Markdown", reply_to_message_id: msg.message_id }).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(msg.chat.id, error.response.body.description)
    });
  }
  else {
    bot.sendMessage(msg.chat.id, msg.text, msgdata).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(msg.chat.id, error.response.body.description)
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
      bot.sendMessage(msg.chat.id, error.response.body.description)
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
  bot.unbanChatMember(chatId, msg.from.id).catch((error) => {
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
  console.log("Sending lunar calender info...")
  recvs = [msg.chat.id]
  sendLunarCalenderEvent(recvs, 0)
});


// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  console.log("Message recieved: ", msg)
  const chatId = msg.chat.id;

  var send_msg = 1
  var welcome_msg = 0
  var send_audio = 0
  rmsg = ""

  if (Object.prototype.toString.call(msg.new_chat_members) != '[object Undefined]') {
    console.info("New user joined...")
    for (m in msg.new_chat_members) {
      rmsg += "\n*ಜೈ ಜಿನೇಂದ್ರ* 🙏 *जय जिनेन्द्र* 🙏 *Jai Jinendra* 🙏 " +
        msg.new_chat_members[m].first_name + " " + msg.new_chat_members[m].last_name +
        "(@" + msg.new_chat_members[m].username + ")!"
    }
    send_msg = 1
    welcome_msg = 1
  }

  if (Object.prototype.toString.call(msg.left_chat_member) != '[object Undefined]') {
    console.info("User left...")
    rmsg += "\nMichchhāmi Dukkaḍaṃ 🙏 " +
      msg.left_chat_member.first_name + " " + msg.left_chat_member.last_name +
      "(@" + msg.left_chat_member.username + ")!"
    send_msg = 1
  }

  if (Object.prototype.toString.call(msg.text) != '[object Undefined]') {
    switch (msg.text.toString().toLowerCase()) {
      // Greetings here...
      case "hi":
      case "hello":
      case "jj":
      case "jai jinendra":
        rmsg = "ಜೈ ಜಿನೇಂದ್ರ 🙏 जय जिनेन्द्र 🙏 Jai Jinendra 🙏"
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
  }
  if (send_msg == 1 && rmsg.length != 0) {
    console.info("Sending message: ", rmsg)
    bot.sendMessage(chatId, rmsg, {
      reply_to_message_id: msg.message_id, parse_mode: "Markdown"
    }).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
    send_msg = 0
    if (welcome_msg) {
      msg.text = "/welcome"
      runCmd(msg)
      msg.text = ""
      welcome_msg = 0
    }
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
