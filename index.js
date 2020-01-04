const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

async function run() {
    try {
        core.info('Event name: ' + github.context.eventName);
        //GET Inputs
        let cxServer = core.getInput('cxServer');
		let cxUsername = core.getInput('cxUsername');
		let cxPassword = core.getInput('cxPassword');
		let cxTeam = core.getInput('cxTeam');
		let cxPreset = core.getInput('cxPreset');
		let cxHigh = core.getInput('cxHigh');
		let cxMedium = core.getInput('cxMedium');
        let cxLow = core.getInput('cxLow');
        
        core.info('cxServer: ' + cxServer);
        core.info('cxUsername: ' + cxUsername);
        core.info('cxTeam: ' + cxTeam);
        core.info('cxPreset: ' + cxPreset);
        core.info('cxHigh: ' + cxHigh);
        core.info('cxMedium: ' + cxMedium);
        core.info('cxLow: ' + cxLow);

    } catch (error) {
		core.setFailed(error.message);
	}
}

run();