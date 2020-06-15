const core = require('@actions/core')
const github = require('@actions/github')
const report = require('../report/report')
const inputs = require("./inputs")
const HTTP_STATUS_OK = 200
const HTTP_STATUS_CREATED = 201

function getToken() {
    let token = ""
    let createGithubIssues = inputs.getBoolean(inputs.CX_GITHUB_ISSUES, false)

    if (createGithubIssues && createGithubIssues != "false") {
        token = inputs.getString(inputs.CX_GITHUB_TOKEN, false, true)
    } else {
        core.info('Issues will not be created since cxGithubIssues was not provided or set to false')
    }

    return token
}

async function createIssues(repository, commitSha, workspace) {

    let token = getToken()

    if (token) {

        let githubLabels = inputs.getArray(inputs.CX_GITHUB_LABELS, false)
        githubLabels.push("checkmarx")
        let githubAssignees = inputs.getArray(inputs.CX_GITHUB_ASSIGNEES, false)
        let githubMilestone = inputs.getInt(inputs.CX_GITHUB_MILESTONE, false)

        const repoSplit = repository.split("/")
        const owner = repoSplit[0]
        const repo = repoSplit[1]

        core.info("Getting Octokit...")
        const octokit = github.getOctokit(token)
        if (octokit) {
            let xmlPath = report.getXmlReportPath(workspace)
            let issues = report.getIssuesFromXml(xmlPath, repository, commitSha)
            if (issues) {
                let repositoryIssues = await getIssues(owner, repo, octokit)
                let summary = report.getSummary(issues)
                await createCommitComment(owner, repo, octokit, commitSha, "My Summary Test Comment", null, null)
                for (let i = 0; i < issues.length; i++) {
                    let issue = issues[i]

                    let issueGithubLabels = report.getLabels(githubLabels, issue)

                    const title = "[Checkmarx] " + issue.queryGroup + " - " + issue.queryName + " : " + issue.similarityId
                    let body = "**" + issue.resultSeverity + " - " + issue.queryName + "**\n"
                    body += "-----------------------------------\n"
                    for (let j = 0; j < issue.resultNodes.length; j++) {
                        let node = issue.resultNodes[j]
                        body += "**" + j + " Node** - Line " + node.line + " - " + node.name + "\n"
                        body += node.fileName + "\n"
                        body += "-----------------------------------\n"
                    }
                    body += "\n"
                    body += "**Comments**\n"
                    for (let j = 0; j < issue.resultRemark.length; j++) {
                        body += issue.resultRemark[j] + "\n"
                    }
                    body += "\n"
                    body += "-----------------------------------\n"
                    body += "**Project Details**\n"
                    body += "Checkmarx Version: " + issue.cxVersion + "\n"
                    body += "Project ID: " + issue.projectId + "\n"
                    body += "Project Name: " + issue.projectName + "\n"
                    body += "Preset: " + issue.preset + "\n"
                    body += "Owner: " + issue.owner + "\n"
                    body += "Team: " + issue.teamFullPath + "\n"
                    body += "\n"
                    body += "-----------------------------------\n"
                    body += "**Scan Details**\n"
                    body += "Initiator Name: " + issue.initiatorName + "\n"
                    body += "Scan ID: " + issue.scanId + "\n"
                    body += "LOC: " + issue.loc + "\n"
                    body += "Files Scanned: " + issue.filesScanned + "\n"
                    body += "Scan Type: " + issue.scanType + "\n"
                    body += "Scan URL: " + issue.scanDeepLink + "\n"
                    body += "Scan Comment: " + issue.scanComment + "\n"
                    body += "Scan Type: " + issue.scanTime + "\n"
                    body += "Scan Start Date: " + issue.scanStartDate + "\n"
                    body += "Scan Time: " + issue.scanTime + "\n"
                    body += "Source Origin: " + issue.sourceOrigin + "\n"
                    body += "Visibility: " + issue.visibility + "\n"
                    body += "\n"
                    body += "-----------------------------------\n"
                    body += "**Result Details**\n"
                    body += "Query ID: " + issue.queryId + "\n"
                    body += "Query Path: " + issue.queryPath + "\n"
                    body += "Query Group: " + issue.queryGroup + "\n"
                    body += "Query Name: " + issue.queryName + "\n"
                    body += "Query Language: " + issue.queryLanguage + "\n"
                    body += "Query Language Hash: " + issue.queryLanguageHash + "\n"
                    body += "Query Language Change Date: " + issue.queryLanguageChangeDate + "\n"
                    body += "Query Version Code: " + issue.queryVersionCode + "\n"
                    body += "Query Severity: " + issue.querySeverity + "\n"
                    body += "Query Severity Index: " + issue.querySeverityIndex + "\n"
                    body += "Similarity ID: " + issue.similarityId + "\n"
                    body += "Path ID: " + issue.pathId + "\n"
                    body += "Result ID: " + issue.resultId + "\n"
                    body += "Result State: " + issue.resultState + "\n"
                    body += "Result Severity: " + issue.resultSeverity + "\n"
                    body += "Result Status: " + issue.resultStatus + "\n"
                    body += "Result Assignee: " + issue.resultAssignee + "\n"
                    body += "\n"
                    body += "-----------------------------------\n"
                    body += "**Mitigation Details**\n"
                    body += "Checkmarx Recommendations URL: " + issue.scanDeepLink.split("/ViewerMain.aspx")[0] + "/ScanQueryDescription.aspx?queryID=" + issue.queryId + "&queryVersionCode=" + issue.queryVersionCode + "&queryTitle=" + issue.queryName + "\n"
                    body += "CWE ID: " + issue.cweId + "\n"
                    body += "CWE URL: https://cwe.mitre.org/data/definitions/" + issue.cweId + ".html\n"

                    let issueId = await createIssue(owner, repo, octokit, title, body, issueGithubLabels, githubAssignees, githubMilestone, i)

                    for (let j = 0; j < issue.resultNodes.length; j++) {
                        let node = issue.resultNodes[j]
                        let commentBody = "**#" + issueId + " - " + issue.resultSeverity + " - " + issue.queryName + " - " + j + " Node** - " + node.name
                        await createCommitComment(owner, repo, octokit, commitSha, commentBody, node.relativefileName, node.line)
                    }
                    issueGithubLabels = []
                }
            }
        } else {
            core.info("Unable to authenticate to octokit. Please provide a proper GITHUB_TOKEN")
        }
    } else {
        core.info('No issues will be created')
    }
}

async function getIssues(owner, repo, octokit) {
    core.info("\nGetting Issues from " + owner + "/" + repo)
    let issues = []
    for (let i = 0; i < 1000000; i++) {//TODO Find a better way to get total number of pages for issues
        let res = await octokit.issues.listForRepo({
            owner: owner,
            repo: repo,
            state: "all",
            page: i
        })
        if (res.status == HTTP_STATUS_OK) {
            issues = issues.concat(res.data)
            if (res.data.length < 30) {
                break
            }
        } else {
            core.info("Cannot retrieve issues page " + i + " from " + owner + "/" + repo)
            return issues
        }
    }
    return issues
}

async function createIssue(owner, repo, octokit, title, body, githubLabels, githubAssignees, githubMilestone, id) {
    core.info("\nCreating ticket #" + id + " for " + owner + "/" + repo)
    let issueCreated = await octokit.issues.create({
        owner: owner,
        repo: repo,
        title: title,
        body: body,
        assignees: githubAssignees,
        labels: githubLabels,
        milestone: githubMilestone
    })
    if (issueCreated.status == HTTP_STATUS_CREATED) {
        const issueId = issueCreated.data.number
        const issueUrl = issueCreated.data.html_url
        core.info("Ticket #" + issueId + " was Created for " + owner + "/" + repo)
        core.info(issueUrl)
        return issueId
    } else {
        core.info("Ticket #" + id + " failed to be Created for " + owner + "/" + repo)
        return false
    }
}

async function createCommitComment(owner, repo, octokit, commitSha, body, path, position) {
    core.info("\nCreating Comment with Checkmarx Summary for Commit #" + commitSha + " for " + owner + "/" + repo)
    const commitCommentCreated = await octokit.repos.createCommitComment({
        owner: owner,
        repo: repo,
        commit_sha: commitSha,
        body: body,
        path: path,
        position: position
    })
    if (commitCommentCreated.status == HTTP_STATUS_CREATED) {
        const commentUrl = commitCommentCreated.data.html_url
        core.info("New Comment was Created for Commit #" + commitSha + " for " + owner + "/" + repo)
        core.info(commentUrl)
        return true
    } else {
        core.info("New Comment failed to be created for Commit #" + commitSha + " for " + owner + "/" + repo)
        return false
    }
}

module.exports = {
    createIssues: createIssues,
    createIssue: createIssue
}