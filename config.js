module.exports = {
    token: function () {
        return process.env.TOKEN
    },

    receivers: function () {
        var recvs = process.env.RECEIVERS.split(",")
        console.log("No. of receivers: " + recvs.length)
        for (r in recvs) {
            console.log("Receiver: " + recvs[r])
        }
        return recvs
    }
}
