const core = require("@actions/core")
const utils = require("../utils/utils.js")
const inputs = require("../github/inputs.js")
const cxexclusions = require("../utils/exclusions.js")
const envs = process.env
const GITHUB_WORKSPACE = envs.GITHUB_WORKSPACE
const DEFAULT_FOLDER_EXCLUSIONS = cxexclusions.getScaFolderExclusions()

function getScaCmd(action, skipIfFail) {
    if (utils.isValidAction(action)) {
        let credentials = ""
        let cxUsername = inputs.get(inputs.CX_SCA_USERNAME, false)
        if (utils.isValidString(cxUsername)) {
            core.info(inputs.CX_SCA_USERNAME + " : " + cxUsername)
            let user = cxUsername.trim()
            core.setOutput(inputs.CX_SCA_USERNAME, user)
            credentials = " -ScaUsername " + user
        } else {
            return inputs.error(inputs.CX_USERNAME, cxUsername, skipIfFail)
        }

        let cxPassword = inputs.get(inputs.CX_SCA_PASSWORD, false)
        if (utils.isValidString(cxPassword)) {
            let password = cxPassword.trim()
            credentials += " -ScaPassword " + password
        } else {
            return inputs.error(inputs.CX_SCA_PASSWORD, "********", skipIfFail)
        }

        let cxScaAccount = inputs.get(inputs.CX_SCA_ACCOUNT, false)
        if (utils.isValidString(cxScaAccount)) {
            let scaAccount = cxScaAccount.trim()
            credentials += " -ScaAccount " + scaAccount
        } else {
            return inputs.error(inputs.CX_SCA_ACCOUNT, cxScaAccount, skipIfFail)
        }

        let project

        let cxProject = inputs.getString(inputs.CX_PROJECT, false, inputs.getDefaultProjectName())
        core.setOutput(inputs.CX_PROJECT, cxProject)
        if (!utils.isValidString(cxProject)) {
            return cxProject
        } else {
            project = cxProject
        }

        let high = inputs.getInt(inputs.CX_SCA_HIGH, false)
        let medium = inputs.getInt(inputs.CX_SCA_MEDIUM, false)
        let low = inputs.getInt(inputs.CX_SCA_LOW, false)
        let scaApiUrl = inputs.getString(inputs.CX_SCA_API_URL, false)
        let scaAccessControlUrl = inputs.getString(inputs.CX_SCA_ACCESS_CONTROL_URL, false)
        let scaWebAppUrl = inputs.getString(inputs.CX_SCA_WEB_APP_URL, false)
        let scaLocationPath = inputs.getString(inputs.CX_SCA_LOCATION_PATH, false)
        let scaFilesInclude = inputs.getString(inputs.CX_SCA_FILES_INCLUDE, false)

        let scaFilesExclude = inputs.getString(inputs.CX_SCA_FILES_EXCLUDE, false)

        let scaPathExclude = inputs.getString(inputs.CX_SCA_PATH_EXCLUDE, DEFAULT_FOLDER_EXCLUSIONS)
        scaPathExclude = scaPathExclude.trim()

        let executePackageDependency = inputs.getBoolean(inputs.CX_EXECUTE_PACKAGE_DEPENDENCY, false)
        let checkPolicy = inputs.getBoolean(inputs.CX_CHECK_POLICY, false)

        let command = action +
            credentials +
            " -ProjectName \"" + project + "\"" +
            " -LocationType folder" +
            " -enableSca"

        if (scaApiUrl) {
            command += " -ScaApiUrl \"" + scaApiUrl + "\""
        }
        if (scaAccessControlUrl) {
            command += " -ScaAccessControlUrl \"" + scaAccessControlUrl + "\""
        }
        if (scaWebAppUrl) {
            command += " -ScaWebAppUrl \"" + scaWebAppUrl + "\""
        }
        if (high >= 0) {
            command += " -SCAHigh " + high
        }
        if (medium >= 0) {
            command += " -SCAMedium " + medium
        }
        if (low >= 0) {
            command += " -SCALow " + low
        }
        if (executePackageDependency && executePackageDependency != "false") {
            command += " -executepackagedependency"
        }
        if (checkPolicy && checkPolicy != "false") {
            command += " -CheckPolicy"
        }
        if (scaLocationPath) {
            command += " -ScaLocationPath \"" + scaLocationPath + "\""
        } else {
            command += " -ScaLocationPath \"" + GITHUB_WORKSPACE + "\""
        }
        if (scaFilesInclude) {
            command += " -ScaFilesInclude \"" + scaFilesInclude + "\""
        }
        if (scaFilesExclude) {
            command += " -ScaFilesExclude \"" + scaFilesExclude + "\""
        }
        if (scaPathExclude) {
            command += " -ScaPathExclude \"" + scaPathExclude + "\""
        }

        return command
    } else {
        return inputs.error(inputs.CX_SERVER, server, skipIfFail)
    }
}

module.exports = {
    getScaCmd: getScaCmd
}
