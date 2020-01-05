const utils = require('./utils.js')
const core = require('@actions/core')
const exec = require('@actions/exec')
const DOWNLOAD_DOMAIN = "https://download.checkmarx.com"
const CLI_DOWNLOAD_URLS = [
    DOWNLOAD_DOMAIN + "/8.9.0/Plugins/CxConsolePlugin-8.90.2.zip",
    DOWNLOAD_DOMAIN + "/8.8.0/Plugins/CxConsolePlugin-8.80.2.zip",
    DOWNLOAD_DOMAIN + "/8.7.0/Plugins/CxConsolePlugin-8.70.4.zip",
    DOWNLOAD_DOMAIN + "/8.6.0/Plugins/CxConsolePlugin-8.60.3.zip",
]
const CLI_FOLDER_NAME = "cxcli"

async function downloadCli(cxVersion) {
    let version = 0
    switch (cxVersion){
        case "8.9":
            version = 0
            break;
        case "8.9.0":
            version = 0
            break;
        case "8.8":
            version = 1
            break;
        case "8.8.0":
            version = 1
            break;
        case "8.7":
            version = 2
            break;
        case "8.7.0":
            version = 2
            break;
        case "8.6":
            version = 3
            break;
        case "8.6.0":
            version = 3
            break;
        default:
            version = 0
            break;
    }
    if (utils.isValidInt(version) && version < CLI_DOWNLOAD_URLS.length) {
        let cliDownloadUrl = CLI_DOWNLOAD_URLS[version]
        core.info("[START] Download Checkmarx CLI...")

        await exec.exec("curl " + cliDownloadUrl + " -L -o " + CLI_FOLDER_NAME + ".zip")
        await exec.exec("unzip " + CLI_FOLDER_NAME + ".zip -d " + CLI_FOLDER_NAME)
        await exec.exec("rm -rf " + CLI_FOLDER_NAME + ".zip")
        await exec.exec("rm -rf ./" + CLI_FOLDER_NAME + "/Examples")
        await exec.exec("chmod +x ./" + CLI_FOLDER_NAME + "/runCxConsole.sh")

        core.info("[END] Download Checkmarx CLI...\n")
    }
}

function getFolderName() {
    return CLI_FOLDER_NAME
}

async function executeCommand(command) {
    if (utils.isValidString(command)) {
        core.info("\nCommand executed : " + command + "\n\n");
        let cmdExecuted = await exec.exec(command)
        return true
    }
    return false
}

module.exports = {
    downloadCli: downloadCli,
    getFolderName: getFolderName,
    executeCommand: executeCommand
}