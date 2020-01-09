const utils = require('./utils.js')
const cxcli = require('./cxcli.js')
const cxtoken = require('./cxtoken.js')
const cxsast = require('./cxsast.js')
const cxosa = require('./cxosa.js')
const core = require('@actions/core')
const github = require('@actions/github')
const envs = process.env
let action = "Scan"
let version = "8.9" //STABLE VERSION
let server
let verbose = true
let logFile
let skipIfFail = false

async function run() {
    try {
        core.info('Event name: ' + github.context.eventName)
        core.info('Repository : ' + envs.GITHUB_REPOSITORY)
        core.info('Branch : ' + envs.GITHUB_REF)
        core.info('Workspace : ' + envs.GITHUB_WORKSPACE)
        core.info('Commit SHA : ' + envs.GITHUB_SHA)

        core.setOutput("cxEvent", github.context.eventName)
        core.setOutput("cxRepository", envs.GITHUB_REPOSITORY)
        core.setOutput("cxBranch", envs.GITHUB_REF)
        core.setOutput("cxWorkspace", envs.GITHUB_WORKSPACE)
        core.setOutput("cxCommitSHA", envs.GITHUB_SHA)

        core.info("\n[START] Read Inputs...")

        let cxSkipIfFail = core.getInput('cxSkipIfFail', { required: false })
        if (utils.isBoolean(cxSkipIfFail)) {
            core.info('cxSkipIfFail: ' + cxSkipIfFail)
            skipIfFail = cxSkipIfFail
        } else {
            core.warning('Skip If Fail valid flag not provided')
            skipIfFail = false
        }
        let cxAction = core.getInput('cxAction', { required: false })
        let cxServer = core.getInput('cxServer', { required: true })

        if (utils.isValidAction(cxAction)) {
            action = cxAction
        } else {
            core.warning('"cxAction" not provided')
            core.info('Default Action will be used: ' + action)
        }

        if (utils.isValidUrl(cxServer)) {
            core.info('cxServer: ' + cxServer)
            server = cxServer.trim()
        } else {
            if (skipIfFail && skipIfFail != "false") {
                core.warning("Please provide 'cxServer' input (string - HTTPS should be used): " + cxServer)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed("Please provide 'cxServer' input (string - HTTPS should be used): " + cxServer)
                return
            }
        }
        
        let cxVersion = core.getInput('cxVersion', { required: false })

        if (utils.isValidVersion(cxVersion)) {
            core.info('cxVersion: ' + cxVersion)
            version = cxVersion.trim()
        } else {
            core.warning("No 'cxVersion' valid input provided : " + version + " version will be used instead of " + cxVersion.toString())
        }
        core.setOutput("cxVersion", version)

        core.setOutput("cxServer", server)
        core.setOutput("cxAction", action)

        let command = "./" + cxcli.getFolderName() + "/runCxConsole.sh "
        let auxCommand = ""

        switch (action) {
            case "Scan":
                auxCommand = await cxsast.getSastCmd(server, action, skipIfFail)
                break
            case "AsyncScan":
                auxCommand = await cxsast.getSastCmd(server, action, skipIfFail)
                break
            case "OsaScan":
                auxCommand = await cxosa.getOsaCmd(server, action, skipIfFail)
                break
            case "AsyncOsaScan":
                auxCommand = await cxosa.getOsaCmd(server, action, skipIfFail)
                break
            case "RevokeToken":
                auxCommand = await cxtoken.revokeTokenGetCmd(server, skipIfFail)
                break
            case "GenerateToken":
                auxCommand = await cxtoken.generateTokenGetCmd(server, skipIfFail)
                break
            default:
                auxCommand = await cxsast.getSastCmd(server, "Scan", skipIfFail)
                break
        }

        if (utils.isValidString(auxCommand)) {
            command += auxCommand
        } else {
            if (skipIfFail && skipIfFail != "false") {
                core.warning("Invalid auxCommand : " + auxCommand)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed("Invalid auxCommand : " + auxCommand)
                return
            }
        }

        let cxLog = core.getInput('cxLog', { required: false })

        if (utils.isValidFilename(cxLog)) {
            core.info('cxLog: ' + cxLog)
            logFile = cxLog.trim()
        } else {
            core.warning("No 'cxLog' valid input provided")
        }

        if (logFile) {
            command += " -Log \"" + envs.GITHUB_WORKSPACE + "/" + logFile + "\""
            core.setOutput("cxLogFile", logFile)
        }

        let cxVerbose = core.getInput('cxVerbose', { required: false })

        if (utils.isBoolean(cxVerbose)) {
            core.info('cxVerbose: ' + cxVerbose)
            verbose = cxVerbose
        } else {
            core.warning('Verbose valid flag not provided')
            verbose = true
        }

        if (verbose && verbose != "false") {
            command += " -v"
        }

        core.setOutput("cxVerbose", verbose)

        core.info("[END] Read Inputs...\n")

        try {
            await cxcli.downloadCli(version, skipIfFail)
        } catch (e) {
            if (skipIfFail && skipIfFail != "false") {
                core.warning(e.message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed(e.message)
                return
            }
        }
        try {
            let output = await cxcli.executeCommand(command, skipIfFail)
        } catch (e) {
            if (skipIfFail && skipIfFail != "false") {
                core.warning(e.message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed(e.message)
                return
            }
        }
    } catch (e) {
        if (skipIfFail && skipIfFail != "false") {
            core.warning(e.message)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed(e.message)
            return
        }
    }
}

run()

module.exports = {
    run: run
}