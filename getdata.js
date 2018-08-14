'use strict';
const fetch = require('node-fetch');

module.exports = {
    getData: async function (url, topic) {
        // read JSON from URL
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data)
        console.log("Getting data from %s for %s...", url, topic)

        if (Object.prototype.toString.call(data[topic]) == '[object Undefined]') {
            console.log("No data found!")
            return ""
        }
        console.log(data[topic])
        return data[topic];
    },

    getSchedule: async function (url, day) {
        // read JSON from URL
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data)
        console.log("Getting calender schedule from %s for %s...", url, day)
        if (Object.prototype.toString.call(data[day]) == '[object Undefined]') {
            console.log("No data found!")
            return ""
        }
        console.log(data[day])
        return data[day];
    }
}
