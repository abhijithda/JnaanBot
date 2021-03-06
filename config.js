module.exports = {
    data_URL: function () {
        return process.env.DATA_URL
    },

    notify_message: function () {
        return process.env.NOTIFY_MESSAGE || "Jai Jinendra 🙏"
    },

    notify_receivers: function () {
        if (Object.prototype.toString.call(process.env.NOTIFY_RECEIVERS) == '[object Undefined]'){
            console.debug("NOTIFY_RECEIVERS value is not set.")
            return []
        }
        var recvs = process.env.NOTIFY_RECEIVERS.split(",")
        console.log("No. of receivers: " + recvs.length)
        for (r in recvs) {
            console.log("Receiver: " + recvs[r])
        }
        return recvs
    },

    notify_time: function () {
        // Seconds: 0-59
        // Minutes: 0-59
        // Hours: 0-23
        // Day of Month: 1-31
        // Months: 0-11 (Jan-Dec)
        // Day of Week: 0-6 (Sun-Sat)
        /*
         * By default runs everyday at 5:55:00 AM.
         */
        return process.env.NOTIFY_TIME || '00 55 5 * * *'
    },

    calender_lunar_URL: function () {
        return process.env.CALENDER_LUNAR_URL
    },

    calender_amavasyaanta_URL: function () {
        return process.env.CALENDER_AMAVASYAANTA_URL
    },

    calender_solar_URL: function () {
        return process.env.CALENDER_SOLAR_URL
    },

    sheet_id: function () {
        return process.env.SHEET_ID
    },

    client_email: function () {
        return process.env.CLIENT_EMAIL
    },

    pkey: function () {
        return process.env.PKEY
    },

    token: function () {
        return process.env.TOKEN
    }

}
