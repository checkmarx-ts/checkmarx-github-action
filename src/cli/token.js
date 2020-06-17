const core = require("@actions/core")
const utils = require("../utils/utils.js")
const inputs = require("../github/inputs.js")

function revokeTokenGetCmd(server, skipIfFail) {
    if (utils.isValidUrl(server)) {
        let token = ""

        let cxToken = inputs.get(inputs.CX_TOKEN, true)
        if (utils.isValidString(cxToken)) {
            token = cxToken.trim()
        } else {
            return inputs.error(inputs.CX_TOKEN, "********", skipIfFail)
        }

        let command = "RevokeToken -CxServer " + server +
            " -CxToken " + token

        return command
    } else {
        return inputs.error(inputs.CX_SERVER, server, skipIfFail)
    }
}

function generateTokenGetCmd(server, skipIfFail) {
    if (utils.isValidUrl(server)) {
        let user = ""
        let password = ""

        let cxUsername = inputs.get(inputs.CX_USERNAME, true)
        if (utils.isValidString(cxUsername)) {
            core.info(inputs.CX_USERNAME + " : " + cxUsername)
            user = cxUsername.trim()
        } else {
            return inputs.error(inputs.CX_USERNAME, cxUsername, skipIfFail)
        }

        let cxPassword = inputs.get(inputs.CX_PASSWORD, true)
        if (utils.isValidString(cxPassword)) {
            password = cxPassword.trim()
        } else {
            return inputs.error(inputs.CX_PASSWORD, "********", skipIfFail)
        }

        let command = "GenerateToken" +
            " -CxServer " + server +
            " -CxUser " + user +
            " -CxPassword " + password

        return command
    } else {
        return inputs.error(inputs.CX_SERVER, server, skipIfFail)
    }
}

module.exports = {
    revokeTokenGetCmd: revokeTokenGetCmd,
    generateTokenGetCmd: generateTokenGetCmd
}