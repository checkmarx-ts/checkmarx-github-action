const utils = require('./utils.js')
const core = require('@actions/core')
const exec = require('@actions/exec')
const DOWNLOAD_DOMAIN = "https://download.checkmarx.com"
const DOWNLOAD_COMMON_PATH = "Plugins/CxConsolePlugin-"
const CLI_DOWNLOAD_URLS = [
    DOWNLOAD_DOMAIN + "/8.6.0/" + DOWNLOAD_COMMON_PATH + "8.60.3.zip",
    DOWNLOAD_DOMAIN + "/8.7.0/" + DOWNLOAD_COMMON_PATH + "8.70.4.zip",
    DOWNLOAD_DOMAIN + "/8.8.0/" + DOWNLOAD_COMMON_PATH + "8.80.2.zip",
    DOWNLOAD_DOMAIN + "/8.9.0/" + DOWNLOAD_COMMON_PATH + "8.90.2.zip",
]
const CLI_FOLDER_NAME = "cxcli"

function getCliDownloadUrl(cxVersion) {
    if (utils.isValidVersion(cxVersion) && CLI_DOWNLOAD_URLS.length - 1 == 3) {
        switch (cxVersion) {
            case "8.9":
                return CLI_DOWNLOAD_URLS[3]
            case "8.9.0":
                return CLI_DOWNLOAD_URLS[3]
            case "8.8":
                return CLI_DOWNLOAD_URLS[2]
            case "8.8.0":
                return CLI_DOWNLOAD_URLS[2]
            case "8.7":
                return CLI_DOWNLOAD_URLS[1]
            case "8.7.0":
                return CLI_DOWNLOAD_URLS[1]
            case "8.6":
                return CLI_DOWNLOAD_URLS[0]
            case "8.6.0":
                return CLI_DOWNLOAD_URLS[0]
            default:
                if (cxVersion.startsWith("8.9")) {
                    return CLI_DOWNLOAD_URLS[3]
                } else if (cxVersion.startsWith("8.8")) {
                    return CLI_DOWNLOAD_URLS[2]
                } else if (cxVersion.startsWith("8.7")) {
                    return CLI_DOWNLOAD_URLS[1]
                } else if (cxVersion.startsWith("8.6")) {
                    return CLI_DOWNLOAD_URLS[0]
                } else {
                    return CLI_DOWNLOAD_URLS[3]
                }
        }
    } else {
        return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1];
    }
}

async function downloadCli(cxVersion) {
    if (utils.isValidString(cxVersion)) {
        let cliDownloadUrl = getCliDownloadUrl(cxVersion)
        let versionFileName = "CxConsolePlugin-" + utils.getLastString(cliDownloadUrl).replace(".zip", "")
        core.info("[START] Download Checkmarx CLI from " + cliDownloadUrl + "...")

        await exec.exec("curl " + cliDownloadUrl + " -L -o " + CLI_FOLDER_NAME + ".zip")
        await exec.exec("unzip " + CLI_FOLDER_NAME + ".zip")
        await exec.exec("rm -rf " + CLI_FOLDER_NAME + ".zip")
        await exec.exec("mv " + versionFileName + " " + CLI_FOLDER_NAME)
        await exec.exec("rm -rf ./" + CLI_FOLDER_NAME + "/Examples")
        await exec.exec("ls " + CLI_FOLDER_NAME + "/")
        await exec.exec("mv ./" + CLI_FOLDER_NAME + "/CxConsolePlugin-CLI-" + versionFileName + ".jar " + " ./" + CLI_FOLDER_NAME + "/" + CLI_FOLDER_NAME + ".jar")
        await exec.exec("chmod +x ./" + CLI_FOLDER_NAME + "/runCxConsole.sh")
        await exec.exec("chmod +x ./" + CLI_FOLDER_NAME + "/runCxConsole.cmd")

        core.info("[END] Download Checkmarx CLI...\n")
        return true
    } else {
        core.setFailed("Invalid version : " + cxVersion)
        return false
    }
}

function getFolderName() {
    return CLI_FOLDER_NAME
}

function getCliDownloadUrls() {
    return CLI_DOWNLOAD_URLS
}

async function executeCommand(command) {
    if (utils.isValidString(command)) {
        core.info("\nCommand executed : " + command + "\n\n");
        await exec.exec(command)
        return true
    } else {
        core.info("Invalid command string : " + command)
        return false
    }
}

module.exports = {
    getCliDownloadUrl: getCliDownloadUrl,
    downloadCli: downloadCli,
    getFolderName: getFolderName,
    getCliDownloadUrls: getCliDownloadUrls,
    executeCommand: executeCommand
}