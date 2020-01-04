const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')
const envs = process.env
let tempGRepo = envs.GITHUB_REPOSITORY.split("/")
const GITHUB_REPOSITORY = tempGRepo[tempGRepo.length - 1]
let tempGRef = envs.GITHUB_REF.split("/")
const GITHUB_REF = tempGRef[tempGRef.length - 1]
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

        core.info("\n[START] Read Inputs...");

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

        if (cxServer && typeof cxServer === "string" && cxServer.length > 0 && cxServer.startsWith("https://")) {
            core.info('cxServer: ' + cxServer)
            server = cxServer
        } else {
            core.setFailed("Please provide 'cxServer' input (string - HTTPS should be used): " + cxServer)
            return
        }

        if (cxUsername && typeof cxUsername === "string" && cxUsername.length > 0) {
            core.info('cxUsername: ' + cxUsername)
            user = cxUsername
        } else {
            core.setFailed("Please provide 'cxUsername' input (string) : " + cxUsername)
            return
        }

        if (cxPassword && typeof cxPassword === "string" && cxPassword.length > 0) {
            password = cxPassword
        } else {
            core.setFailed("Please provide 'cxPassword' input (string)")
            return
        }

        if (cxTeam && typeof cxTeam === "string" && cxTeam.length > 0 && cxTeam.startsWith("\\")) {
            core.info('cxTeam: ' + cxTeam)
            team = cxTeam;
        } else {
            core.setFailed("Please provide 'cxTeam' input (string): " + cxTeam)
            return
        }

        if (cxPreset && typeof cxPreset === "string" && cxPreset.length > 0) {
            core.info('cxPreset: ' + cxPreset)
            preset = cxPreset
        } else {
            core.warning('Preset not provided')
            core.warning('Default Preset will be used: ' + preset)
        }

        if (cxConfiguration && typeof cxConfiguration === "string" && cxConfiguration.length > 0) {
            core.info('cxConfiguration: ' + cxConfiguration)
            config = cxConfiguration
        } else {
            core.warning('Scan Configuration not provided')
            core.warning('Default Configuration will be used: ' + config)
        }

        if (cxExcludeFolders && typeof cxExcludeFolders === "string" && cxExcludeFolders.length > 0) {
            core.info('cxExcludeFolders: ' + cxExcludeFolders)
            excludeFolders = cxExcludeFolders
        } else {
            core.warning("No 'cxExcludeFolders' input provided")
        }

        if (cxExcludeFiles && typeof cxExcludeFiles === "string" && cxExcludeFiles.length > 0) {
            core.info('cxExcludeFiles: ' + cxExcludeFiles)
            excludeFiles = cxExcludeFiles
        } else {
            core.warning("No 'cxExcludeFiles' input provided")
        }

        if (cxComment && typeof cxComment === "string" && cxComment.length > 0) {
            core.info('cxComment: ' + cxComment)
            scanComment = cxComment
        } else {
            core.warning('Scan comment not provided')
            scanComment = "git " + GITHUB_REF + "@" + GITHUB_SHA
            core.warning('Default Comment will be used: ' + scanComment)
        }

        if (parseInt(cxHigh) >= 0) {
            core.info('cxHigh: ' + cxHigh)
            high = parseInt(cxHigh)
        } else {
            core.warning('SAST High Threshold not provided : ' + cxHigh)
        }

        if (parseInt(cxMedium) >= 0) {
            core.info('cxMedium: ' + cxMedium)
            medium = parseInt(cxMedium)
        } else {
            core.warning('SAST Medium Threshold not provided : ' + cxMedium)
        }

        if (parseInt(cxLow) >= 0) {
            core.info('cxLow: ' + cxLow)
            low = parseInt(cxLow)
        } else {
            core.warning('SAST Low Threshold not provided : ' + cxLow)
        }

        if (typeof Boolean(cxForceScan) === "boolean") {
            core.info('cxForceScan: ' + cxForceScan)
            forceScan = Boolean(cxForceScan);
        } else {
            core.warning('Force Scan flag not provided')
            forceScan = false
        }

        if (typeof Boolean(cxIncremental) === "boolean") {
            core.info('cxIncremental: ' + cxIncremental)
            incremental = Boolean(cxIncremental);
        } else {
            core.warning('Incremental Scan flag not provided')
            incremental = false
        }

        if (typeof Boolean(cxPrivate) === "boolean") {
            core.info('cxPrivate: ' + cxPrivate)
            _private = Boolean(cxPrivate);
        } else {
            core.warning('Private Scan flag not provided')
            _private = false
        }

        if (typeof Boolean(cxVerbose) === "boolean") {
            core.info('cxVerbose: ' + cxVerbose)
            verbose = Boolean(cxVerbose);
        } else {
            core.warning('Verbose flag not provided')
            verbose = true
        }

        if (cxLog && typeof cxLog === "string" && cxLog.length > 0) {
            core.info('cxLog: ' + cxLog)
            logFile = cxLog
        } else {
            core.warning("No 'cxLog' input provided")
        }

        core.info("[END] Read Inputs...\n")
        core.info("[START] Download Checkmarx CLI...")
        
        await exec.exec("curl https://download.checkmarx.com/8.9.0/Plugins/CxConsolePlugin-8.90.0.zip -L -o cxcli.zip")
        await exec.exec("unzip cxcli.zip -d cxcli")
        await exec.exec("rm -rf cxcli.zip")
        await exec.exec("chmod +x /cxcli/runCxConsole.sh")

        core.info("[END] Download Checkmarx CLI...\n")

    } catch (error) {
        core.setFailed(error.message);
    }
}

run()