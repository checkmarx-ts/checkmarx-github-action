require("dotenv").config()
const path = require("path")
const core = require("@actions/core")
const utils = require("./utils/utils")
const cxcli = require("./cli/cli")
const cxtoken = require("./cli/token")
const cxsast = require("./cli/sast")
const cxosa = require("./cli/osa")
const cxsca = require("./cli/sca")
const cxgithub = require("./github/github")
const inputs = require("./github/inputs")
const outputs = require("./github/ouputs")
const envs = process.env
let action = utils.getDefaultAction()
let version = utils.getStableVersion()
let server
let verbose = true
let logFile

async function run() {
    let skipIfFail = false
    try {
        core.info("Action ID : " + envs.GITHUB_ACTION)
        core.info("Run ID : " + envs.GITHUB_RUN_ID)
        core.info("Workflow Name : " + envs.GITHUB_WORKFLOW)
        core.info("Event : " + envs.GITHUB_EVENT_NAME)
        core.info("Workflow User : " + envs.GITHUB_ACTOR)
        core.info("Repository : " + envs.GITHUB_REPOSITORY)
        core.info("Branch : " + envs.GITHUB_REF)
        core.info("Head Branch : " + envs.GITHUB_HEAD_REF)
        core.info("Base Branch : " + envs.GITHUB_BASE_REF)
        core.info("Workspace : " + envs.GITHUB_WORKSPACE)
        core.info("Commit SHA : " + envs.GITHUB_SHA)

        core.setOutput(outputs.CX_ACTION_ID, envs.GITHUB_ACTION)
        core.setOutput(outputs.CX_RUN_ID, envs.GITHUB_RUN_ID)
        core.setOutput(outputs.CX_WORKFLOW, envs.GITHUB_WORKFLOW)
        core.setOutput(outputs.CX_WORKDLOW_USER, envs.GITHUB_ACTOR)
        core.setOutput(outputs.CX_EVENT, envs.GITHUB_EVENT_NAME)
        core.setOutput(outputs.CX_REPOSITORY, envs.GITHUB_REPOSITORY)
        core.setOutput(outputs.CX_BRANCH, envs.GITHUB_REF)
        core.setOutput(outputs.CX_HEAD_BRANCH, envs.GITHUB_HEAD_REF)
        core.setOutput(outputs.CX_BASE_BRANCH, envs.GITHUB_BASE_REF)
        core.setOutput(outputs.CX_WORKSPACE, envs.GITHUB_WORKSPACE)
        core.setOutput(outputs.CX_COMMIT_SHA, envs.GITHUB_SHA)

        core.info("\n[START] Reading Inputs...")

        skipIfFail = inputs.getBoolean(inputs.CX_SKIP_IF_FAIL, false)

        let cxAction = inputs.get(inputs.CX_ACTION, false)
        if (utils.isValidAction(cxAction)) {
            action = cxAction
            core.info(inputs.CX_ACTION + ": " + action)
        } else {
            core.info(inputs.CX_ACTION + " not provided")
            core.info("Default Action will be used: " + action)
        }

        if (action != utils.SCA_SCAN && action != utils.ASYNC_SCA_SCAN) {
            let cxServer = inputs.get(inputs.CX_SERVER, true)
            if (utils.isValidUrl(cxServer)) {
                core.info(inputs.CX_SERVER + " : " + cxServer)
                server = cxServer.trim()
            } else {
                return inputs.error(inputs.CX_SERVER, cxServer, skipIfFail)
            }
        }
        let cxVersion = inputs.get(inputs.CX_VERSION, false)

        if (cxcli.isValidVersion(cxVersion)) {
            core.info(inputs.CX_VERSION + " : " + cxVersion)
            version = cxVersion.trim()
        } else {
            core.info("No " + inputs.CX_VERSION + " valid input provided : " + version + " version will be used instead of " + cxVersion.toString())
        }

        if (action == utils.SCA_SCAN || action == utils.ASYNC_SCA_SCAN) {
            //Force version for SCA
            version = "2020"
        }

        core.setOutput(outputs.CX_SKIP_IF_FAIL, skipIfFail)
        core.setOutput(outputs.CX_VERSION, version)
        if (action != utils.SCA_SCAN && action != utils.ASYNC_SCA_SCAN) {
            core.setOutput(outputs.CX_SERVER, server)
        }
        core.setOutput(outputs.CX_ACTION, action)

        let trustedCertificates = inputs.getBoolean(inputs.CX_TRUSTED_CERTS, false)
        if (!utils.is9Version(cxVersion)) {
            trustedCertificates = false
        }

        core.setOutput(outputs.CX_TRUSTED_CERTS, trustedCertificates)

        let command = "." + path.sep

        command += cxcli.getCliStartCommand()

        let auxCommand = ""

        switch (action) {
            case utils.SCAN:
                auxCommand = cxsast.getSastCmd(server, action, skipIfFail)
                break
            case utils.ASYNC_SCAN:
                auxCommand = cxsast.getSastCmd(server, action, skipIfFail)
                break
            case utils.OSA_SCAN:
                auxCommand = cxosa.getOsaCmd(server, action, skipIfFail)
                break
            case utils.ASYNC_OSA_SCAN:
                auxCommand = cxosa.getOsaCmd(server, action, skipIfFail)
                break
            case utils.SCA_SCAN:
                auxCommand = cxsca.getScaCmd(action, skipIfFail)
                break
            case utils.ASYNC_SCA_SCAN:
                auxCommand = cxsca.getScaCmd(action, skipIfFail)
                break
            case utils.REVOKE_TOKEN:
                auxCommand = cxtoken.revokeTokenGetCmd(server, skipIfFail)
                break
            case utils.GENERATE_TOKEN:
                auxCommand = cxtoken.generateTokenGetCmd(server, skipIfFail)
                break
            default:
                auxCommand = cxsast.getSastCmd(server, utils.getDefaultAction(), skipIfFail)
                break
        }

        if (utils.isValidString(auxCommand)) {
            command += auxCommand
        } else {
            let message = "Invalid auxCommand : " + auxCommand
            return inputs.coreError(message, skipIfFail)
        }

        let cxLog = inputs.get(inputs.CX_LOG, false)

        if (utils.isValidFilename(cxLog)) {
            core.info(inputs.CX_LOG + " : " + cxLog)
            logFile = cxLog.trim()
        } else {
            core.info("No " + inputs.CX_LOG + " valid input provided")
        }

        if (logFile) {
            command += " -Log \"" + envs.GITHUB_WORKSPACE + path.sep + logFile + "\""
            core.setOutput(outputs.CX_LOG, logFile)
        }

        let cxVerbose = inputs.get(inputs.CX_VERBOSE, false)

        if (utils.isBoolean(cxVerbose)) {
            core.info(inputs.CX_VERBOSE + " : " + cxVerbose)
            verbose = cxVerbose
        } else {
            core.info(inputs.CX_VERBOSE + " valid flag not provided")
            verbose = true
        }

        core.setOutput(outputs.CX_VERBOSE, verbose)

        if (verbose && verbose != "false") {
            command += " -v"
        }

        if (trustedCertificates && trustedCertificates != "false") {
            command += " -TrustedCertificates"
        }

        core.info("[END] Read Inputs...\n")

        try {
            await cxcli.downloadCli(version, skipIfFail)
        } catch (e) {
            return inputs.coreError(e.message, skipIfFail)
        }
        try {
            let output = await cxcli.executeCommand(command, skipIfFail)
        } catch (e) {
            return inputs.coreError(e.message, skipIfFail)
        }
        if (cxAction == utils.SCAN || cxAction == utils.OSA_SCAN) {
            await cxgithub.createIssues(cxAction)
        } else {
            core.info("Github Issues is not supported for cxAction: " + cxAction)
        }

    } catch (e) {
        return inputs.coreError(e.message, skipIfFail)
    }
}

run()

module.exports = {
    run: run
}