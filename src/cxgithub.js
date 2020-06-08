const github = require('@actions/github')

async function createIssue(repository, token, title, body, githubLabels, githubAssignees) {
    const repoSplit = repository.split("/")
    const owner = repoSplit[0]
    const repo = repoSplit[1]

    const octokit = github.getOctokit(token)
    
    let issueCreated = await octokit.issues.create({
        owner: owner,
        repo: repo,
        title: title,
        body: body,
        assignees: githubAssignees,
        labels:githubLabels
    })
    return true
}

module.exports = {
    createIssue: createIssue
}