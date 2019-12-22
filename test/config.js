const assert = require('assert');
const config = require("../config.js")

describe('config.js', function () {

    describe('data_URL()', function () {
        it('When "DATA_URL" is not set', function(){
            assert.equal(Object.prototype.toString.call(config.data_URL()), '[object Undefined]')
        })
        it('When "DATA_URL" is set', function(){
            process.env.DATA_URL = "https://localhost/data.json"
            assert.equal(config.data_URL(), "https://localhost/data.json")
        })
    })

    describe('notify_message()', function () {
        it('When "NOTIFY_MESSAGE" is not set', function(){
            assert.equal(config.notify_message(), "Jai Jinendra 🙏")
        })
        it('When "NOTIFY_MESSAGE" is set', function(){
            process.env.NOTIFY_MESSAGE = "Test"
            assert.equal(config.notify_message(), "Test")
        })
    })

    describe('notify_receivers()', function () {
        it('When "NOTIFY_RECEIVERS" is not set', function(){
            assert.deepEqual(config.notify_receivers(), [])
        })
        it('When "NOTIFY_RECEIVERS" has one user', function(){
            process.env.NOTIFY_RECEIVERS = "123"
            assert.deepEqual(config.notify_receivers(), ['123'])
        })
        it('When "NOTIFY_RECEIVERS" has multiple users', function(){
            process.env.NOTIFY_RECEIVERS = "123,234"
            assert.deepEqual(config.notify_receivers(), ['123', '234'])
        })
    })

})
