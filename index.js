const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')
const envs = process.env
const GITHUB_REPOSITORY = envs.GITHUB_REPOSITORY
const GITHUB_REF = envs.GITHUB_REF
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
const GITHUB_SHA = envs.GITHUB_SHA
let server
let user
let password
let team
let preset = "Checkmarx Default"
let config = "Default Configuration"
let scanComment
let high = -1
let medium = -1
let low = -1
let forceScan = false
let incremental = false
let excludeFolders 
let excludeFiles
let verbose
let _private
let logFile

async function run() {
    try {
        core.info('Event name: ' + github.context.eventName);
        core.info('Repository : ' + GITHUB_REPOSITORY);
        core.info('Branch : ' + GITHUB_REF);
        core.info('Workspace : ' + GITHUB_WORKSPACE);
        core.info('Commit SHA : ' + GITHUB_SHA);

        //GET Inputs
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

        if (cxServer && cxServer instanceof String && cxServer.length > 0 && cxServer.startsWith("https://")) {
            core.info('cxServer: ' + cxServer)
            server = cxServer
        } else {
            core.setFailed("Please provide 'cxServer' input (string - HTTPS should be used): " + cxServer)
            return
        }

        if (cxUsername && cxUsername instanceof String && cxUsername.length > 0) {
            core.info('cxUsername: ' + cxUsername)
            user = cxUsername
        } else {
            core.setFailed("Please provide 'cxUsername' input (string) : " + cxUsername)
            return
        }

        if (cxPassword && cxPassword instanceof String && cxPassword.length > 0) {
            password = cxPassword
        } else {
            core.setFailed("Please provide 'cxPassword' input (string)")
            return
        }

        if (cxTeam && cxTeam instanceof String && cxTeam.length > 0 && cxTeam.startsWith("\\")) {
            core.info('cxTeam: ' + cxTeam)
            team = cxTeam;
        } else {
            core.setFailed("Please provide 'cxTeam' input (string): " + cxTeam)
            return
        }

        if (cxPreset && cxPreset instanceof String && cxPreset.length > 0) {
            core.info('cxPreset: ' + cxPreset)
            preset = cxPreset
        } else {
            core.info('Default Preset will be used: ' + preset)
        }

        if (cxConfiguration && cxConfiguration instanceof String && cxConfiguration.length > 0) {
            core.info('cxConfiguration: ' + cxConfiguration)
            config = cxConfiguration
        } else {
            core.info('Default Configuration will be used: ' + config)
        }

        if (cxComment && cxComment instanceof String && cxComment.length > 0) {
            core.info('cxComment: ' + cxComment)
            scanComment = cxComment
        } else {
            scanComment = "git " + GITHUB_REF + "@" + GITHUB_SHA
            core.info('Default Comment will be used: ' + scanComment)
        }

        if (cxHigh && Number.isInteger(cxHigh) && cxHigh >= 0) {
            core.info('cxHigh: ' + cxHigh)
            high = cxHigh
        } else {
            core.info('SAST High Threshold not provided')
        }

        if (cxMedium && Number.isInteger(cxMedium) && cxMedium >= 0) {
            core.info('cxMedium: ' + cxMedium)
            medium = cxMedium
        } else {
            core.info('SAST Medium Threshold not provided')
        }

        if (cxLow && Number.isInteger(cxLow) && cxLow >= 0) {
            core.info('cxLow: ' + cxLow)
            low = cxLow
        } else {
            core.info('SAST Low Threshold not provided')
        }

        if(typeof cxForceScan === "boolean"){
            core.info('cxForceScan: ' + cxForceScan)
            forceScan = cxForceScan;
        } else {
            forceScan = false
        }

        if(typeof cxIncremental === "boolean"){
            core.info('cxIncremental: ' + cxIncremental)
            incremental = cxIncremental;
        } else {
            incremental = false
        }

        if (cxExcludeFolders && cxExcludeFolders instanceof String && cxExcludeFolders.length > 0) {
            core.info('cxExcludeFolders: ' + cxExcludeFolders)
            excludeFolders = cxExcludeFolders
        } else {
            core.info("No 'cxExcludeFolders' input provided")
        }

        if (cxExcludeFiles && cxExcludeFiles instanceof String && cxExcludeFiles.length > 0) {
            core.info('cxExcludeFiles: ' + cxExcludeFiles)
            excludeFiles = cxExcludeFiles
        } else {
            core.info("No 'cxExcludeFiles' input provided")
        }

        if(typeof cxPrivate === "boolean"){
            core.info('cxPrivate: ' + cxPrivate)
            _private = cxPrivate;
        } else {
            _private = false
        }

        if(typeof cxVerbose === "boolean"){
            core.info('cxVerbose: ' + cxVerbose)
            verbose = cxVerbose;
        } else {
            verbose = true
        }

        if (cxLog && cxLog instanceof String && cxLog.length > 0) {
            core.info('cxLog: ' + cxLog)
            logFile = cxLog
        } else {
            core.info("No 'cxLog' input provided")
        }

        core.info("READY TO PROCESS...");

    } catch (error) {
        core.setFailed(error.message);
    }
}

run()