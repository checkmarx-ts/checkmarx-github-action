const core = require("@actions/core")
const path = require("path")
const utils = require("../utils/utils.js")
const cxexclusions = require("../utils/exclusions.js")
const inputs = require("../github/inputs.js")
const envs = process.env
const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
const GITHUB_SHA = envs.GITHUB_SHA ? envs.GITHUB_SHA : "Unknown Commit SHA"
const DEFAULT_COMMENT = "git " + GITHUB_REF + "@" + GITHUB_SHA
const DEFAULT_FOLDER_EXCLUSIONS = cxexclusions.getDefaultFolderExclusions()
const DEFAULT_CONFIGURATION = "Default Configuration"
const DEFAULT_PRESET = "Checkmarx Default"

function getSastCmd(server, action, skipIfFail) {
    if (utils.isValidUrl(server) && utils.isValidAction(action)) {
        let credentials = inputs.getCredentials(skipIfFail)
        if (!utils.isValidString(credentials)) {
            return credentials
        }
        let project = inputs.getProject(skipIfFail)
        if (!utils.isValidString(project)) {
            return project
        }

        let preset = inputs.getString(inputs.CX_PRESET, false, DEFAULT_PRESET)
        let config = inputs.getString(inputs.CX_CONFIGURATION, false, DEFAULT_CONFIGURATION)
        let excludeFolders = inputs.getString(inputs.CX_EXCLUDE_FOLDERS, false, DEFAULT_FOLDER_EXCLUSIONS)
        excludeFolders = excludeFolders.trim()

        let excludeFiles = inputs.getString(inputs.CX_EXCLUDE_FILES, false, false)
        excludeFiles = excludeFiles.trim()

        let scanComment = inputs.getString(inputs.CX_COMMENT, false, DEFAULT_COMMENT)

        let high = inputs.getInt(inputs.CX_HIGH, false)
        let medium = inputs.getInt(inputs.CX_MEDIUM, false)
        let low = inputs.getInt(inputs.CX_LOW, false)

        let forceScan = inputs.getBoolean(inputs.CX_FORCE_SCAN, false)
        let incremental = inputs.getBoolean(inputs.CX_INCREMENTAL, false)
        let _private = inputs.getBoolean(inputs.CX_PRIVATE, false)

        let reportXml = inputs.getString(inputs.CX_REPORT_XML, false)
        let reportPdf = inputs.getString(inputs.CX_REPORT_PDF, false)
        let reportRtf = inputs.getString(inputs.CX_REPORT_RTF, false)
        let reportCsv = inputs.getString(inputs.CX_REPORT_CSV, false)

        let checkPolicy = inputs.getBoolean(inputs.CX_CHECK_POLICY, false)

        let cxGithubIssues = inputs.get(inputs.CX_GITHUB_ISSUES, false)
        if (utils.isBoolean(cxGithubIssues)) {
            core.info(inputs.CX_GITHUB_ISSUES + " : " + cxGithubIssues)
            if (cxGithubIssues && cxGithubIssues != "false") {
                if (!utils.isValidString(reportXml)) {
                    reportXml = GITHUB_WORKSPACE + path.sep + "report.xml"
                    core.info(inputs.CX_REPORT_XML + " will be the default: " + reportXml)
                } else {
                    core.info(inputs.CX_REPORT_XML + " : " + reportXml)
                }
            }
        } else {
            core.info(inputs.CX_GITHUB_ISSUES + " was not provided")
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

        if (checkPolicy && checkPolicy != "false") {
            command += " -CheckPolicy"
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
        return inputs.error(inputs.CX_SERVER, server, skipIfFail)
    }
}

module.exports = {
    getSastCmd: getSastCmd
}
