const myConfig = require('./config');
// replace the value below with the Telegram token you receive from @BotFather
// const token = '${TELEGRAM_BOT_TOKEN}';
const token = myConfig.token()

process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

var CronJob = require('cron').CronJob;
try {
  var job = new CronJob({
    cronTime: myConfig.notify_time(),
    onTick: function () {
      recvs = myConfig.notify_receivers()
      msg = myConfig.notify_message()
      for (r in recvs) {
        console.log("Sending notification message " + msg + " to reciever " + recvs[r])
        bot.sendMessage(recvs[r], msg)
      }
    },
    start: true,
    timeZone: 'America/Los_Angeles'
  })
} catch (ex) {
  console.log("cron pattern not valid");
};

function get_contents(cur_topic) {
  console.log("Current topic: " + cur_topic)
  var topics = [];
  var send_msg = 0
  var new_msg = ""

  if (cur_topic == '/events') topics = [
    { text: "Religious", callback_data: "religious" },
    { text: "Social", callback_data: "social" }
  ]
  if (cur_topic == 'religious') topics = [
    { text: "Ashtanika Parva", callback_data: "ashtanika" }
  ]
  if (cur_topic == 'ashtanika') topics = [
    { text: "Date & Pooja Details", callback_data: "Ashtanika Details:" },
  ]
  if (cur_topic == 'Ashtanika Details:') {
    send_msg = 1;
    new_msg = `
    Ashtanika Parva from July 19 thru 27, 2018.
    
    During this time celestial beings go to the Nandishwar dweep to do puja of Jinendra Bhagwaan. We human beings cannot go there, so we all go to our temple and do the puja at our temples.

    This year we will do the NandishwarDweep Vidhaan during the Ashtanika Parva.

    The vidhaan pooja will start after Jinendra Abhishek at 7 AM.

    Please plan to take dharam laabh and confirm your attendance by signing your name on the sign-up sheet at the temple. We will need volunteers to prepare for the vidhaan puja thalis etc., so please also sign-up for the same.

    Vidhaan schedule:
    Dates: July 19 to July 27.

    Weekdays:
    Vidhaan puja 6:30 AM to  8:30 AM
    Weekends: (July 21 and 22)
    Vidhaan puja 7:30 AM to  10:00 AM

    P.S. In case Vidhaan is not completed, on the last day Friday July 27, we may continue beyond 8:30 AM.`
  }
  if (cur_topic == '/initiatives') topics = [
    [
      { text: "Arham Yoga", callback_data: "arham_yoga" },
      { text: "Bhakthi", callback_data: "bhakthi" },
      { text: "Classes", callback_data: "/classes" },
    ], [
      { text: "Hathkargha", callback_data: "hathkargha" },
      { text: "Kind Milk", callback_data: "kindmilk" },
      { text: "Vidhyanjali", callback_data: "vidhyanjali" }
    ]
  ]
  if (cur_topic == 'arham_yoga') {
    send_msg = 1
    new_msg = "To know more or join to Arham Yoga classes, please Contact: @charu ji."
  }
  if (cur_topic == 'bhakthi') {
    topics = [
      { text: "Timings", callback_data: "bhakthi_about" },
      { text: "Contact", callback_data: "bhakthi_contact" }
    ]
  }
  if (cur_topic == 'bhakthi_about') {
    send_msg = 1
    new_msg = `
Bhakthi Timings:
    Every (almost every!) Thursdays' 8 PM to 9 PM.
    `
  }
  if (cur_topic == 'bhakthi_contact') {
    send_msg = 1
    new_msg = "To know more or to join Thursday's Bhakthi, please Contact: @bhumika ji or @surbhi ji."
  }
  if (cur_topic == '/classes') topics = [
    { text: "Weekday", callback_data: "weekday_classes" },
    { text: "Weekend", callback_data: "weekend_classes" }
  ]
  if (cur_topic == 'weekday_classes') topics = [
    { text: "Cha-dhal Morning Classes", callback_data: "chadhal_morning" },
    { text: "Cha-dhal Evening Classes", callback_data: "chadhal_evening" }
  ]
  if (cur_topic == 'weekend_classes') topics = [
    { text: "Sunday Morning Swadhay Class at Temple", callback_data: "sunday_swadhya_at_temple" },
    { text: "Sunday Morning Swadhay Class online", callback_data: "sunday_swadhya_online" },
  ]
  if (cur_topic == 'sunday_swadhya_online') {
    send_msg = 1
    new_msg = "For Sunday Swadhya Online class, please Contact: @shrish ji for details."
  }
  if (cur_topic == 'sunday_swadhya_at_temple') {
    send_msg = 1
    new_msg = "For Sunday Swadhya class at temple, please Contact: @parag ji or @ruchi ji for details."
  }
  if (cur_topic == 'hathkargha') {
    send_msg = 1
    new_msg = "To know more about Hathkargha, please Contact: @charu ji, @ruchi ji or @gourav ji for details."
  }
  if (cur_topic == 'kindmilk') topics = [
    { text: "About", callback_data: "kindmilk_about" },
    { text: "Contact", callback_data: "kindmilk_contact" }
  ]
  if (cur_topic == 'kindmilk_contact') {
    send_msg = 1
    new_msg = "To know more about Kind Milk project, please Contact: @parag ji or @shaily ji for details."
  }

  console.log("Send msg", send_msg)
  if (send_msg == 0 || new_msg.length == 0) {
    var json_data = {}
    // if (topics.length == 0 && cur_topic != "Data is not available") {
    //   topics = [{ text: "Data is not available.", callback_data: "Data is not available" }]
    // }
    if (topics.length != 0) {
      if (typeof (topics[0]) == 'string') {
        topics = [topics]
      }
      json_data = {
        inline_keyboard: topics
      }
      console.log("JSON data: ", json_data)
      return [send_msg, {
        reply_markup: JSON.stringify(
          json_data
        )
      }];
    } else {
      send_msg = 1;
      new_msg = " I don't have any details of '" + cur_topic +
        "' yet. Please check with group for the details."
    }
  }
  console.log("Message: ", new_msg)
  return [send_msg, new_msg]
}

function runCmd(msg) {
  var msgTxt = msg.text.split("@")
  var cmd = msgTxt[0]
  console.log("Running command: ", cmd)
  var resp = get_contents(cmd)
  send_msg = resp[0]
  msgdata = resp[1]
  console.log("Command result: ", msgdata)
  bot.sendMessage(msg.chat.id, msg.text, msgdata).catch((error) => {
    console.log(error.code);  // => 'ETELEGRAM'
    console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
    bot.sendMessage(chatId, error.response.body.description)
  });
}

bot.onText(/\/help/, (msg) => {
  msgdata = `

Following commands are available: 

  /classes - show swadhay classes.
  /events - show upcoming events.
  /initiatives - show initiatives group members are associated with.
  /improvebot - join the BotDev group to help improve it's abilities.
  /tithi - show today's tithi
`

  bot.sendMessage(msg.chat.id, msgdata).catch((error) => {
    console.log(error.code);  // => 'ETELEGRAM'
    console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
    bot.sendMessage(chatId, error.response.body.description)
  });
});

bot.onText(/\/improvebot/, (msg) => {
  msgdata =
    `
  Appreciated your interest in improving this Bot 👍. 
  Join @DJSanghBotDev group to coordinate with people to help improve the bot.
`

  bot.sendMessage(msg.chat.id, msgdata).catch((error) => {
    console.log(error.code);  // => 'ETELEGRAM'
    console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
    bot.sendMessage(chatId, error.response.body.description)
  });
});

bot.onText(/\/events/, (msg) => {
  runCmd(msg)
});

bot.onText(/\/classes/, (msg) => {
  runCmd(msg)
});

bot.onText(/\/initiatives/, (msg) => {
  runCmd(msg)
});

bot.on('callback_query', function (message) {
  console.log("callback_query message: ", message)
  var msg = message.message;
  var resp = get_contents(message.data)
  send_msg = resp[0]
  msgdata = resp[1]
  // msgdata = resp
  console.log("callback_query message data: ", msgdata)
  var editOptions = Object.assign({}, msgdata, { chat_id: msg.chat.id, message_id: msg.message_id });
  bot.editMessageText(message.data, editOptions);
  if (send_msg) {
    msgdata = "Providing details to " + message.from.first_name + " (@" + message.from.username + ") " + `

     `+ msgdata
    bot.sendMessage(msg.chat.id, msgdata).catch((error) => {
      console.log(error.code);  // => 'ETELEGRAM'
      console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: ...' }
      bot.sendMessage(chatId, error.response.body.description)
    });
  }
});

bot.onText(/\/Panchaparamesti/, (msg) => {
  bot.sendMessage(msg.chat.id, "Pancha Paramestis", {
    "reply_markup": {
      "keyboard": [["Siddha"], ["Sadhu", "Arihanta", "Acharya"], ["Updhaya"]],
      'one_time_keyboard': true
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

bot.onText(/\/get_tithi/, (msg) => {
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
    bot.sendMessage(chatId, rmsg)
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
