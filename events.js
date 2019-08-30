'use strict';

const myConfig = require('./config');

var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

module.exports = {
    getEvents,
    signup
}

// spreadsheet key is the long id in the sheets URL
// var doc = new GoogleSpreadsheet('<spreadsheet key>');
// var doc = new GoogleSpreadsheet('1nEtWyd2GZtoDeKDt1eUbpaXx1o1uN8kFabv-sgFO1GQ');
var doc = new GoogleSpreadsheet(myConfig.sheet_id());
var gsheets

async.series([
    function setAuth(step) {
        // see notes below for authentication instructions!
        // var creds = require('./google-generated-creds.json');
        // var creds = require('./service-account.json');
        // OR, if you cannot save the file locally (like on heroku)
        // var creds_json = {
        //   client_email: 'yourserviceaccountemailhere@google.com',
        //   private_key: 'your long private key stuff here'
        // }
        var creds = {
            client_email: myConfig.client_email(),
            private_key: myConfig.pkey(),
        }
        doc.useServiceAccountAuth(creds, function (err) {
            if (err) {
                console.log("Error while authenticating:")
                console.log(err);
                return;
            }
            step()
        });
    },

    function getInfoAndWorksheets(step) {
        doc.getInfo(function (err, info) {
            if (err) {
                console.log(err);
                return;
            }
            // console.log("Info: ", info)
            console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
            gsheets = info.worksheets
            step();
        });
    },
])

function isSheetPresent(name, cb) {
    console.log("In isSheetPresent(%s)...", name)
    for (var s in gsheets) {
        console.log("Checking if %s is %s", gsheets[s].title, name)
        if (gsheets[s].title == name) {
            var sheet = gsheets[s]
            console.log("sheet present: ", sheet.title)
            if (cb) {
                return cb(null, sheet)
            }
            return null, sheet
        }
    }
    if (cb) {
        return cb(new Error("sheet" + name + "not found."))
    }
    return new Error("sheet %s not found.", name)
}

async function getEvents(msg, sendMessage2User) {
    console.log("In events.getEvents()...")

    var sheet
    var events = [];
    async.series([
        function getEventsSheet(done) {
            var err
            err, sheet = isSheetPresent("events");
            if (err) {
                done(err)
            }
            // console.log("Sheet info:", sheet)
            sheet.getRows({
                offset: 1,
            }, function (err, rows) {
                if (err) {
                    console.log(err)
                    done(err)
                }
                console.log('Read ' + rows.length + ' rows')
                // console.log(rows);
                for (var r in rows) {
                    console.log("Event:", rows[r].name)
                    events.unshift(rows[r].name)
                }
                done()
            })
        },

        function sendEvents(done) {
            var aevents = [];
            for (var e in events) {
                aevents.unshift([{ 'text': events[e], 'callback_data': "func:events.signup " + events[e] }])
            }
            var json_data = {
                inline_keyboard: aevents
            }

            console.log("JSON data: ")
            console.log(json_data)
            var data = {
                reply_markup: JSON.stringify(
                    json_data
                )
            };

            sendMessage2User(msg, data)
        },

    ], function (err) {
        console.log(err) // "another thing"
    });

    console.log("Events:", events)
    return events;
}

function signup(eventinfo, msg, sendMessage2User) {
    console.log("In signup(%s)...", msg, eventinfo)

    var sheetTitle = eventinfo

    var gsheet
    var alreadyPresent = false
    async.series([
        function getSheet(done) {
            doc.addWorksheet({
                title: sheetTitle
            }, async function (err, sheet) {
                if (err) {
                    console.log(err)
                    if (err = ~ "already exists") {
                        console.log("Already exists")
                        // console.log("Sheets before loop: ", gsheets)
                        for (var s in gsheets) {
                            console.log("Checking if %s is %s", gsheets[s].title, sheetTitle)
                            if (gsheets[s].title == sheetTitle) {
                                gsheet = gsheets[s]
                                console.log("After setting sheet: ", gsheet.title)
                            }
                        }
                    } else {
                        console.log("Unknown error")
                        done(err)
                    }
                } else {
                    // change a sheet's title
                    // sheet.setTitle(currentDate.getFullYear()); //async
                    gsheet = sheet
                }

                console.log("Setting header row for new sheet: ", gsheet.title)
                //resize a sheet
                gsheet.resize({ rowCount: 500, colCount: 20 }); //async
                gsheet.setHeaderRow(['person', 'tid', 'notes'],
                    function (err) {
                        if (err) {
                            console.log(err)
                            done(err)
                        }
                        console.log("Header is now set")
                        done()
                    }); //async  
            })
        },

        function (done) {
            gsheet.getRows({
                offset: 1,
            }, function (err, rows) {
                var events = [];
                if (err) {
                    console.log(err)
                    done(err)
                }
                console.log('Read ' + rows.length + ' rows')
                // console.log(rows);
                for (var r in rows) {
                    console.log("Checking if %s is %s", rows[r].tid, msg.from.id)
                    if (rows[r].tid == msg.from.id) {
                        alreadyPresent = true
                        console.log("Already present:", rows[r])
                        var data = msg.from.first_name +
                            ", You've already signed up for " + eventinfo + "."
                        console.log(data)
                        sendMessage2User(msg.message, data)
                        done()
                        return
                    }
                }
                console.log(msg.from.id, "does not exist.")
                done()
            })
        },

        function (done) {
            if (alreadyPresent) {
                return
            }
            var currentDate = new Date();
            var userdate = currentDate.getFullYear() + "/" + currentDate.getMonth() + "/" + currentDate.getDate()
            console.log("Date: " + userdate)
            var personName = msg.from.first_name
            if (msg.from.last_name) {
                personName += " " + msg.from.last_name
            }
            gsheet.addRow({
                person: personName,
                tid: msg.from.id,
                // notes: msg.text.split(),
            }, function (err, row) {
                if (err) {
                    console.log(err)
                    done(err)
                }
                console.log("Entry added:", currentDate)
                var data = msg.from.first_name +
                    ", You are successfully signed up for " + eventinfo + "."
                console.log(data)
                // bot.sendMessage(msg.from.id, data)
                sendMessage2User(msg.message, data)
                done()
            });
        },

    ], function (err) {
        if (err) {
            console.log(err) // "another thing"
            sendMessage2User(msg.message, err)
        }
    });
    return
}