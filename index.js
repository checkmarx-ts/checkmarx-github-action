const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

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
    let cxComment = core.getInput('cxComment');
    let cxForceScan = core.getInput('cxForceScan');
    let cxIncremental = core.getInput('cxIncremental');
    let cxExcludeFolders = core.getInput('cxExcludeFolders');
    let cxExcludeFiles = core.getInput('cxExcludeFiles');
    let cxConfiguration = core.getInput('cxConfiguration');
    let cxPrivate = core.getInput('cxPrivate');
    let cxLog = core.getInput('cxLog');
    let cxVerbose = core.getInput('cxVerbose');

    core.info('cxServer: ' + cxServer);
    core.info('cxUsername: ' + cxUsername);
    core.info('cxTeam: ' + cxTeam);
    core.info('cxPreset: ' + cxPreset);
    core.info('cxHigh: ' + cxHigh);
    core.info('cxMedium: ' + cxMedium);
    core.info('cxLow: ' + cxLow);
    core.info('cxComment: ' + cxComment);
    core.info('cxForceScan: ' + cxForceScan);
    core.info('cxIncremental: ' + cxIncremental);
    core.info('cxExcludeFolders: ' + cxExcludeFolders);
    core.info('cxExcludeFiles: ' + cxExcludeFiles);
    core.info('cxConfiguration: ' + cxConfiguration);
    core.info('cxPrivate: ' + cxPrivate);
    core.info('cxLog: ' + cxLog);
    core.info('cxVerbose: ' + cxVerbose);


} catch (error) {
    core.setFailed(error.message);
}