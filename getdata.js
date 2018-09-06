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

    getJsonDataFromUrl: async function(url) {
        console.info("Entering getJsonDataFromUrl()...")
        // read JSON from URL
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data)
        console.info("Getting JSON data from %s...", url)
        if (Object.prototype.toString.call(data) == '[object Undefined]') {
            console.warn("No data found!")
            data = ""
        }
        console.info("Exiting getJsonDataFromUrl()...")
        return data;
    },

    getKeyDataFromHash: function(data, key) {
        var val = ""
        console.info("Entering getKeyDataFromHash()...")
        console.info("Getting key %s data...", key)
        if (Object.prototype.toString.call(data[key]) == '[object Undefined]') {
            console.warn("No data found!")
            val = ""
        } else {
            val = console.info(data[key])
        }
        console.info("Exiting getKeyDataFromHash()...")
        return val;
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
