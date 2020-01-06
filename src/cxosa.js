const core = require('@actions/core')
const utils = require('./utils.js')

async function getOsaCmd(server, action) {
    if (utils.isValidUrl(server) && utils.isValidAction(action)) {
        let cxUsername = core.getInput('cxUsername', { required: false })
        let cxPassword = core.getInput('cxPassword', { required: false })
        let cxToken = core.getInput('cxToken', { required: false })
        let cxTeam = core.getInput('cxTeam', { required: true })
        
        return
    } else {
        core.setFailed("Invalid Server or action : " + server + " " + action)
        return
    }
}

module.exports = {
    getOsaCmd: getOsaCmd
}