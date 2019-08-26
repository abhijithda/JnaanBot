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
            // console.log("Info: ", info)
            console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
            gsheets = info.worksheets
            step();
        });
    },
])

async function signupPerson(msg, event) {
    console.log("In signupPerson()...", msg, event)

    var sheetTitle = event
    var gsheet
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

