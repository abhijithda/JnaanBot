'use strict';
const fetch = require('node-fetch');

module.exports = {
    getLocalData: function (topic) {
        var json = require('./data/data.json');
        // console.log(json)
        console.log("Getting data for ...", topic)
        console.log(json[topic])
        return json[topic]
    },

    getData: async function (url, topic) {
        // read JSON from URL
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data)
        console.log("Getting data for ...", topic)
        console.log(data[topic])
    
        return data[topic];
    
    }
}
