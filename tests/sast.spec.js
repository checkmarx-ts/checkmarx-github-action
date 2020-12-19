const assert = require('assert')
const utils = require('./../src/utils/utils')
const cxsast = require('../src/cli/sast')
const server = "https://test.company.com"
const token = "12345"
const user = "test@company.com"
const password = "test"
const team = "\\CxServer"
const preset = "All"
const config = "Default Configuration"
const high = 10
const medium = 10
const low = 10
const excludeFolders = "node_modules,test"
const excludeFiles = "*.spec.js,*.unit.js"
const comment = "test comment"
const log = "log"
const envs = process.env
const GITHUB_REPOSITORY = utils.getLastString(envs.GITHUB_REPOSITORY)
const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
const GITHUB_SHA = envs.GITHUB_SHA ? envs.GITHUB_SHA : "Unknown Commit SHA"

describe('cxsast', function () {
    describe('#getSastCmd()', function () {
        it('Null - Fail', async function () {
            let cmd = await cxsast.getSastCmd(null, null)
            assert(!cmd)
        })
        it('Empty - Fail', async function () {
            let cmd = await cxsast.getSastCmd("", "")
            assert(!cmd)
        })
        it('Integer - Fail', async function () {
            let cmd = await cxsast.getSastCmd(1, 1)
            assert(!cmd)
        })
        it('Array - Fail', async function () {
            let cmd = await cxsast.getSastCmd([], [])
            assert(!cmd)
        })
        it('Object - Fail', async function () {
            let cmd = await cxsast.getSastCmd({}, {})
            assert(!cmd)
        })
        it('Random String - Fail', async function () {
            let cmd = await cxsast.getSastCmd("test", "test")
            assert(!cmd)
        })
        it('Valid String Scan Action Empty Token - Fail', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = " "
            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(!cmd)
        })
        it('Valid String Scan Action Empty Team - Fail', async function () {
            process.env["INPUT_CXTEAM"] = " "
            process.env["INPUT_CXTOKEN"] = token
            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(!cmd)
        })
        it('Valid String Scan Action - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team + "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\"" +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team + "\\undefined-undefined\" -LocationType folder -LocationPath \"undefined\"" +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String AsyncScan Action - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            let cmd = await cxsast.getSastCmd(server, "AsyncScan")
            assert(cmd && (cmd == ("AsyncScan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team + "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\"" +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("AsyncScan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team + "\\undefined-undefined\" -LocationType folder -LocationPath \"undefined\"" +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action Preset - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\"" +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\"" +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action Configuration - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset
            process.env["INPUT_CXCONFIGURATION"] = config

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\" -Configuration \"" +
                config + "\"" +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\" -Configuration \"" +
                    config + "\"" +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action High - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset
            process.env["INPUT_CXCONFIGURATION"] = config
            process.env["INPUT_CXHIGH"] = high

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\" -Configuration \"" +
                config + "\" -SASTHigh " + high +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\" -Configuration \"" +
                    config + "\" -SASTHigh " + high +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action Medium - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset
            process.env["INPUT_CXCONFIGURATION"] = config
            process.env["INPUT_CXHIGH"] = high
            process.env["INPUT_CXMEDIUM"] = medium

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\" -Configuration \"" +
                config + "\" -SASTHigh " + high + " -SASTMedium " + medium +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\" -Configuration \"" +
                    config + "\" -SASTHigh " + high + " -SASTMedium " + medium +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action Low - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset
            process.env["INPUT_CXCONFIGURATION"] = config
            process.env["INPUT_CXHIGH"] = high
            process.env["INPUT_CXMEDIUM"] = medium
            process.env["INPUT_CXLOW"] = low

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\" -Configuration \"" +
                config + "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\" -Configuration \"" +
                    config + "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action Exclude Folders - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset
            process.env["INPUT_CXCONFIGURATION"] = config
            process.env["INPUT_CXHIGH"] = high
            process.env["INPUT_CXMEDIUM"] = medium
            process.env["INPUT_CXLOW"] = low
            process.env["INPUT_CXEXCLUDEFOLDERS"] = excludeFolders

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\" -Configuration \"" +
                config + "\" -LocationPathExclude \"" + excludeFolders +
                "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\" -Configuration \"" +
                    config + "\" -LocationPathExclude \"" + excludeFolders +
                    "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action Exclude Files - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset
            process.env["INPUT_CXCONFIGURATION"] = config
            process.env["INPUT_CXHIGH"] = high
            process.env["INPUT_CXMEDIUM"] = medium
            process.env["INPUT_CXLOW"] = low
            process.env["INPUT_CXEXCLUDEFOLDERS"] = excludeFolders
            process.env["INPUT_CXEXCLUDEFILES"] = excludeFiles

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\" -Configuration \"" +
                config + "\" -LocationPathExclude \"" + excludeFolders +
                "\" -LocationFilesExclude \"" + excludeFiles +
                "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                " -Comment \"git " + GITHUB_REF + "@" + GITHUB_SHA + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\" -Configuration \"" +
                    config + "\" -LocationPathExclude \"" + excludeFolders +
                    "\" -LocationFilesExclude \"" + excludeFiles +
                    "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                    " -Comment \"git undefined@Unknown Commit SHA\"")
            )
            )
        })
        it('Valid String Scan Action Scan Comment - Success', async function () {
            process.env["INPUT_CXTEAM"] = team
            process.env["INPUT_CXTOKEN"] = token
            process.env["INPUT_CXPRESET"] = preset
            process.env["INPUT_CXCONFIGURATION"] = config
            process.env["INPUT_CXHIGH"] = high
            process.env["INPUT_CXMEDIUM"] = medium
            process.env["INPUT_CXLOW"] = low
            process.env["INPUT_CXEXCLUDEFOLDERS"] = excludeFolders
            process.env["INPUT_CXEXCLUDEFILES"] = excludeFiles
            process.env["INPUT_CXCOMMENT"] = comment

            let cmd = await cxsast.getSastCmd(server, "Scan")
            assert(cmd && (cmd == ("Scan -CxServer " + server +
                " -CxToken " + token +
                " -ProjectName \"" + team +
                "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF + "\" -preset \"" + preset +
                "\" -LocationType folder -LocationPath \"" + GITHUB_WORKSPACE + "\" -Configuration \"" +
                config + "\" -LocationPathExclude \"" + excludeFolders +
                "\" -LocationFilesExclude \"" + excludeFiles +
                "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                " -Comment \"" + comment + "\"") ||
                cmd == ("Scan -CxServer " + server +
                    " -CxToken " + token +
                    " -ProjectName \"" + team +
                    "\\undefined-undefined\" -preset \"" + preset +
                    "\" -LocationType folder -LocationPath \"undefined\" -Configuration \"" +
                    config + "\" -LocationPathExclude \"" + excludeFolders +
                    "\" -LocationFilesExclude \"" + excludeFiles +
                    "\" -SASTHigh " + high + " -SASTMedium " + medium + " -SASTLow " + low +
                    " -Comment \"" + comment + "\"")
            )
            )
        })
    })
})