const fs = require("fs")
const utils = require('./utils.js')
const core = require('@actions/core')
const exec = require('@actions/exec')
const DOWNLOAD_DOMAIN = "https://download.checkmarx.com"
const DOWNLOAD_COMMON_PATH = "Plugins/CxConsolePlugin-"
const CLI_DOWNLOAD_URLS = [
    DOWNLOAD_DOMAIN + "/8.6.0/" + DOWNLOAD_COMMON_PATH + "8.60.3.zip",//0
    DOWNLOAD_DOMAIN + "/8.7.0/" + DOWNLOAD_COMMON_PATH + "8.70.4.zip",//1
    DOWNLOAD_DOMAIN + "/8.8.0/" + DOWNLOAD_COMMON_PATH + "8.80.2.zip",//2
    DOWNLOAD_DOMAIN + "/8.9.0/" + DOWNLOAD_COMMON_PATH + "8.90.2.zip",//3
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "9.00.1.zip",//4
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "9.00.2.zip",//5
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.1.12.zip",//6
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.2.3.zip",//7
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.2.7.zip",//8
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.2.11.zip",//9
]
const CLI_FOLDER_NAME = "cxcli"

function getCliDownloadUrl(cxVersion) {
    if (utils.isValidVersion(cxVersion)) {
        switch (cxVersion) {
            case "2020":
                return CLI_DOWNLOAD_URLS[9]
            case "2020.2":
                return CLI_DOWNLOAD_URLS[9]
            case "2020.2.11":
                return CLI_DOWNLOAD_URLS[9]
            case "2020.2.7":
                return CLI_DOWNLOAD_URLS[8]
            case "2020.2.3":
                return CLI_DOWNLOAD_URLS[7]
            case "2020.1":
                return CLI_DOWNLOAD_URLS[6]
            case "2020.1.12":
                return CLI_DOWNLOAD_URLS[6]
            case "9.0":
                return CLI_DOWNLOAD_URLS[5]
            case "9.0.0":
                return CLI_DOWNLOAD_URLS[5]
            case "9.0.2":
                return CLI_DOWNLOAD_URLS[5]
            case "9.0.1":
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
                if (cxVersion.startsWith("2020")) {
                    return CLI_DOWNLOAD_URLS[9]
                } else if (cxVersion.startsWith("9.0")) {
                    return CLI_DOWNLOAD_URLS[9]
                } else if (cxVersion.startsWith("8.9")) {
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
        if (cxVersion.startsWith("2020")) {
            return CLI_DOWNLOAD_URLS[9]
        } else if (cxVersion.startsWith("9.0")) {
            return CLI_DOWNLOAD_URLS[9]
        } else if (cxVersion.startsWith("8.9")) {
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

                const cliExists = fs.existsSync(CLI_FOLDER_NAME)
                if (!cliExists) {
                    core.info("Checkmarx CLI does not exist in the path. Trying to download...\n")
                    await exec.exec("curl -s " + cliDownloadUrl + " -L -o " + CLI_FOLDER_NAME + ".zip")
                    if (!cxVersion.startsWith("9.0") && !cxVersion.startsWith("2020")) {
                        await exec.exec("unzip -q " + CLI_FOLDER_NAME + ".zip")
                    } else {
                        await exec.exec("unzip -q " + CLI_FOLDER_NAME + ".zip -d " + CLI_FOLDER_NAME)
                    }
                    await exec.exec("rm -rf " + CLI_FOLDER_NAME + ".zip")
                } else {
                    core.info("No need to download Checkmarx CLI because it already exists in the path with name '" + CLI_FOLDER_NAME + "'\n")
                }

                if(!cliExists){
                    await exec.exec("mv " + versionFileName + " " + CLI_FOLDER_NAME)
                    await exec.exec("rm -rf ./" + CLI_FOLDER_NAME + "/Examples")
                }
                await exec.exec("chmod +x ./" + CLI_FOLDER_NAME + "/runCxConsole.sh")
                await exec.exec("chmod +x ./" + CLI_FOLDER_NAME + "/runCxConsole.cmd")
               
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
        let message = "Invalid version : " + cxVersion
        if (skipIfFail && skipIfFail != "false") {
            core.warning(message)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed(message)
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
            core.info(command)
            await exec.exec(command)
            return true
        } catch (e) {
            let message = "Failed to execute command : " + e.message
            if (skipIfFail && skipIfFail != "false") {
                core.warning(message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed(message)
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