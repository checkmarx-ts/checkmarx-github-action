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

async function getSastCmd(server, action) {
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
                core.setFailed("Please provide 'cxUsername' input (string) : " + cxUsername)
                return
            }

            if (utils.isValidString(cxPassword)) {
                password = cxPassword
            } else {
                core.setFailed("Please provide 'cxPassword' input (string)")
                return
            }
        }

        if (utils.isValidTeam(cxTeam)) {
            core.info('cxTeam: ' + cxTeam)
            team = cxTeam.trim()
            project = team + "\\" + GITHUB_REPOSITORY + "-" + GITHUB_REF
        } else {
            core.setFailed("Please provide 'cxTeam' input (string): " + cxTeam)
            return
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

        if(preset){
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
        core.setFailed("Invalid Server or action : " + server + " " + action)
        return
    }
}

module.exports = {
    getSastCmd: getSastCmd
}