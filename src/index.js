const utils = require('./utils.js')
const cxcli = require('./cxcli.js')
const core = require('@actions/core')
const github = require('@actions/github')
const envs = process.env
const GITHUB_REPOSITORY = utils.getLastString(envs.GITHUB_REPOSITORY)
const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
const GITHUB_SHA = envs.GITHUB_SHA ? envs.GITHUB_SHA : "Unknown Commit SHA"
let version = "8.9"
let server
let user
let password
let project
let team
let preset = "Checkmarx Default"
let config = "Default Configuration"
let scanComment = "git " + GITHUB_REF + "@" + GITHUB_SHA
let high = -1
let medium = -1
let low = -1
let forceScan = false
let incremental = false
let excludeFolders
let excludeFiles
let verbose = true
let _private = false
let logFile

async function run() {
    try {
        core.info('Event name: ' + github.context.eventName);
        core.info('Repository : ' + GITHUB_REPOSITORY);
        core.info('Branch : ' + GITHUB_REF);
        core.info('Workspace : ' + GITHUB_WORKSPACE);
        core.info('Commit SHA : ' + GITHUB_SHA);

        core.info("\n[START] Read Inputs...");

        let cxVersion = core.getInput('cxVersion');
        let cxServer = core.getInput('cxServer');
        let cxUsername = core.getInput('cxUsername');
        let cxPassword = core.getInput('cxPassword');
        let cxTeam = core.getInput('cxTeam');
        let cxPreset = core.getInput('cxPreset');
        let cxHigh = core.getInput('cxHigh');
        let cxMedium = core.getInput('cxMedium');
        let cxLow = core.getInput('cxLow');
        let cxComment = core.getInput('cxComment');
        let cxForceScan = core.getInput('cxForceScan');
        let cxIncremental = core.getInput('cxIncremental');
        let cxExcludeFolders = core.getInput('cxExcludeFolders');
        let cxExcludeFiles = core.getInput('cxExcludeFiles');
        let cxConfiguration = core.getInput('cxConfiguration');
        let cxPrivate = core.getInput('cxPrivate');
        let cxLog = core.getInput('cxLog');
        let cxVerbose = core.getInput('cxVerbose');

        if (utils.isValidUrl(cxServer)) {
            core.info('cxServer: ' + cxServer)
            server = cxServer.trim()
        } else {
            core.setFailed("Please provide 'cxServer' input (string - HTTPS should be used): " + cxServer)
            return
        }

        if (utils.isValidString(cxUsername)) {
            core.info('cxUsername: ' + cxUsername)
            user = cxUsername.trim()
        } else {
            core.setFailed("Please provide 'cxUsername' input (string) : " + cxUsername)
            return
        }

        if (utils.isValidString(cxPassword)) {
            password = cxPassword
        } else {
            core.setFailed("Please provide 'cxPassword' input (string)")
            return
        }

        if (utils.isValidTeam(cxTeam)) {
            core.info('cxTeam: ' + cxTeam)
            team = cxTeam.trim();
            project = team + "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF
        } else {
            core.setFailed("Please provide 'cxTeam' input (string): " + cxTeam)
            return
        }

        if (utils.isValidString(cxPreset)) {
            core.info('cxPreset: ' + cxPreset)
            preset = cxPreset.trim()
        } else {
            core.warning('Preset not provided')
            core.warning('Default Preset will be used: ' + preset)
        }

        if (utils.isValidString(cxConfiguration)) {
            core.info('cxConfiguration: ' + cxConfiguration)
            config = cxConfiguration.trim()
        } else {
            core.warning('Scan Configuration not provided')
            core.warning('Default Configuration will be used: ' + config)
        }

        if (utils.isValidString(cxExcludeFolders)) {
            core.info('cxExcludeFolders: ' + cxExcludeFolders)
            excludeFolders = cxExcludeFolders.trim()
        } else {
            core.warning("No 'cxExcludeFolders' input provided")
        }

        if (utils.isValidString(cxExcludeFiles)) {
            core.info('cxExcludeFiles: ' + cxExcludeFiles)
            excludeFiles = cxExcludeFiles.trim()
        } else {
            core.warning("No 'cxExcludeFiles' input provided")
        }

        if (utils.isValidString(cxComment)) {
            core.info('cxComment: ' + cxComment)
            scanComment = cxComment.trim()
        } else {
            core.warning('Scan comment not provided')
            core.warning('Default Comment will be used: ' + scanComment)
        }

        if (utils.isValidInt(cxHigh)) {
            core.info('cxHigh: ' + cxHigh)
            high = parseInt(cxHigh)
        } else {
            core.warning('SAST High Threshold valid not provided : ' + cxHigh)
        }

        if (utils.isValidInt(cxMedium)) {
            core.info('cxMedium: ' + cxMedium)
            medium = parseInt(cxMedium)
        } else {
            core.warning('SAST Medium Threshold valid not provided : ' + cxMedium)
        }

        if (utils.isValidInt(cxLow)) {
            core.info('cxLow: ' + cxLow)
            low = parseInt(cxLow)
        } else {
            core.warning('SAST Low Threshold valid not provided : ' + cxLow)
        }

        if (utils.isBoolean(cxForceScan)) {
            core.info('cxForceScan: ' + cxForceScan)
            forceScan = Boolean(cxForceScan);
        } else {
            core.warning('Force Scan valid flag not provided')
            forceScan = false
        }

        if (utils.isBoolean(cxIncremental)) {
            core.info('cxIncremental: ' + cxIncremental)
            incremental = Boolean(cxIncremental);
        } else {
            core.warning('Incremental Scan valid flag not provided')
            incremental = false
        }

        if (utils.isBoolean(cxPrivate)) {
            core.info('cxPrivate: ' + cxPrivate)
            _private = Boolean(cxPrivate);
        } else {
            core.warning('Private Scan valid flag not provided')
            _private = false
        }

        if (utils.isBoolean(cxVerbose)) {
            core.info('cxVerbose: ' + cxVerbose)
            verbose = Boolean(cxVerbose);
        } else {
            core.warning('Verbose valid flag not provided')
            verbose = true
        }

        if (utils.isValidFilename(cxLog)) {
            core.info('cxLog: ' + cxLog)
            logFile = cxLog.trim()
        } else {
            core.warning("No 'cxLog' valid input provided")
        }

        if (utils.isValidVersion(cxVersion)) {
            core.info('cxVersion: ' + cxVersion)
            version = cxVersion.trim()
        } else {
            core.warning("No 'cxVersion' valid input provided : " + version + " version will be used")
        }

        core.info("[END] Read Inputs...\n")

        await cxcli.downloadCli(version);

        let command = "./" + cxcli.getFolderName() + "/runCxConsole.sh Scan" +
            " -CxServer " + server +
            " -CxUser " + user +
            " -CxPassword " + password +
            " -ProjectName \"" + project + "\"" +
            " -preset \"" + preset + "\"" +
            " -LocationType folder" +
            " -LocationPath \"" + GITHUB_WORKSPACE + "\""

        if(config){
            command += " -Configuration \"" + config + "\""
        }

        if(excludeFolders){
            command += " -LocationPathExclude \"" + excludeFolders + "\""
        }

        if(excludeFiles){
            command += " -LocationFilesExclude \"" + excludeFiles + "\""
        }

        if (high >= 0) {
            command += " -SASTHigh " + high
        }

        if (medium >= 0) {
            command += " -SASTMedium " + medium
        }

        if (low >= 0) {
            command += " -SASTLow " + low
        }

        if(forceScan){
            command += " -ForceScan"
        }

        if(incremental){
            command += " -Incremental"
        }

        if(_private){
            command += " -Private"
        }

        if(logFile){
            command += " -Log " + logFile
        }

        if(verbose){
            command += " -v"
        }

        await cxcli.executeCommand(command)
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()

module.exports = {
    run: run
}