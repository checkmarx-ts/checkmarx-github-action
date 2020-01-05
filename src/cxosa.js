const core = require('@actions/core')
const utils = require('./utils.js')

async function getOsaCmd(server, action) {
    if (utils.isValidUrl(server) && utils.isValidAction(action)) {

    } else {
        core.setFailed("Invalid Server or action : " + server + " " + action)
        return
    }
}

module.exports = {
    getOsaCmd: getOsaCmd
}