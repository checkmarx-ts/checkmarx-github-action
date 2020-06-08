const core = require('@actions/core')
const github = require('@actions/github')
const utils = require('./utils.js')

async function createIssues(){
    
    let cxGithubIssues = core.getInput('cxGithubIssues', { required: false })
    let createGithubIssues = false;
    if (utils.isBoolean(cxGithubIssues)) {
        core.info('cxGithubIssues: ' + cxGithubIssues)
        createGithubIssues = cxGithubIssues
    } else {
        core.info('cxGithubIssues was not provided')
        createGithubIssues = false
    }
    
    if (createGithubIssues && createGithubIssues != "false") {
        let cxGithubToken = core.getInput('cxGithubToken', { required: false })
        let token = ""
        if (utils.isValidString(cxGithubToken)) {
            core.info('cxGithubToken was provided')
            token = cxGithubToken
            //await cxgithub.createIssue(envs.GITHUB_REPOSITORY, cxGithubToken, "TEST - [Checkmarx] Vulnerability found", "Test vulnerability",["bug"], [])
        } else{
            token = ''
            core.info('cxGithubToken was not provided')
            core.info('No issues will be created')
            return false
        }

        if(token){
            let cxReportXML = core.getInput('cxReportXML', { required: false })
            if (utils.isValidString(cxReportXML)) {
                core.info('cxReportXML: ' + cxReportXML)
                reportXml = cxReportXML.trim()
            } else {
                core.info("No 'cxReportXML' input provided. It will be used: report.xml")
                reportXml = "report.xml"
            }
        }
    } else{
        core.info('Issues will not be created since cxGithubIssues was not provided or set to fals')
    }
}

async function createIssue(repository, token, title, body, githubLabels, githubAssignees) {
    const repoSplit = repository.split("/")
    const owner = repoSplit[0]
    const repo = repoSplit[1]

    core.info("Getting Octokit...")
    const octokit = github.getOctokit(token)
    
    core.info("Creating ticket for " + repository)
    let issueCreated = await octokit.issues.create({
        owner: owner,
        repo: repo,
        title: title,
        body: body,
        assignees: githubAssignees,
        labels:githubLabels
    })
    core.info("Ticket Created!")
    return true
}

module.exports = {
    createIssues: createIssues,
    createIssue: createIssue
}