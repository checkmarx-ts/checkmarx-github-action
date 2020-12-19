const fs = require("fs")
const path = require("path")
const utils = require("../utils/utils.js")
const core = require("@actions/core")
const exec = require("@actions/exec")
const inputs = require("../github/inputs")
const outputs = require("../github/ouputs")
const isWin = process.platform === "win32" || process.platform === "win64"
const CLI_FOLDER_NAME = "cxcli"
const DOWNLOAD_DOMAIN = "https://download.checkmarx.com/"
const DOWNLOAD_COMMON_PATH = "/Plugins/CxConsolePlugin-"
const FILE_EXTENSION = ".zip"
const DOWNLOAD_PATH_8_6 = DOWNLOAD_DOMAIN + "8.6.0" + DOWNLOAD_COMMON_PATH
const DOWNLOAD_PATH_8_7 = DOWNLOAD_DOMAIN + "8.7.0" + DOWNLOAD_COMMON_PATH
const DOWNLOAD_PATH_8_8 = DOWNLOAD_DOMAIN + "8.8.0" + DOWNLOAD_COMMON_PATH
const DOWNLOAD_PATH_8_9 = DOWNLOAD_DOMAIN + "8.9.0" + DOWNLOAD_COMMON_PATH
const DOWNLOAD_PATH_9 = DOWNLOAD_DOMAIN + "9.0.0" + DOWNLOAD_COMMON_PATH
const CLI_DOWNLOAD_URLS = [
    DOWNLOAD_PATH_8_6 + "8.60.3",//0
    DOWNLOAD_PATH_8_7 + "8.70.4",//1
    DOWNLOAD_PATH_8_8 + "8.80.2",//2
    DOWNLOAD_PATH_8_9 + "8.90.2",//3
    DOWNLOAD_PATH_9 + "9.00.1",//4
    DOWNLOAD_PATH_9 + "9.00.2",//5
    DOWNLOAD_PATH_9 + "2020.1.12",//6
    DOWNLOAD_PATH_9 + "2020.2.3",//7
    DOWNLOAD_PATH_9 + "2020.2.7",//8
    DOWNLOAD_PATH_9 + "2020.2.11",//9
    DOWNLOAD_PATH_9 + "2020.2.18",//10
    DOWNLOAD_PATH_9 + "2020.3.1",//11
    DOWNLOAD_PATH_9 + "2020.4.4",//12
    DOWNLOAD_PATH_9 + "2020.4.12",//13
]

function getCliDownloadUrl(cxVersion) {
    if (isValidVersion(cxVersion)) {
        switch (cxVersion) {
            case "2020":
                return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
            case "2020.2":
                return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
            case "2020.4.12":
                return CLI_DOWNLOAD_URLS[13]
            case "2020.4.4":
                return CLI_DOWNLOAD_URLS[12]
            case "2020.3.1":
                return CLI_DOWNLOAD_URLS[11]
            case "2020.2.18":
                return CLI_DOWNLOAD_URLS[10]
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
                    return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
                } else if (cxVersion.startsWith("9.0")) {
                    return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
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
        if (utils.isValidString(cxVersion)) {
            if (cxVersion.startsWith("2020")) {
                return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
            } else if (cxVersion.startsWith("9.0")) {
                return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
            } else if (cxVersion.startsWith("8.9")) {
                return CLI_DOWNLOAD_URLS[3]
            } else if (cxVersion.startsWith("8.8")) {
                return CLI_DOWNLOAD_URLS[2]
            } else if (cxVersion.startsWith("8.7")) {
                return CLI_DOWNLOAD_URLS[1]
            } else if (cxVersion.startsWith("8.6")) {
                return CLI_DOWNLOAD_URLS[0]
            } else {
                return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
            }
        } else {
            return CLI_DOWNLOAD_URLS[CLI_DOWNLOAD_URLS.length - 1]
        }
    }
}

function isValidVersion(version) {
    return utils.isValidString(version) && (
        version.startsWith("2020") ||
        version.startsWith("9.0") ||
        version.startsWith("8.9") ||
        version.startsWith("8.8") ||
        version.startsWith("8.7") ||
        version.startsWith("8.6")
    )
}

async function downloadCli(cxVersion, skipIfFail) {
    if (utils.isValidString(cxVersion)) {
        let cliDownloadUrl = getCliDownloadUrl(cxVersion)
        if (cliDownloadUrl) {
            core.setOutput(outputs.CX_CLI_DOWNLOAD_URL, cliDownloadUrl + FILE_EXTENSION)
            let versionFileName = utils.getLastString(cliDownloadUrl)
            if (versionFileName) {
                core.setOutput("cxCliVersionFileName", versionFileName)
                core.info("[START] Download Checkmarx CLI from " + cliDownloadUrl + "...")
                const zipFileName = CLI_FOLDER_NAME + FILE_EXTENSION
                const cliExists = fs.existsSync(CLI_FOLDER_NAME)
                if (!cliExists) {
                    core.info("Checkmarx CLI does not exist in the path. Trying to download...\n")
                    if (isWin) {
                        await exec.exec("powershell.exe Invoke-WebRequest -Uri " + cliDownloadUrl + FILE_EXTENSION + " -OutFile " + zipFileName)
                    } else {
                        await exec.exec("curl -s " + cliDownloadUrl + FILE_EXTENSION + " -L -o " + zipFileName)
                    }
                    if (utils.is8Version(cxVersion)) {
                        if (fs.existsSync(zipFileName)) {
                            if (isWin) {
                                await exec.exec("powershell.exe Expand-Archive -LiteralPath " + zipFileName + " -DestinationPath .")
                            } else {
                                await exec.exec("unzip -q " + zipFileName)
                            }
                        } else {
                            core.info("Checkmarx CLI Zip File " + zipFileName + " does not exists")
                        }
                    } else {
                        if (fs.existsSync(zipFileName)) {
                            if (isWin) {
                                await exec.exec("powershell.exe Expand-Archive -LiteralPath " + zipFileName + " -DestinationPath " + CLI_FOLDER_NAME)
                            } else {
                                await exec.exec("unzip -q " + zipFileName + " -d " + CLI_FOLDER_NAME)
                            }
                        } else {
                            core.info("Checkmarx CLI Zip File " + zipFileName + " does not exists")
                        }
                    }
                    if (fs.existsSync(zipFileName)) {
                        if (isWin) {
                            await exec.exec("powershell.exe Remove-Item " + zipFileName + " -Force")
                        } else {
                            await exec.exec("rm -rf " + zipFileName)
                        }
                    } else {
                        core.info("Checkmarx CLI Zip File " + zipFileName + " does not exists")
                    }
                } else {
                    core.info("No need to download Checkmarx CLI because it already exists in the path with name " + CLI_FOLDER_NAME + "\n")
                }

                if (!cliExists) {
                    if (utils.is8Version(cxVersion)) {
                        if (fs.existsSync(versionFileName)) {
                            if (isWin) {
                                await exec.exec("powershell.exe Move-Item -Path " + versionFileName + " -Destination " + CLI_FOLDER_NAME)
                            } else {
                                await exec.exec("mv " + versionFileName + " " + CLI_FOLDER_NAME)
                            }
                        } else {
                            core.info("Checkmarx CLI Version Folder " + versionFileName + " does not exists")
                        }
                        const examplesFolder = "./" + CLI_FOLDER_NAME + "/Examples"
                        if (fs.existsSync(examplesFolder)) {
                            if (isWin) {
                                await exec.exec("powershell.exe Remove-Item " + examplesFolder + " -Recurse -Force")
                            } else {
                                await exec.exec("rm -rf " + examplesFolder)
                            }
                        } else {
                            core.info("Checkmarx CLI Examples Folder " + examplesFolder + " does not exists")
                        }
                    }
                }
                if (!isWin) {
                    const runLinux = "." + path.sep + CLI_FOLDER_NAME + path.sep + "runCxConsole.sh"
                    if (fs.existsSync(runLinux)) {
                        await exec.exec("chmod +x " + runLinux)
                    }
                }

                if (isWin) {
                    await exec.exec("powershell.exe Get-ChildItem")
                } else {
                    await exec.exec("ls -la")
                }

                core.info("[END] Download Checkmarx CLI...\n")
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    } else {
        return inputs.coreError("Invalid version : " + cxVersion, skipIfFail)
    }
}

function getFolderName() {
    return CLI_FOLDER_NAME
}

function getCliDownloadUrls() {
    return CLI_DOWNLOAD_URLS
}

function getCliStartCommand() {
    core.setOutput(outputs.CX_IS_WIN, isWin)
    if (isWin) {
        return getFolderName() + path.sep + "runCxConsole.cmd "
    } else {
        return getFolderName() + path.sep + "runCxConsole.sh "
    }
}

async function executeCommand(command, skipIfFail) {
    if (utils.isValidString(command)) {
        core.setOutput(outputs.CX_CMD_EXECUTED, command)
        try {
            await exec.exec(command)
            return true
        } catch (e) {
            return inputs.coreError("Failed to execute command : " + e.message, skipIfFail)
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
    getCliStartCommand: getCliStartCommand,
    executeCommand: executeCommand,
    isValidVersion: isValidVersion
}