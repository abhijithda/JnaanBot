'use strict';

const myConfig = require('./config');

var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

module.exports = {
    signupPerson
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

function isNamedRowPresent(sheet, name, cb) {
    console.log("In isNamedRowPresent(%s, %s)...", sheet.title, name)
    sheet.getRows({
        offset: 1,
    }, function (err, rows) {
        var events = [];
        if (err) {
            console.log(err)
            cb(err)
        }
        console.log('Read ' + rows.length + ' rows')
        // console.log(rows);
        for (var r in rows) {
            if (name) {
                console.log("Checking if %s is %s", rows[r].name, name)
                if (rows[r].name == name) {
                    console.log("Matched: ", rows[r].name)
                    events.unshift(rows[r].name)
                }
            } else {
                events.unshift(rows[r].name)
            }
        }
        cb(events)
    })
}

function getEventSheet(eventName) {
    console.log("In getEventSheet(%s)...", eventName)

    var sheet
    var events
    async.series([
        function (done) {
            var err
            isSheetPresent("events", function (err, lsheet) {
                if (err) {
                    console.log(err)
                }
                console.log("lSheet title info:", lsheet.title)
                sheet = lsheet
            })
            console.log("Sheet title info:", sheet.title)
            done()
        },
        function (done) {
            isNamedRowPresent(sheet, null, function (levents) {
                events = levents
                done()
            })
        },
        function (done) { isSheetPresent(eventName, done) },

        function (done) {
            sheet.getRows({}, function (err, rows) {
                if (err) {
                    console.log(err)
                    return done(err);
                }
                console.log('Read ' + rows.length + ' rows')
                // console.log(rows);
                done();
            })
        },

    ]);
}

async function signupPerson(msg, event) {
    console.log("In signupPerson()...", msg, event)

    var sheetTitle = event
    var gsheet = getEventSheet(event);
    return
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
            }
            else {
                console.log("Unknown error")
                return err
            }
        } else {
            // change a sheet's title
            // sheet.setTitle(currentDate.getFullYear()); //async
            gsheet = sheet
        }

        console.log("Setting header row for new sheet: ", gsheet.title)
        //resize a sheet
        gsheet.resize({ rowCount: 500, colCount: 20 }); //async
        var res = await gsheet.setHeaderRow(['person', 'tid', 'notes'],
            function (err) {
                if (err) {
                    console.log(err)
                    return 1
                }
                return 0
            }); //async  
        console.log("Header is now set: ", res)

        var currentDate = new Date();
        var userdate = currentDate.getFullYear() + "/" + currentDate.getMonth() + "/" + currentDate.getDate()
        console.log("Date: " + userdate)
        var res = gsheet.addRow({
            person: msg.from.first_name + " " + msg.from.last_name,
            tid: msg.from.id,
            notes: msg.text.split(),
        }, function (err, row) {
            if (err) {
                console.log(err)
                return 1
            }
            console.log("Date added: ", row.date)
            return 0
        });
        console.log("Row added: ", currentDate, res)
    });
}

