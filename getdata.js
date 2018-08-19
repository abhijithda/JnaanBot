'use strict';
const fetch = require('node-fetch');

module.exports = {
    getData: async function (url, topic) {
        console.info("Entering getData()...")
        // read JSON from URL
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data)
        console.info("Getting data from %s for %s...", url, topic)
        if (Object.prototype.toString.call(data[topic]) == '[object Undefined]') {
            console.warn("No data found!")
            return ""
        }
        console.log(data[topic])
        console.info("Exiting getData()...")
        return data[topic];
    },

    getSchedule: async function (url, day) {
        console.info("Entering getSchedule()...")
        // read JSON from URL
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data)
        console.info("Getting calender schedule from %s for %s...", url, day)
        if (Object.prototype.toString.call(data[day]) == '[object Undefined]') {
            console.warn("No data found!")
            return ""
        }
        console.info(data[day])
        console.info("Exiting getSchedule()...")
        return data[day];
    }
}
