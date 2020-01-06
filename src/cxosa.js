const core = require('@actions/core')
const utils = require('./utils.js')
const envs = process.env
const GITHUB_REPOSITORY = utils.getLastString(envs.GITHUB_REPOSITORY)
const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
let user
let password
let token
let project
let team
let high = -1
let medium = -1
let low = -1
let enableOsa = false

async function getOsaCmd(server, action) {
    if (utils.isValidUrl(server) && utils.isValidAction(action)) {
        let cxUsername = core.getInput('cxUsername', { required: false })
        let cxPassword = core.getInput('cxPassword', { required: false })
        let cxToken = core.getInput('cxToken', { required: false })
        let cxTeam = core.getInput('cxTeam', { required: true })
        let cxOsaHigh = core.getInput('cxOsaHigh', { required: false })
        let cxOsaMedium = core.getInput('cxOsaMedium', { required: false })
        let cxOsaLow = core.getInput('cxOsaLow', { required: false })
        let cxEnableOsa = core.getInput('cxEnableOsa', { required: false })
        let cxOsaLocationPath = core.getInput('cxOsaLocationPath', { required: false })
        let cxOsaArchiveToExtract = core.getInput('cxOsaArchiveToExtract', { required: false })
        let cxOsaFilesInclude = core.getInput('cxOsaFilesInclude', { required: false })
        let cxOsaFilesExclude = core.getInput('cxOsaFilesExclude', { required: false })
        let cxOsaPathExclude = core.getInput('cxOsaPathExclude', { required: false })
        let cxOsaReportHtml = core.getInput('cxOsaReportHtml', { required: false })
        let cxOsaReportPDF = core.getInput('cxOsaReportPDF', { required: false })
        let cxOsaDepth = core.getInput('cxOsaDepth', { required: false })
        let cxExecutePackageDependency = core.getInput('cxExecutePackageDependency', { required: false })
        let cxOsaJson = core.getInput('cxOsaJson', { required: false })
        let cxCheckPolicy = core.getInput('cxCheckPolicy', { required: false })

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

        if (utils.isValidInt(cxOsaHigh)) {
            core.info('cxOsaHigh: ' + cxOsaHigh)
            high = parseInt(cxOsaHigh)
        } else {
            core.warning('OSA High Threshold valid not provided : ' + cxOsaHigh)
        }

        if (utils.isValidInt(cxOsaMedium)) {
            core.info('cxOsaMedium: ' + cxOsaMedium)
            medium = parseInt(cxOsaMedium)
        } else {
            core.warning('OSA Medium Threshold valid not provided : ' + cxOsaMedium)
        }

        if (utils.isValidInt(cxOsaLow)) {
            core.info('cxOsaLow: ' + cxOsaLow)
            low = parseInt(cxOsaLow)
        } else {
            core.warning('OSA Low Threshold valid not provided : ' + cxOsaLow)
        }

        if (utils.isBoolean(cxEnableOsa)) {
            core.info('cxEnableOsa: ' + cxEnableOsa)
            enableOsa = Boolean(cxEnableOsa)
        } else {
            core.warning('Enable Osa Scan valid flag not provided')
            enableOsa = false
        }

        return
    } else {
        core.setFailed("Invalid Server or action : " + server + " " + action)
        return
    }
}

module.exports = {
    getOsaCmd: getOsaCmd
}