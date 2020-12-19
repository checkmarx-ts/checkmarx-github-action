const core = require("@actions/core")
const SCAN = "Scan"
const ASYNC_SCAN = "AsyncScan"
const OSA_SCAN = "OsaScan"
const ASYNC_OSA_SCAN = "AsyncOsaScan"
const GENERATE_TOKEN = "GenerateToken"
const REVOKE_TOKEN = "RevokeToken"
const SCA_SCAN = "ScaScan"
const ASYNC_SCA_SCAN = "AsyncScaScan"
const DEFAULT_ACTION = SCAN
const VALID_ACTIONS = [SCAN, ASYNC_SCAN, OSA_SCAN, ASYNC_OSA_SCAN, SCA_SCAN, ASYNC_SCA_SCAN, GENERATE_TOKEN, REVOKE_TOKEN]
const HTTPS = "https://"
const STABLE_VERSION = "2020.4.12"

function getLastString(s) {
    const method = arguments.callee.name
    if (s && s.length > 0 && isString(s) && s.indexOf("/") != -1) {
        let auxArray = s.split("/")
        return auxArray[auxArray.length - 1]
    } else {
        core.warning("[" + method + "] variable " + s + " is not defined")
        return s
    }
}

function isString(s) {
    return typeof s === "string"
}

function isValidUrl(url) {
    return url && isString(url) && url.length > 0 && url.toLowerCase().startsWith(HTTPS)
}

function isValidString(s) {
    return s && isString(s) && s.length > 0
}

function isValidInt(int) {
    return int && parseInt(int) >= 0
}

function isBoolean(bool) {
    if (bool != null && bool != undefined) {
        let b = bool.toString()
        return b == "true" || b == "false"
    } else {
        return false
    }
}

function isValidTeam(team) {
    return isValidString(team) && (team.startsWith("\\") || team.startsWith("/")) && !team.endsWith("\\")
}

function isValidFilename(filename) {
    return isValidString(filename) && filename.indexOf("/") == -1 && filename.indexOf("\\") == -1
}

function isValidAction(action) {
    return isValidString(action) && VALID_ACTIONS.includes(action)
}

function getValidAction() {
    return VALID_ACTIONS
}

function getDefaultAction() {
    return DEFAULT_ACTION
}

function getStableVersion() {
    return STABLE_VERSION
}

function is9Version(version) {
    return version.startsWith("9.0") || version.startsWith("2020")
}
function is8Version(version) {
    return version.startsWith("8.")
}

module.exports = {
    SCAN: SCAN,
    ASYNC_SCAN: ASYNC_SCAN,
    OSA_SCAN: OSA_SCAN,
    ASYNC_OSA_SCAN: ASYNC_OSA_SCAN,
    SCA_SCAN: SCA_SCAN, 
    ASYNC_SCA_SCAN: ASYNC_SCA_SCAN,
    GENERATE_TOKEN: GENERATE_TOKEN,
    REVOKE_TOKEN: REVOKE_TOKEN,
    getLastString: getLastString,
    isValidUrl: isValidUrl,
    isValidString: isValidString,
    isValidInt: isValidInt,
    isBoolean: isBoolean,
    isValidTeam: isValidTeam,
    isValidFilename: isValidFilename,
    isValidAction: isValidAction,
    getValidAction: getValidAction,
    getDefaultAction: getDefaultAction,
    getStableVersion: getStableVersion,
    is9Version: is9Version,
    is8Version: is8Version
}