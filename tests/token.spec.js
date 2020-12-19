const assert = require('assert')
const cxtoken = require('../src/cli/token')
const server = "https://test.company.com"
const token = "12345"
const user = "test@company.com"
const password = "test"

describe('cxtoken', function () {
    describe('#revokeTokenGetCmd()', function () {
        it('Null - Fail', async function () {
            let cmd = await cxtoken.revokeTokenGetCmd()
            assert(!cmd)
        })
        it('Empty - Fail', async function () {
            let cmd = await cxtoken.revokeTokenGetCmd("")
            assert(!cmd)
        })
        it('Integer - Fail', async function () {
            let cmd = await cxtoken.revokeTokenGetCmd(1)
            assert(!cmd)
        })
        it('Array - Fail', async function () {
            let cmd = await cxtoken.revokeTokenGetCmd([])
            assert(!cmd)
        })
        it('Object - Fail', async function () {
            let cmd = await cxtoken.revokeTokenGetCmd({})
            assert(!cmd)
        })
        it('Random String - Fail', async function () {
            let cmd = await cxtoken.revokeTokenGetCmd("test")
            assert(!cmd)
        })
        it('Valid String Empty Token - Fail', async function () {
            process.env["INPUT_CXTOKEN"] = " "
            let cmd = await cxtoken.revokeTokenGetCmd(server)
            assert(!cmd)
        })
        it('Valid String - Success', async function () {
            process.env["INPUT_CXTOKEN"] = token
            let cmd = await cxtoken.revokeTokenGetCmd(server)
            assert(cmd && cmd == ("RevokeToken -CxServer " + server + " -CxToken " + token))
        })
    })
    describe('#generateTokenGetCmd()', function () {
        it('Null - Fail', async function () {
            let cmd = await cxtoken.generateTokenGetCmd()
            assert(!cmd)
        })
        it('Empty - Fail', async function () {
            let cmd = await cxtoken.generateTokenGetCmd("")
            assert(!cmd)
        })
        it('Integer - Fail', async function () {
            let cmd = await cxtoken.generateTokenGetCmd(1)
            assert(!cmd)
        })
        it('Array - Fail', async function () {
            let cmd = await cxtoken.generateTokenGetCmd([])
            assert(!cmd)
        })
        it('Object - Fail', async function () {
            let cmd = await cxtoken.generateTokenGetCmd({})
            assert(!cmd)
        })
        it('Random String - Fail', async function () {
            let cmd = await cxtoken.generateTokenGetCmd("test")
            assert(!cmd)
        })
        it('Valid String Empty Username - Success', async function () {
            process.env["INPUT_CXUSERNAME"] = " "
            process.env["INPUT_CXPASSWORD"] = password
            let cmd = await cxtoken.generateTokenGetCmd(server)
            assert(!cmd)
        })
        it('Valid String Empty Password - Success', async function () {
            process.env["INPUT_CXUSERNAME"] = user
            process.env["INPUT_CXPASSWORD"] = " "
            let cmd = await cxtoken.generateTokenGetCmd(server)
            assert(!cmd)
        })
        it('Valid String Empty Credentials - Success', async function () {
            process.env["INPUT_CXUSERNAME"] = " "
            process.env["INPUT_CXPASSWORD"] = " "
            let cmd = await cxtoken.generateTokenGetCmd(server)
            assert(!cmd)
        })
        it('Valid String - Success', async function () {
            process.env["INPUT_CXUSERNAME"] = user
            process.env["INPUT_CXPASSWORD"] = password
            let cmd = await cxtoken.generateTokenGetCmd(server)
            assert(cmd && cmd == ("GenerateToken -CxServer " + server + " -CxUser " + user + " -CxPassword " + password))
        })
    })
})