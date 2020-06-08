const core = require('@actions/core')
const github = require('@actions/github')

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
    createIssue: createIssue
}