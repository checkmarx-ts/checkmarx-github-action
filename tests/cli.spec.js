const assert = require('assert')
const cxcli = require('./../src/cli/cli')

describe('cxcli', function () {
    describe('#getCliDownloadUrl()', function () {
        it('Null - Success', function () {
            let url = cxcli.getCliDownloadUrl()
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('Empty - Success', function () {
            let url = cxcli.getCliDownloadUrl("")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('Integer - Success', function () {
            let url = cxcli.getCliDownloadUrl(1)
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('Array - Success', function () {
            let url = cxcli.getCliDownloadUrl([])
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('Object - Success', function () {
            let url = cxcli.getCliDownloadUrl({})
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('Random String - Success', function () {
            let url = cxcli.getCliDownloadUrl("test")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('8.9 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.9")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('8.9.0 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.9.0")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('8.90 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.90")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[3])
        })
        it('8.8 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.8")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[2])
        })
        it('8.8.0 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.8.0")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[2])
        })
        it('8.80 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.80")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[2])
        })
        it('8.7 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.7")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[1])
        })
        it('8.7.0 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.7.0")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[1])
        })
        it('8.70 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.70")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[1])
        })
        it('8.6 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.6")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[0])
        })
        it('8.6.0 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.6.0")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[0])
        })
        it('8.60 String - Success', function () {
            let url = cxcli.getCliDownloadUrl("8.60")
            let array = cxcli.getCliDownloadUrls()
            assert(url == array[0])
        })
    })
    describe('#getCliDownloadUrls()', function () {
        it('Null - Success', function () {
            let array = cxcli.getCliDownloadUrls()
            assert(array && array.length > 0 && array instanceof Array)
        })
    })
    describe('#getFolderName()', function () {
        it('Null - Success', function () {
            assert(cxcli.getFolderName() == "cxcli")
        })
    })
    describe('#downloadCli()', function () {
        it('Null - Fail', async function () {
            assert(!await cxcli.downloadCli())
        })
        it('Empty - Fail', async function () {
            assert(!await cxcli.downloadCli(""))
        })
        it('Integer - Fail', async function () {
            assert(!await cxcli.downloadCli(123))
        })
        it('Boolean - Fail', async function () {
            assert(!await cxcli.downloadCli(true))
        })
        it('Array - Fail', async function () {
            assert(!await cxcli.downloadCli([]))
        })
        it('Object - Fail', async function () {
            assert(!await cxcli.downloadCli({}))
        })
    })
    describe('#executeCommand()', function () {
        it('Null - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand()
            assert(!cmdExecuted)
        })
        it('Empty - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand("")
            assert(!cmdExecuted)
        })
        it('Integer - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand(1)
            assert(!cmdExecuted)
        })
        it('Boolean - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand(true)
            assert(!cmdExecuted)
        })
        it('Array - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand([])
            assert(!cmdExecuted)
        })
        it('Object - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand({})
            assert(!cmdExecuted)
        })
        it('String - Fail', async function () {
            let cmdExecuted = await cxcli.executeCommand("test123")
            assert(!cmdExecuted)
        })
        it('String - Success', async function () {
            let cmdExecuted = await cxcli.executeCommand("node -v")
            assert(cmdExecuted)
        })
    })
})