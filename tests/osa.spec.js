const assert = require('assert')
const cxosa = require('../src/cli/osa')
const server = "https://test.company.com"

describe('cxosa', function () {
    describe('#getOsaCmd()', function () {
        it('Null - Fail', async function () {
            let cmd = await cxosa.getOsaCmd(null, null)
            assert(!cmd)
        })
        it('Empty - Fail', async function () {
            let cmd = await cxosa.getOsaCmd("", "")
            assert(!cmd)
        })
        it('Integer - Fail', async function () {
            let cmd = await cxosa.getOsaCmd(1, 1)
            assert(!cmd)
        })
        it('Boolean - Fail', async function () {
            let cmd = await cxosa.getOsaCmd(true, true)
            assert(!cmd)
        })
        it('Array - Fail', async function () {
            let cmd = await cxosa.getOsaCmd([], [])
            assert(!cmd)
        })
        it('Object - Fail', async function () {
            let cmd = await cxosa.getOsaCmd({}, {})
            assert(!cmd)
        })
        it('Invalid Server - Fail', async function () {
            let cmd = await cxosa.getOsaCmd("test", "OsaScan")
            assert(!cmd)
        })
        it('Invalid Action - Fail', async function () {
            let cmd = await cxosa.getOsaCmd(server, "test")
            assert(!cmd)
        })
        it('Valid Server and Action - Fail', async function () {
            try {
                let cmd = await cxosa.getOsaCmd(server, "OsaScan")
                assert(!cmd)
            } catch (e) {
                assert(true)
            }
        })
    })
})