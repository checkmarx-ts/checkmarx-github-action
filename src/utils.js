const core = require('@actions/core')
const VALID_ACTIONS = ["Scan", "AsyncScan", "OsaScan", "AsyncOsaScan", "GenerateToken", "RevokeToken"]

function getLastString(s) {
    const method = arguments.callee.name
    if (s && s.length > 0 && typeof s === "string" && s.indexOf("/") != -1) {
        let auxArray = s.split("/")
        return auxArray[auxArray.length - 1]
    } else {
        core.warning("[" + method + "] variable is not defined")
        return s
    }
}

function isValidUrl(url) {
    return url && typeof url === "string" && url.length > 0 && url.toLowerCase().startsWith("https://")
}

function isValidString(s) {
    return s && typeof s === "string" && s.length > 0
}

function isValidInt(int) {
    return int && parseInt(int) >= 0
}

function isBoolean(bool) {
    if (bool != null && bool != undefined) {
        let b = bool.toString();
        return b == "true" || b == "false"
    } else {
        return false
    }
}

function isValidTeam(team) {
    return isValidString(team) && team.startsWith("\\") && !team.endsWith("\\")
}

function isValidFilename(filename) {
    return isValidString(filename) && filename.indexOf("/") == -1 && filename.indexOf("\\") == -1
}

function isValidVersion(version) {
    return isValidString(version) && (
        version.startsWith("9.0") ||
        version.startsWith("8.9") ||
        version.startsWith("8.8") ||
        version.startsWith("8.7") ||
        version.startsWith("8.6")
    )
}

function isValidAction(action) {
    return isValidString(action) && VALID_ACTIONS.includes(action)
}

function getValidAction() {
    return VALID_ACTIONS
}

module.exports = {
    getLastString: getLastString,
    isValidUrl: isValidUrl,
    isValidString: isValidString,
    isValidInt: isValidInt,
    isBoolean: isBoolean,
    isValidTeam: isValidTeam,
    isValidFilename: isValidFilename,
    isValidVersion: isValidVersion,
    isValidAction: isValidAction,
    getValidAction: getValidAction
}