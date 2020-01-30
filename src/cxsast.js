const core = require('@actions/core')
const utils = require('./utils.js')
const envs = process.env
const GITHUB_REPOSITORY = utils.getLastString(envs.GITHUB_REPOSITORY)
const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
const GITHUB_SHA = envs.GITHUB_SHA ? envs.GITHUB_SHA : "Unknown Commit SHA"
let user
let password
let token
let project
let team
let preset
let config
let scanComment = "git " + GITHUB_REF + "@" + GITHUB_SHA
let high = -1
let medium = -1
let low = -1
let forceScan = false
let incremental = false
let excludeFolders
let excludeFiles
let _private = false
let reportXml
let reportPdf
let reportRtf
let reportCsv
let defaultFolderExclusions = [
    "cxcli", //Folder created when downloading CLI
    "test", // Tests
    "tests", // Tests
    "mock", // Tests
    "mocks", // Tests
    "spec", // Tests
    "unit", // Tests
    "e2e", //Tests
    "androidTest", // Tests (Android)
    "build", // Build Folders
    "dist", // Build Folders
    "deploy", // Build Folders
    "venv", // Build Folders (Python)
    "maven", // Build Folders
    "gradle", // Build Folders (Android)
    "target", // Build Folders
    "example", // Dead Code
    "examples", // Dead Code
    "samples", // Dead Code
    "docs", // Non-relevant folders
    "images", // Non-relevant folders
    "swagger", // Non-relevant folders (Swagger)
    "coverage", // Non-relevant folders
    ".idea", // Non-relevant folders (IntelliJ IDEA)
    ".temp", // Non-relevant folders
    ".tmp", // Non-relevant folders
    ".grunt", // Non-relevant folders (Grunt)
    ".github", // Non-relevant folders (Github)
    ".vscode", // Non-relevant folders (VS Code)
    ".nuget", // Non-relevant folders (CSharp)
    ".mvn", // Non-relevant folders
    ".m2", // Non-relevant folders
    ".DS_Store", // Non-relevant folders
    ".sass-cache", // Non-relevant folders
    ".gradle", // Non-relevant folders (Android)
    "__pycache__", // Non-relevant folders (Python)
    ".pytest_cache", // Non-relevant folders (Python)
    ".settings", // Non-relevant folders (CSharp)
    "res/color*", // Non-relevant folders (Android)
    "res/drawable*", // Non-relevant folders (Android)
    "res/mipmap*", // Non-relevant folders (Android)
    "res/anim*", // Non-relevant folders (Android)
    "*imageset", // Non-relevant folders (IOS)
    "xcuserdata", // Non-relevant folders (IOS)
    "xcshareddata", // Non-relevant folders (IOS)
    "*xcassets", // Non-relevant folders (IOS)
    "*appiconset", // Non-relevant folders (IOS)
    "*xcodeproj", // Non-relevant folders (IOS)
    "*framework", // Non-relevant folders (IOS)
    "*lproj", // Non-relevant folders (IOS)
    "__MACOSX", // Non-relevant folders (IOS)
    "css", // CSS not supported
    "react", //3rd Party Libraries
    "yui", //3rd Party Libraries
    "node_modules", //3rd Party Libraries (Node JS)
    "jquery*", //3rd Party Libraries
    "angular*", //3rd Party Libraries
    "bootstrap*", //3rd Party Libraries
    "modernizr*", //3rd Party Libraries
    "dojo", //3rd Party Libraries
    "package", //3rd Party Libraries (CSharp)
    "packages", //3rd Party Libraries (CSharp)
    "vendor", //3rd Party Libraries (Golang)
    "xjs", //3rd Party Libraries
].join()
let defaultFileExclusions = [
    "*.min.js", //3rd Party Libraries (JS)
    "*.spec", // Tests (JS/Typescript/Node JS)
    "*.spec.*", // Tests (JS/Typescript/Node JS)
    "*Test.*", // Tests
    "Test*", // Tests
    "test*", // Tests
    "*Mock*", // Tests
    "Mock*", // Tests
].join()

async function getSastCmd(server, action, skipIfFail) {
    if (utils.isValidUrl(server) && utils.isValidAction(action)) {
        let cxUsername = core.getInput('cxUsername', { required: false })
        let cxPassword = core.getInput('cxPassword', { required: false })
        let cxToken = core.getInput('cxToken', { required: false })
        let cxTeam = core.getInput('cxTeam', { required: true })
        let cxPreset = core.getInput('cxPreset', { required: false })
        let cxHigh = core.getInput('cxHigh', { required: false })
        let cxMedium = core.getInput('cxMedium', { required: false })
        let cxLow = core.getInput('cxLow', { required: false })
        let cxComment = core.getInput('cxComment', { required: false })
        let cxForceScan = core.getInput('cxForceScan', { required: false })
        let cxIncremental = core.getInput('cxIncremental', { required: false })
        let cxExcludeFolders = core.getInput('cxExcludeFolders', { required: false })
        let cxExcludeFiles = core.getInput('cxExcludeFiles', { required: false })
        let cxConfiguration = core.getInput('cxConfiguration', { required: false })
        let cxPrivate = core.getInput('cxPrivate', { required: false })
        let cxReportXML = core.getInput('cxReportXML', { required: false })
        let cxReportPDF = core.getInput('cxReportPDF', { required: false })
        let cxReportRTF = core.getInput('cxReportRTF', { required: false })
        let cxReportCSV = core.getInput('cxReportCSV', { required: false })

        if (utils.isValidString(cxToken)) {
            token = cxToken
        } else {
            if (utils.isValidString(cxUsername)) {
                core.info('cxUsername: ' + cxUsername)
                user = cxUsername.trim()
            } else {
                let message = "Please provide 'cxUsername' input (string) : " + cxUsername
                if (skipIfFail && skipIfFail != "false") {
                    core.warning(message)
                    core.warning("Step was skipped")
                    return true
                } else {
                    core.setFailed(message)
                    return
                }
            }

            if (utils.isValidString(cxPassword)) {
                password = cxPassword
            } else {
                let message = "Please provide 'cxPassword' input (string)"
                if (skipIfFail && skipIfFail != "false") {
                    core.warning(message)
                    core.warning("Step was skipped")
                    return true
                } else {
                    core.setFailed(message)
                    return
                }
            }
        }

        if (utils.isValidTeam(cxTeam)) {
            core.info('cxTeam: ' + cxTeam)
            team = cxTeam.trim()
            project = team + "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF
        } else {
            let message = "Please provide 'cxTeam' input (string): " + cxTeam
            if (skipIfFail && skipIfFail != "false") {
                core.warning(message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed(message)
                return
            }
        }

        if (utils.isValidString(cxPreset)) {
            core.info('cxPreset: ' + cxPreset)
            preset = cxPreset.trim()
        } else {
            core.warning('"cxPreset" not provided')
            core.info('Default Preset will be used: Checkmarx Default')
        }

        if (utils.isValidString(cxConfiguration)) {
            core.info('cxConfiguration: ' + cxConfiguration)
            config = cxConfiguration.trim()
        } else {
            core.warning('"cxConfiguration" not provided')
            core.info('Default Configuration will be used: Default Configuration')
        }

        if (utils.isValidString(cxExcludeFolders)) {
            core.info('cxExcludeFolders: ' + cxExcludeFolders)
            excludeFolders = defaultFolderExclusions + "," + cxExcludeFolders.trim()
            core.info("Following folder exclusions will be applied:")
            core.info(excludeFolders)
        } else {
            excludeFolders = defaultFolderExclusions
            core.warning("No 'cxExcludeFolders' input provided")
            core.info("Default Folder exclusions will be applied:")
            core.info(defaultFolderExclusions)
        }

        if (utils.isValidString(cxExcludeFiles)) {
            core.info('cxExcludeFiles: ' + cxExcludeFiles)
            excludeFiles = defaultFileExclusions + "," + cxExcludeFiles.trim()
            core.info("Following file exclusions will be applied:")
            core.info(excludeFiles)
        } else {
            core.warning("No 'cxExcludeFiles' input provided")
            core.info("Default File exclusions will be applied:")
            core.info(defaultFileExclusions)
        }

        if (utils.isValidString(cxComment)) {
            core.info('cxComment: ' + cxComment)
            scanComment = cxComment.trim()
        } else {
            core.warning('"cxComment" not provided')
            core.info('Default Comment will be used: ' + scanComment)
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
            forceScan = cxForceScan
        } else {
            core.warning('Force Scan valid flag not provided')
            forceScan = false
        }

        if (utils.isBoolean(cxIncremental)) {
            core.info('cxIncremental: ' + cxIncremental)
            incremental = cxIncremental
        } else {
            core.warning('Incremental Scan valid flag not provided')
            incremental = false
        }

        if (utils.isBoolean(cxPrivate)) {
            core.info('cxPrivate: ' + cxPrivate)
            _private = cxPrivate
        } else {
            core.warning('Private Scan valid flag not provided')
            _private = false
        }

        if (utils.isValidString(cxReportXML)) {
            core.info('cxReportXML: ' + cxReportXML)
            reportXml = cxReportXML.trim()
        } else {
            core.warning("No 'cxReportXML' input provided")
        }

        if (utils.isValidString(cxReportPDF)) {
            core.info('cxReportPDF: ' + cxReportPDF)
            reportPdf = cxReportPDF.trim()
        } else {
            core.warning("No 'cxReportPDF' input provided")
        }

        if (utils.isValidString(cxReportRTF)) {
            core.info('cxReportRTF: ' + cxReportRTF)
            reportRtf = cxReportRTF.trim()
        } else {
            core.warning("No 'cxReportRTF' input provided")
        }

        if (utils.isValidString(cxReportCSV)) {
            core.info('cxReportCSV: ' + cxReportCSV)
            reportCsv = cxReportCSV.trim()
        } else {
            core.warning("No 'cxReportCSV' input provided")
        }

        let credentials = ""

        if (token) {
            credentials = " -CxToken " + token
        } else {
            credentials = " -CxUser " + user + " -CxPassword " + password
        }

        if (preset) {
            preset = " -preset \"" + preset + "\""
        } else {
            preset = ""
        }

        let command = action +
            " -CxServer " + server +
            credentials +
            " -ProjectName \"" + project + "\"" +
            preset +
            " -LocationType folder" +
            " -LocationPath \"" + GITHUB_WORKSPACE + "\""

        if (config) {
            command += " -Configuration \"" + config + "\""
        }

        if (excludeFolders) {
            command += " -LocationPathExclude \"" + excludeFolders + "\""
        }

        if (excludeFiles) {
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

        if (forceScan && forceScan != "false") {
            command += " -ForceScan"
        }

        if (incremental && incremental != "false") {
            command += " -Incremental"
        }

        if (_private && _private != "false") {
            command += " -Private"
        }

        if (scanComment) {
            command += " -Comment \"" + scanComment + "\""
        }

        if (reportXml) {
            command += " -ReportXML \"" + reportXml + "\""
        }

        if (reportPdf) {
            command += " -ReportPDF \"" + reportPdf + "\""
        }

        if (reportRtf) {
            command += " -ReportRTF \"" + reportRtf + "\""
        }

        if (reportCsv) {
            command += " -ReportCSV \"" + reportCsv + "\""
        }

        return command
    } else {
        let message = "Invalid Server or action : " + server + " " + action
        if (skipIfFail && skipIfFail != "false") {
            core.warning(message)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed(message)
            return
        }
    }
}

module.exports = {
    getSastCmd: getSastCmd
}