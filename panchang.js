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

    // http://www.mypanchang.com/mobilewidget.php?cityname=Milpitas-CA

    getPanchangInfo: async function () {
        // https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=5373327&date=19/01/2019
        const panchangURL = "https://www.drikpanchang.com?geoname-id=5373327" // Milpitas
        // https://www.drikpanchang.com/?geoname-id=5128581 // New York
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;

        var panchangeInfo = JSDOM.fromURL(panchangURL, {}).then(async function (dom) {
            console.log("Parsing %s URL for panchang info...", panchangURL)
            // console.log(dom.serialize());
            var display_next = 0
            var ampm = 0
            var start = 0
            var key = ""
            var info = {
                "Tithi": "",
                "Nakshatra": "",
                "Yoga": "",
                "Karana": "",
                "Paksha": "",
                "Weekday": "",
                "Amanta Month": "",
                "Purnimanta Month": ""
            }

            var htmlparser = require("htmlparser2");
            var parser = new htmlparser.Parser({
                ontext: function (text) {
                    // console.log("-->", text);
                    if (display_next != 0) {
                        console.log(text)
                        display_next--
                        // Check for ":" once display_next is set, as otherwise it might have matched something else.
                        if (text.trim() == ":") {
                            start = 1
                        }
                        if (start && text.trim() != ":") {
                            var skip = 0
                            if (ampm == 1) {
                                ampm = 0
                                // If there is a comma i.e., ',', then there could be month and date. Otherwise it would be next field!
                                var curfieldPattern = /[,]/;
                                var result = text.match(curfieldPattern)
                                console.log("Result", Object.prototype.toString.call(result))
                                if (Object.prototype.toString.call(result) == '[object Null]') {
                                    skip = 1
                                } else {
                                    var mon_dd = text.split()
                                    text = mon_dd[0]
                                }
                            }
                            if (!skip) {
                                info[key] += " " + text.trim()
                            }
                            // If there is a date after AM, then include that also... Ex: Shashthi upto 02:15 AM , Sep 15
                            if (text == "AM" || text == "PM") {
                                display_next++;
                                ampm = 1
                            }
                        }
                    }
                    switch (text) {
                        case "Tithi":
                        case "Nakshatra":
                        case "Yoga":
                        case "Karana":
                            start = 0
                            key = text
                            console.log("--->", key)
                            display_next = 5;
                            break;
                        case "Amanta Month":
                        case "Purnimanta Month":
                        case "Paksha":
                        case "Weekday":
                            start = 0
                            key = text
                            console.log("--->", key)
                            display_next = 2;
                            break;
                        default:
                            if (display_next == 0) { start = 0 }
                            break;
                    }
                }
            }, { decodeEntities: true });
            parser.write(dom.serialize());
            parser.end();

            var hkeys = Object.keys(info)
            for (var k in hkeys) {
                info[hkeys[k]] = info[hkeys[k]].trim()
            }
            info["Paksha"] = info["Paksha"].split(" ")[0]
            console.log("Panchang Info: ", info)
            return info
        });
        console.log("Exiting getPanchangInfo()...")
        return panchangeInfo
    }

}