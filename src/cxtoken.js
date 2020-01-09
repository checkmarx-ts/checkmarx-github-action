const core = require('@actions/core')
const utils = require('./utils.js')
let user
let password
let token

async function revokeTokenGetCmd(server, skipIfFail) {
    if (utils.isValidUrl(server)) {
        let cxToken = core.getInput('cxToken', { required: true })

        if (utils.isValidString(cxToken)) {
            token = cxToken
        } else {
            if(skipIfFail && skipIfFail != "false"){
                core.warning("Please provide 'cxToken' input (string)")
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed("Please provide 'cxToken' input (string)")
                return
            }
        }

        let command = "RevokeToken" +
            " -CxServer " + server +
            " -CxToken " + token

        return command
    } else {
        if(skipIfFail && skipIfFail != "false"){
            core.warning("Invalid Server : " + server)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed("Invalid Server : " + server)
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
            if(skipIfFail && skipIfFail != "false"){
                core.warning("Please provide 'cxUsername' input (string) : " + cxUsername)
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed("Please provide 'cxUsername' input (string) : " + cxUsername)
                return
            }
        }

        if (utils.isValidString(cxPassword)) {
            password = cxPassword
        } else {
            if(skipIfFail && skipIfFail != "false"){
                core.warning("Please provide 'cxPassword' input (string)")
                core.warning("Step was skipped")
                return true
            } else {
                core.setFailed("Please provide 'cxPassword' input (string)")
                return
            }
        }

        core.setOutput("cxUsername", user)

        let command = "GenerateToken" +
            " -CxServer " + server +
            " -CxUser " + user +
            " -CxPassword " + password

        return command
    } else {
        if(skipIfFail && skipIfFail != "false"){
            core.warning("Invalid Server : " + server)
            core.warning("Step was skipped")
            return true
        } else {
            core.setFailed("Invalid Server : " + server)
            return
        }
    }
}

module.exports = {
    revokeTokenGetCmd: revokeTokenGetCmd,
    generateTokenGetCmd: generateTokenGetCmd
}