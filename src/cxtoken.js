const core = require('@actions/core')
const utils = require('./utils.js')
let user
let password
let token

async function revokeTokenGetCmd(server) {
    if (utils.isValidUrl(server)) {
        let cxToken = core.getInput('cxToken')

        if (utils.isValidString(cxToken)) {
            token = cxToken
        } else {
            core.setFailed("Please provide 'cxToken' input (string)")
            return
        }

        let command = "RevokeToken" +
            " -CxServer " + server +
            " -CxToken " + token

        return command
    } else {
        core.setFailed("Invalid Server : " + server)
        return
    }
}

async function generateTokenGetCmd(server) {
    if (utils.isValidUrl(server)) {
        let cxUsername = core.getInput('cxUsername')
        let cxPassword = core.getInput('cxPassword')

        if (utils.isValidString(cxUsername)) {
            core.info('cxUsername: ' + cxUsername)
            user = cxUsername.trim()
        } else {
            core.setFailed("Please provide 'cxUsername' input (string) : " + cxUsername)
            return
        }

        if (utils.isValidString(cxPassword)) {
            password = cxPassword
        } else {
            core.setFailed("Please provide 'cxPassword' input (string)")
            return
        }

        let command = "GenerateToken" +
            " -CxServer " + server +
            " -CxUser " + user +
            " -CxPassword " + password

        return command
    } else {
        core.setFailed("Invalid Server : " + server)
        return
    }
}

module.exports = {
    revokeTokenGetCmd: revokeTokenGetCmd,
    generateTokenGetCmd: generateTokenGetCmd
}