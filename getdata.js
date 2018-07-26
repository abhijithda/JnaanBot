module.exports = {
    getData: function (topic) {
        var json = require('./data/data.json');
        // console.log(json)
        console.log("Getting data for ...", topic)
        console.log(json[topic])
        return json[topic]
    }
}
