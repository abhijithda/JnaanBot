'use strict';
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

module.exports = {
    signupPerson
}

// spreadsheet key is the long id in the sheets URL
// var doc = new GoogleSpreadsheet('<spreadsheet key>');
var doc = new GoogleSpreadsheet('1nEtWyd2GZtoDeKDt1eUbpaXx1o1uN8kFabv-sgFO1GQ');
var gsheets
var gsheet

async.series([
    function setAuth(step) {
        // see notes below for authentication instructions!
        // var creds = require('./google-generated-creds.json');
        var creds = require('./service-account.json');
        // OR, if you cannot save the file locally (like on heroku)
        // var creds_json = {
        //   client_email: 'yourserviceaccountemailhere@google.com',
        //   private_key: 'your long private key stuff here'
        // }

        doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
        doc.getInfo(function (err, info) {
            console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
            gsheets = info.worksheets
            // console.log("Sheets: ", gsheets)
            gsheet = info.worksheets[0];
            console.log('sheet 1: ' + gsheet.title + ' ' + gsheet.rowCount + 'x' + gsheet.colCount);
            // console.log("Info: ", info)
            step();
        });
    },

    function callsignupPerson(step) {
        signupPerson();
        step();
    }
])

async function signupPerson(msg) {
    console.log("In signupPerson()...")

    var sheetTitle = "signup"
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
        var res = await gsheet.setHeaderRow(['date', 'event', 'person', 'tid', 'notes'],
            function (err) {
                if (err) {
                    console.log(err)
                    return 1
                }
                return 0
            }); //async  
        console.log("Header is now set: ", res)

        console.log("Checking whether message is passed", msg)
        if (!msg) {
            console.log("User message info was not passed.")
            return
        }
        var currentDate = new Date();
        var userdate = currentDate.getFullYear() + "/" + currentDate.getMonth() + "/" + currentDate.getDate()
        console.log("Date: " + userdate)
        var res = gsheet.addRow({
            date: userdate,
            notes: msg.text.split(),
            person: msg.from.first_name + " " + msg.from.last_name,
            tid: msg.from.id
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

