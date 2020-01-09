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
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "9.00.2.zip"
]
const CLI_FOLDER_NAME = "cxcli"

function getCliDownloadUrl(cxVersion) {
    if (utils.isValidVersion(cxVersion) && CLI_DOWNLOAD_URLS.length - 1 == 4) {
        switch (cxVersion) {
            case "9.0":
                return CLI_DOWNLOAD_URLS[4]
            case "9.0.0":
                return CLI_DOWNLOAD_URLS[4]
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
        return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 2];
    }
}

async function downloadCli(cxVersion, skipIfFail) {
    if (utils.isValidString(cxVersion)) {
        let cliDownloadUrl = getCliDownloadUrl(cxVersion)
        if (cliDownloadUrl) {
            core.setOutput("cliDownloadUrl", cliDownloadUrl)
            let versionFileName = utils.getLastString(cliDownloadUrl).replace(".zip", "")
            if (versionFileName) {
                core.setOutput("cliVersionFileName", versionFileName)
                core.info("[START] Download Checkmarx CLI from " + cliDownloadUrl + "...")

                await exec.exec("curl -s " + cliDownloadUrl + " -L -o " + CLI_FOLDER_NAME + ".zip")
                await exec.exec("unzip -q " + CLI_FOLDER_NAME + ".zip")
                await exec.exec("rm -rf " + CLI_FOLDER_NAME + ".zip")
                if (!cxVersion.startsWith("9.0")) {
                    await exec.exec("mv " + versionFileName + " " + CLI_FOLDER_NAME)
                    await exec.exec("rm -rf ./" + CLI_FOLDER_NAME + "/Examples")
                    await exec.exec("chmod +x ./" + CLI_FOLDER_NAME + "/runCxConsole.sh")
                    await exec.exec("chmod +x ./" + CLI_FOLDER_NAME + "/runCxConsole.cmd")
                } else {
                    await exec.exec("rm -rf ./Examples")
                    await exec.exec("chmod +x ./runCxConsole.sh")
                    await exec.exec("chmod +x ./runCxConsole.cmd")
                }
                
                await exec.exec("ls -la")

                core.info("[END] Download Checkmarx CLI...\n")
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    } else {
        if (skipIfFail && skipIfFail != "false") {
            core.warning("Invalid version : " + cxVersion)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed("Invalid version : " + cxVersion)
            return false
        }
    }
}

function getFolderName() {
    return CLI_FOLDER_NAME
}

function getCliDownloadUrls() {
    return CLI_DOWNLOAD_URLS
}

async function executeCommand(command, skipIfFail) {
    if (utils.isValidString(command)) {
        core.setOutput("cmdExecuted", command)
        try {
            await exec.exec(command)
            return true
        } catch (e) {
            if (skipIfFail && skipIfFail != "false") {
                core.warning("Failed to execute command : " + e.message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed("Failed to execute command : " + e.message)
                return false
            }
        }
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