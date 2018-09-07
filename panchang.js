'use strict';

module.exports = {
    getTithiNumber: function (tithi_name) {
        var tithi
        switch (tithi_name) {
            case "Pratipada":
                tithi = 1
                break;
            case "Dwitiya":
                tithi = 2
                break;
            case "Tritiya":
                tithi = 3
                break;
            case "Chaturthi":
                tithi = 4
                break;
            case "Panchami":
                tithi = 5
                break;
            case "Shashthi":
                tithi = 6
                break;
            case "Saptami":
                tithi = 7
                break;
            case "Ashtami":
                tithi = 8
                break;
            case "Navami":
                tithi = 9
                break;
            case "Dashami":
                tithi = 10
                break;
            case "Ekadashi":
                tithi = 11
                break;
            case "Dwadashi":
                tithi = 12
                break;
            case "Trayodashi":
                tithi = 13
                break;
            case "Chaturdashi":
                tithi = 14
                break;
            case "Amavasya":
            case "Purnima":
                tithi = 15
                break;
            default:
                console.log("Not registered tithi found:", tithi_name)
                break;
        }
        console.log("Tithi:", tithi)
        return tithi
    },

    getPanchangInfo: async function () {
        const panchangURL = "https://www.drikpanchang.com"
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;

        var panchangeInfo = JSDOM.fromURL(panchangURL, {}).then(async function (dom) {
            console.log("Parsing %s URL for panchang info...", panchangURL)
            // console.log(dom.serialize());
            var display_next = 0
            var key = ""
            var info = {
                "Tithi": "",
                "Paksha": "",
                "Amanta Month": ""
            }

            var htmlparser = require("htmlparser2");
            var parser = new htmlparser.Parser({
                ontext: function (text) {
                    // console.log("-->", text);
                    if (display_next != 0) {
                        console.log(text)
                        display_next--
                        if (text.trim() != ":") {
                            info[key] += text.trim()
                            if (display_next) {
                                info[key] += " "
                            }
                        }
                    }
                    if (text === "Tithi") {
                        key = text
                        console.log("--->", key)
                        display_next = 5;
                    }
                    if (text === "Amanta Month" || text === "Paksha") {
                        key = text
                        console.log("--->", key)
                        display_next = 2;
                    }
                },
            }, { decodeEntities: true });
            parser.write(dom.serialize());
            parser.end();

            console.log("Panchang Info: ", info)
            return info
        });
        console.log("Exiting getPanchangInfo()...")
        return panchangeInfo
    }

}