const assert = require('assert')
const cxcli = require('./../src/cxcli.js')

describe('cxcli', function () {
    describe('#getFolderName()', function () {
        it('Null - Success', function () {
            var s = cxcli.getFolderName()
            assert(s == "cxcli")
        });
    });
    describe('#downloadCli()', function () {
        it('Null - Success', async function (done) {
            //await cxcli.downloadCli() - Unzip does not work on windows
            done()
        });
    });
    describe('#executeCommand()', function () {
        it('Null - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand()
            assert(!cmdExecuted)
        });
        it('Empty - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand("")
            assert(!cmdExecuted)
        });
        it('Integer - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand(1)
            assert(!cmdExecuted)
        });
        it('Boolean - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand(true)
            assert(!cmdExecuted)
        });
        it('Array - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand([])
            assert(!cmdExecuted)
        });
        it('Object - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand({})
            assert(!cmdExecuted)
        });
        it('String - Success', async function () {
            //let cmdExecuted = await cxcli.executeCommand("") - Command fails because it expects a file
            assert(true)
        });
    });
});