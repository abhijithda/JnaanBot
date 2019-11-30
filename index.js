require("console-stamp")(console)

const myConfig = require('./config');
const events = require('./events')

// replace the value below with the Telegram token you receive from @BotFather
// const token = '${TELEGRAM_BOT_TOKEN}';
const token = myConfig.token()
const myData = require('./getdata')
const dataURL = myConfig.data_URL()
const calender_lunar_URL = myConfig.calender_lunar_URL()
const calender_amavasyaanta_URL = myConfig.calender_amavasyaanta_URL()
const calender_solar_URL = myConfig.calender_solar_URL()

process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

var CronJob = require('cron').CronJob;
try {
  var job = new CronJob({
    // cronTime is in following format: "ss mm hh dd mon dwk"
    // Seconds: 0-59
    // Minutes: 0-59
    // Hours: 0-23
    // Day of Month: 1-31
    // Months: 0-11 (Jan-Dec)
    // Day of Week: 0-6 (Sun-Sat)
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

function getMessagesOfEvents(msgs, events) {
  console.log("Entering getMessagesOfEvents() with ...", events)
  for (e in events) {
    var strDesc = ""
    var desc = events[e]["Description"]
    if (Object.prototype.toString.call(desc) == '[object String]') {
      strDesc = desc
    } else if ((Object.prototype.toString.call(desc) == '[object Object]') ||
      (Object.prototype.toString.call(desc) == '[object Array]')) {
      strDesc = desc.join("\n")
    }
    msgs.push(days[d] + ": *" + events[e]["Title"] + "*\n" + strDesc)
  }
  console.log("Exiting getMessagesOfEvents() with ...", msgs)
}

// Implements Tithi command and also sends out notifications based on tithi from the cron job.
function sendLunarCalenderEvent(recvs, cron) {
  console.log("Entering sendLunarCalenderEvent() to ...", recvs)

  const myPanchang = require('./panchang')
  myPanchang.getPanchangInfo().then(info => {
    // console.log("Info: ", info)
    // Using Purnimanta masa for checking calender events as events are based Purnimanta.
    masa = info["Purnimanta Month"]
    paksha = info["Paksha"]
    tithi_info = info["Tithi"]
    tithi_name = tithi_info.split(" ")[0]
    tithi = myPanchang.getTithiNumber(tithi_name)
    console.log("Purnimanta Masa:", info["Purnimanta Month"])
    console.log("Amanta Masa:", info["Amanta Month"])
    console.log("Paksha:", paksha)
    console.log("Tithi: %s(%d)", tithi_name, tithi)

    // NOTE:
    //  For `/tithi` command: Send any events along with tithi info for the command.
    //  For Cron: Send event details if any...
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

    myData.getJsonDataFromUrl(calender_amavasyaanta_URL).then(jsonData => {
      var msgs = []
      for (d in days) {
        var events = myData.getKeyDataFromHash(jsonData, days[d])
        console.log("Amavasyaanta Events: ", events)
        getMessagesOfEvents(msgs, events)
      }
      if (cron && msgs.length == 0) {
        console.log("No events present.")
        return 0
      }

      msgs.unshift('*' + info["Amanta Month"] + ' Amanta-masa ' +
        paksha + ' paksha ' + tithi_info + '*')
      var msg = ""
      for (m in msgs) {
        msg += msgs[m] + "\n"
      }
      for (r in recvs) {
        console.log("Sending notification message " + msg + " to reciever " + recvs[r])
        bot.sendMessage(recvs[r], msg, { parse_mode: "Markdown" }).catch((error) => {
          console.error(error.code);  // => 'ETELEGRAM'
          console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
          // bot.sendMessage(msg.chat.id, error.response.body.description)
        });
      }
    });

    myData.getJsonDataFromUrl(calender_lunar_URL).then(jsonData => {
      var msgs = []
      for (d in days) {
        var events = myData.getKeyDataFromHash(jsonData, days[d])
        console.log("Lunar Scheduled Events: ", events)
        for (e in events) {
          getMessagesOfEvents(msgs, events)
        }
      }
      if (cron && msgs.length == 0) {
        console.log("No events present.")
        return 0
      }

      if (!cron) {
        console.log("Sending today's masa, paksha and tithi details for /tithi command...")
      }
      if (info["Amanta Month"] == info["Purnimanta Month"]) {
        msgs.unshift('*' + info["Amanta Month"] + ' masa ' + paksha +
          ' paksha ' + tithi_info + '*')
      } else {
        msgs.unshift('*' + info["Purnimanta Month"] + ' Purnimanta-masa ' +
          paksha + ' paksha ' + tithi_info + '*')
      }
      var msg = ""
      for (m in msgs) {
        msg += msgs[m] + "\n"
      }
      for (r in recvs) {
        console.log("Sending notification message " + msg + " to reciever " + recvs[r])
        bot.sendMessage(recvs[r], msg, { parse_mode: "Markdown" }).catch((error) => {
          console.error(error.code);  // => 'ETELEGRAM'
          console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
          // bot.sendMessage(msg.chat.id, error.response.body.description)
        });
      }
    });
  });

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
        console.error(error.code);  // => 'ETELEGRAM'
        console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
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

async function runCmd(msg, opts) {
  var msgTxt = msg.text.split("@")
  var cmd = msgTxt[0]
  console.log("Running command: ", cmd)
  var resp = await get_contents(cmd)
  send_msg = resp[0]
  msgdata = resp[1]
  sendMessage2User(msg, msgdata, opts)
}

function sendMessage2User(msg, data, opts) {
  console.debug("Data to be sent:", data)
  var options = opts || {};
  console.debug("Options:", options)
  var id_to_send = options.id_to_send || msg.chat.id
  console.debug("Object type: ", Object.prototype.toString.call(data))

  if (Object.prototype.toString.call(data) == '[object String]') {
    if (data.length == 0) {
      // console.log("No data available to send for %s from %s!", cmd, dataURL)
      return
    }

    if (id_to_send == msg.chat.id) {
      bot.sendMessage(id_to_send, data, { parse_mode: "Markdown", reply_to_message_id: msg.message_id }).catch((error) => {
        console.error(error.code);  // => 'ETELEGRAM'
        console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
        bot.sendMessage(msg.chat.id, error.response.body.description)
      });
    } else {
      bot.sendMessage(id_to_send, data, { parse_mode: "Markdown" }).catch((error) => {
        console.error(error.code);  // => 'ETELEGRAM'
        console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
        bot.sendMessage(msg.chat.id, error.response.body.description)
      });
    }
  }
  else {
    bot.sendMessage(id_to_send, msg.text, data).catch((error) => {
      console.error(error.code);  // => 'ETELEGRAM'
      console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(msg.chat.id, error.response.body.description)
    });
  }
}

// Send keyboard option to user directly i.e., not to group.
function sendKBMessage2User(msg, title, data) {
  bot.sendMessage(msg.from.id, title, {
    "reply_markup": {
      // "keyboard": [["Siddha"], ["Sadhu", "Arihanta", "Acharya"], ["Updhaya"], [{ text: "Phone", request_contact: true }]],
      "keyboard": data,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });

}

bot.onText(/\/.*/, (cmd) => {
  runCmd(cmd)
});


bot.on('callback_query', async function (message) {
  console.log("callback_query message: ", message)
  var txt = message.data
  console.log("Received callback_data: ", txt);
  var fields = txt.split(":")
  if (fields) {
    // Drop action specifier i.e., fields before ":"
    fields.shift();
    var func_param = fields.join(':')
    var args = func_param.split(' ')
    func = args.shift()
    var params = args.join(',')
    console.log("Calling function - %s(%s)", func, params)
    if (func == 'events.signup') {
      events.signup(params, message, sendMessage2User, sendKBMessage2User);
      return
    } else if (func == 'events.confirmRegistration') {
      events.confirmRegistration(params, message, sendMessage2User);
      return
    }
  }
  var msg = message.message;
  var resp = await get_contents(message.data)
  send_msg = resp[0]
  msgdata = resp[1]
  console.log("callback_query message data: ", msgdata)
  if (send_msg) {
    msgdata = "_Providing details to " + message.from.first_name + "_ [(@" + message.from.username + ")](@" + message.from.username + ") "
      + `
    
`
      + msgdata
    bot.sendMessage(msg.chat.id, msgdata, { reply_to_message_id: msg.message_id, parse_mode: "Markdown" }).catch((error) => {
      console.error(error.code);  // => 'ETELEGRAM'
      console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(msg.chat.id, error.response.body.description)
    });
  } else {
    var editOptions = Object.assign({}, msgdata, { chat_id: msg.chat.id, message_id: msg.message_id });
    bot.editMessageText(message.data, editOptions);
  }
});

bot.onText(/\/Panchaparamesti/, (msg) => {
  bot.sendMessage(msg.from.id, "Pancha Paramestis", {
    "reply_markup": {
      // "inline_keyboard": [
      //   [{ text: "Siddha", callback_data: 'siddha' }],
      //   [{ text: "Saadhu",  callback_data: 'saadhu' }, { text: "Arihanta",  callback_data: 'arihanta' }, { text: "Acharya",  callback_data: 'acharya' }],
      //   [{ text: "Upadhaya",  callback_data: 'upadhaya' }],
      //   [{ text: "Phone", request_contact: true }]
      // ],
      "keyboard": [["Siddha"], ["Saadhu", "Arihanta", "Acharya"], ["Updhaya"], [{ text: "Phone", request_contact: true }]],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

bot.onText(/\/leave_group/, (msg) => {
  const chatId = msg.chat.id;
  bot.kickChatMember(chatId, msg.from.id).catch((error) => {
    console.error(error.code);  // => 'ETELEGRAM'
    console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
    bot.sendMessage(chatId, error.response.body.description)
  });
  bot.unbanChatMember(chatId, msg.from.id).catch((error) => {
    console.error(error.code);  // => 'ETELEGRAM'
    console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
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


// Main like function for events signup here!
bot.onText(/\/events$/, async function (msg) {
  // 'msg' is the received Message from Telegram
  console.log("COMMAND: /events")
  // recvs = [msg.chat.id]
  console.log(msg.text, "from", msg.from.first_name, msg.from.last_name, msg.from.id)
  await events.getEvents(msg, sendMessage2User)
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
  var send_audio = 0
  rmsg = ""

  if (Object.prototype.toString.call(msg.new_chat_members) != '[object Undefined]') {
    console.debug("New users joined...")

    // for (m in msg.new_chat_members) {
    //   rmsg += "\n*ಜೈ ಜಿನೇಂದ್ರ* 🙏 *जय जिनेन्द्र* 🙏 *Jai Jinendra* 🙏 " +
    //     msg.new_chat_members[m].first_name + " " + msg.new_chat_members[m].last_name +
    //     "[(@" + msg.new_chat_members[m].username + ")](@" + msg.new_chat_members[m].username + ")!"
    //   sendMessage2User(msg, rmsg, { id_to_send: msg.new_chat_members[m].id })

    //   msg.text = "/welcome"
    //   runCmd(msg, { id_to_send: msg.new_chat_members[m].id })
    //   msg.text = ""
    // }
    return;
  }

  if (Object.prototype.toString.call(msg.left_chat_member) != '[object Undefined]') {
    console.info("User left...")
    rmsg = "\nMichchhāmi Dukkaḍaṃ 🙏 " +
      msg.left_chat_member.first_name + " " + msg.left_chat_member.last_name + "!"
    sendMessage2User(msg, rmsg, { id_to_send: msg.left_chat_member.id })
    return
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
      console.error(error.code);  // => 'ETELEGRAM'
      console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
    send_msg = 0
    // return
  }
  if (send_audio) {
    var song = "/Users/abhijith.da/desktop backup/songs/karishma nagda/jeni aankho prasam zarti.mp3"
    bot.sendMessage(chatId, "Sending song: " + song)
    console.log("Sending audio " + song)

    bot.sendAudio(chatId, song).catch((error) => {
      console.error(error.code);  // => 'ETELEGRAM'
      console.error(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
    return
  }

  // send a message to the chat acknowledging receipt of their message
  // bot.sendMessage(chatId, chatId.toString() + '...!');
  // bot.sendMessage(chatId, '...!');

  // getUserProfilePhotos(chatId)
});

function callback_data_encode(json_data) {
  console.log("In function callback_data_encode()...")

  var json_str = JSON.stringify(json_data)
  return json_str
}

function callback_data_decode(json_str) {
  console.log("In function callback_data_decode()...")

  var json_data = JSON.parse(json_str)
  return json_data
}