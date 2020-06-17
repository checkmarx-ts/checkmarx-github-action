const core = require("@actions/core")
const utils = require("../utils/utils")
const envs = process.env
const GITHUB_REPOSITORY = utils.getLastString(envs.GITHUB_REPOSITORY)
const CX_TOKEN = "cxToken"
const CX_USERNAME = "cxUsername"
const CX_PASSWORD = "cxPassword"
const CX_PROJECT = "cxProject"
const CX_TEAM = "cxTeam"

function error(key, value, skipIfFail) {
    let message = "Please provide " + key + " input (string) : " + value
    return coreError(message, skipIfFail)
}

function coreError(message, skipIfFail) {
    if (skipIfFail && skipIfFail != "false") {
        core.warning(message)
        core.warning("Step was skipped")
        return true
    } else {
        core.setFailed(message)
        return false
    }
}

function getDefaultProjectName() {
    if (envs.GITHUB_REF.startsWith("refs/heads/")) {
        const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
        return GITHUB_REPOSITORY + "-" + GITHUB_REF
    } else if (envs.GITHUB_REF.startsWith("refs/pull/")) {
        const GITHUB_REF = envs.GITHUB_REF.replace("/merge", "").replace("refs/", "").replace("/", "_")
        return GITHUB_REPOSITORY + "-" + envs.GITHUB_HEAD_REF + "-" + GITHUB_REF
    } else {
        const GITHUB_REF = utils.getLastString(envs.GITHUB_REF)
        return GITHUB_REPOSITORY + "-" + GITHUB_REF
    }
}

function get(key, isRequired) {
    if (utils.isValidString(key)) {
        return core.getInput(key, { required: isRequired })
    } else {
        return ""
    }
}

function getInt(key, isRequired) {
    let tempValue = get(key, isRequired)
    if (utils.isValidInt(tempValue)) {
        core.info(key + " : " + tempValue)
        const value = parseInt(tempValue)
        core.setOutput(key, value)
        return value
    } else {
        core.info(key + " was not provided")
        const value = -1
        core.setOutput(key, value)
        return value
    }
}

function getBoolean(key, isRequired) {
    let tempValue = get(key, isRequired)
    if (utils.isBoolean(tempValue)) {
        core.info(key + " : " + tempValue)
        const value = tempValue == "true"
        core.setOutput(key, value)
        return value
    } else {
        core.info(key + " was not provided")
        const value = false
        core.setOutput(key, value)
        return value
    }
}

function getString(key, isRequired, defaultValue, isPrivate) {
    const tempValue = get(key, isRequired)
    if (utils.isValidString(tempValue)) {
        if (!isPrivate) {
            core.info(key + " : " + tempValue)
        }
        const value = tempValue.trim()
        core.setOutput(key, value)
        return value
    } else {
        core.info(key + " was not provided")
        if (utils.isValidString(defaultValue)) {
            if (!isPrivate) {
                core.info("Default value will be used for " + key + " : " + defaultValue)
            }
            const value = defaultValue.trim()
            core.setOutput(key, value)
            return value
        } else {
            const value = ""
            core.setOutput(key, value)
            return value
        }
    }
}

function getArray(key, isRequired) {
    let array = []

    let tempString = get(key, isRequired)
    if (utils.isValidString(tempString)) {
        core.setOutput(key, tempString)
        if (tempString.indexOf(",") != -1) {
            array = tempString.split(",")
        } else {
            array = [tempString]
        }
    } else {
        core.setOutput(key, "")
        array = []
    }
    return array
}

function getCredentials(skipIfFail) {
    let credentials = ""
    let cxToken = get(CX_TOKEN, false)
    if (utils.isValidString(cxToken)) {
        core.info(CX_TOKEN + " was provided")
        let token = cxToken.trim()
        credentials = " -CxToken " + token
    } else {
        let cxUsername = get(CX_USERNAME, false)
        core.info(CX_TOKEN + " was not provided")
        if (utils.isValidString(cxUsername)) {
            core.info(CX_USERNAME + " : " + cxUsername)
            let user = cxUsername.trim()
            core.setOutput(CX_USERNAME, user)
            credentials = " -CxUser " + user
        } else {
            return error(CX_USERNAME, cxUsername, skipIfFail)
        }

        let cxPassword = get(CX_PASSWORD, false)
        if (utils.isValidString(cxPassword)) {
            let password = cxPassword.trim()
            credentials += " -CxPassword " + password
        } else {
            return error(CX_PASSWORD, "********", skipIfFail)
        }
    }
    return credentials
}

function getProject(skipIfFail) {
    let project = ""
    let cxTeam = get(CX_TEAM, true)
    if (utils.isValidTeam(cxTeam)) {
        core.setOutput(CX_TEAM, cxTeam)
        core.info(CX_TEAM + " : " + cxTeam)
        let team = cxTeam.trim()
        let cxProject = getString(CX_PROJECT, false, getDefaultProjectName())
        core.setOutput(CX_PROJECT, cxProject)
        if (team.indexOf("/") != -1) {
            project = team + "/" + cxProject
        } else {
            project = team + "\\" + cxProject
        }
    } else {
        return error(CX_TEAM, cxTeam, skipIfFail)
    }
    return project
}

module.exports = {
    error: error,
    coreError: coreError,
    get: get,
    getInt: getInt,
    getBoolean: getBoolean,
    getString: getString,
    getArray: getArray,
    getCredentials: getCredentials,
    getProject: getProject,
    getDefaultProjectName: getDefaultProjectName,
    //CLI
    CX_SKIP_IF_FAIL: "cxSkipIfFail",
    CX_VERSION: "cxVersion",
    CX_SERVER: "cxServer",
    CX_ACTION: "cxAction",
    CX_TRUSTED_CERTS: "cxTrustedCertificates",
    CX_LOG: "cxLog",
    CX_VERBOSE: "cxVerbose",
    CX_TOKEN: CX_TOKEN,
    CX_USERNAME: CX_USERNAME,
    CX_PASSWORD: CX_PASSWORD,
    CX_PROJECT: CX_PROJECT,
    CX_TEAM: CX_TEAM,
    //SAST
    CX_PRESET: "cxPreset",
    CX_HIGH: "cxHigh",
    CX_MEDIUM: "cxMedium",
    CX_LOW: "cxLow",
    CX_COMMENT: "cxComment",
    CX_FORCE_SCAN: "cxForceScan",
    CX_INCREMENTAL: "cxIncremental",
    CX_EXCLUDE_FOLDERS: "cxExcludeFolders",
    CX_EXCLUDE_FILES: "cxExcludeFiles",
    CX_CONFIGURATION: "cxConfiguration",
    CX_PRIVATE: "cxPrivate",
    CX_REPORT_XML: "cxReportXML",
    CX_REPORT_PDF: "cxReportPDF",
    CX_REPORT_RTF: "cxReportRTF",
    CX_REPORT_CSV: "cxReportCSV",
    //OSA
    CX_OSA_HIGH: "cxOsaHigh",
    CX_OSA_MEDIUM: "cxOsaMedium",
    CX_OSA_LOW: "cxOsaLow",
    CX_OSA_LOCATION_PATH: "cxOsaLocationPath",
    CX_OSA_ARCHIVE_TO_EXTRACT: "cxOsaArchiveToExtract",
    CX_OSA_FILES_INCLUDE: "cxOsaFilesInclude",
    CX_OSA_FILES_EXCLUDE: "cxOsaFilesExclude",
    CX_OSA_PATH_EXCLUDE: "cxOsaPathExclude",
    CX_OSA_REPORT_HTML: "cxOsaReportHtml",
    CX_OSA_REPORT_PDF: "cxOsaReportPDF",
    CX_OSA_DEPTH: "cxOsaDepth",
    CX_OSA_JSON: "cxOsaJson",
    //SCA
    CX_SCA_USERNAME: "cxScaUsername",
    CX_SCA_PASSWORD: "cxScaPassword",
    CX_SCA_ACCOUNT: "cxScaAccount",
    CX_SCA_API_URL: "cxScaApiUrl",
    CX_SCA_ACCESS_CONTROL_URL: "cxScaAcessControlUrl",
    CX_SCA_WEB_APP_URL: "cxScaWebAppUrl",
    CX_SCA_HIGH: "cxScaHigh",
    CX_SCA_MEDIUM: "cxScaMedium",
    CX_SCA_LOW: "cxScaLow",
    CX_SCA_LOCATION_PATH: "cxScaLocationPath",
    CX_SCA_FILES_INCLUDE: "cxScaFilesInclude",
    CX_SCA_FILES_EXCLUDE: "cxScaFilesExclude",
    CX_SCA_PATH_EXCLUDE: "cxScaPathExclude",
    //SCA & OSA
    CX_EXECUTE_PACKAGE_DEPENDENCY: "cxExecutePackageDependency",
    CX_CHECK_POLICY: "cxCheckPolicy",
    //GITHUB
    CX_GITHUB_ISSUES: "cxGithubIssues",
    CX_GITHUB_TOKEN: "cxGithubToken",
    CX_GITHUB_LABELS: "cxGithubLabels",
    CX_GITHUB_ASSIGNEES: "cxGithubAssignees",
    CX_GITHUB_MILESTONE: "cxGithubMilestone"
}