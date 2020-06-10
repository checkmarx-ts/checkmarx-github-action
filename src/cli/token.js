const core = require('@actions/core')
const utils = require('./utils.js')
let user
let password
let token

async function revokeTokenGetCmd(server, skipIfFail) {
    if (utils.isValidUrl(server)) {
        let cxToken = core.getInput('cxToken', { required: true })

        if (utils.isValidString(cxToken)) {
            token = cxToken.trim()
        } else {
            let message = "Please provide 'cxToken' input (string)"
            if(skipIfFail && skipIfFail != "false"){
                core.warning(message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed(message)
                return
            }
        }

        let command = "RevokeToken" +
            " -CxServer " + server +
            " -CxToken " + token

        return command
    } else {
        let message = "Invalid Server : " + server
        if(skipIfFail && skipIfFail != "false"){
            core.warning(message)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed(message)
            return
        }
    }
}

async function generateTokenGetCmd(server, skipIfFail) {
    if (utils.isValidUrl(server)) {
        let cxUsername = core.getInput('cxUsername', { required: true })
        let cxPassword = core.getInput('cxPassword', { required: true })

        if (utils.isValidString(cxUsername)) {
            core.info('cxUsername: ' + cxUsername)
            user = cxUsername.trim()
        } else {
            let message = "Please provide 'cxUsername' input (string) : " + cxUsername
            if(skipIfFail && skipIfFail != "false"){
                core.warning(message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed(message)
                return
            }
        }

        if (utils.isValidString(cxPassword)) {
            password = cxPassword.trim()
        } else {
            let message = "Please provide 'cxPassword' input (string)"
            if(skipIfFail && skipIfFail != "false"){
                core.warning(message)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed(message)
                return
            }
        }

        let command = "GenerateToken" +
            " -CxServer " + server +
            " -CxUser " + user +
            " -CxPassword " + password

        return command
    } else {
        let message = "Invalid Server : " + server
        if(skipIfFail && skipIfFail != "false"){
            core.warning(message)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed(message)
            return
        }
    }
}

module.exports = {
    revokeTokenGetCmd: revokeTokenGetCmd,
    generateTokenGetCmd: generateTokenGetCmd
}