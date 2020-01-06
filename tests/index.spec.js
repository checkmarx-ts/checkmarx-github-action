const assert = require('assert')
const index = require('./../src/index.js')
const server = "https://test.company.com"
const VALID_ACTIONS = ["Scan", "AsyncScan", "OsaScan", "AsyncOsaScan", "GenerateToken", "RevokeToken"]

describe('index', function () {
    describe('#run()', function () {
        it('Null - Fail', async function () {
            try {
                let cmd = await index.run()
                assert(!cmd)
            } catch (e) {
                assert(true)
            }
        })
        it('Invalid Action - Fail', async function () {
            process.env["INPUT_CXACTION"] = "test"
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[0]
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Invalid Server - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[0]
            process.env["INPUT_CXSERVER"] = "test"
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Valid Server Test - Fail', async function () {
            process.env["INPUT_CXACTION"] = "test"
            process.env["INPUT_CXSERVER"] = server
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Valid Server 0 - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[0]
            process.env["INPUT_CXSERVER"] = server
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Valid Server 1 - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[1]
            process.env["INPUT_CXSERVER"] = server
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Valid Server 2 - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[2]
            process.env["INPUT_CXSERVER"] = server
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Valid Server 3 - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[3]
            process.env["INPUT_CXSERVER"] = server
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Valid Server 4 - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[4]
            process.env["INPUT_CXSERVER"] = server
            let cmd = await index.run()
            assert(!cmd)
        })
        it('Valid Action, Valid Server 5 - Fail', async function () {
            process.env["INPUT_CXACTION"] = VALID_ACTIONS[5]
            process.env["INPUT_CXSERVER"] = server
            let cmd = await index.run()
            assert(!cmd)
        })
    })
})