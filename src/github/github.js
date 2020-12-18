const core = require("@actions/core")
const github = require("@actions/github")
const sastreport = require("../report/sastreport")
const osareport = require("../report/osareport")
const utils = require("../utils/utils")
const inputs = require("./inputs")
const envs = process.env
const HTTP_STATUS_OK = 200
const HTTP_STATUS_CREATED = 201
const GITHUB_STATE_OPEN = "open"
const GITHUB_STATE_CLOSED = "closed"
const GITHUB_EVENT_PUSH = "push"
const GITHUB_EVENT_PULL_REQUEST = "pull_request"
const VULNERABILITY_DISAPPEAR_MESSAGE = "Vulnerability does not exist anymore.\nIssue was fixed!"

function getToken() {
    let token = ""
    let createGithubIssues = inputs.getBoolean(inputs.CX_GITHUB_ISSUES, false)

    if (createGithubIssues && createGithubIssues != "false") {
        token = inputs.getString(inputs.CX_GITHUB_TOKEN, false, "", true)
    } else {
        core.info("Issues will not be created since cxGithubIssues was not provided or set to false")
    }

    return token
}

async function createIssues(cxAction) {

    let token = getToken()

    if (token) {
        let repository = envs.GITHUB_REPOSITORY
        let commitSha = envs.GITHUB_SHA
        let workspace = envs.GITHUB_WORKSPACE
        let event = envs.GITHUB_EVENT_NAME

        let githubLabels = inputs.getArray(inputs.CX_GITHUB_LABELS, false)
        if(githubLabels){
            githubLabels.push("checkmarx")
        }
        let githubAssignees = inputs.getArray(inputs.CX_GITHUB_ASSIGNEES, false)
        let githubMilestone = inputs.getInt(inputs.CX_GITHUB_MILESTONE, false)
        if (githubMilestone == -1) {
            githubMilestone = null
        }

        const repoSplit = repository.split("/")
        const owner = repoSplit[0]
        const repo = repoSplit[1]

        core.info("Getting Octokit...")
        const octokit = github.getOctokit(token)
        if (octokit) {
            if (cxAction == utils.SCAN) {
                let xmlPath = sastreport.getXmlReportPath(workspace)
                let issues = sastreport.getIssuesFromXml(xmlPath, repository, commitSha)
                let issuesChangedIds = []
                let repositoryIssues = await getIssues(owner, repo, octokit)
                if (issues) {
                    let resolvedIssues = 0
                    let reopenedIssues = 0
                    let recurrentIssues = 0
                    let newIssues = 0
                    for (let i = 0; i < issues.length; i++) {
                        let issue = issues[i]

                        const title = sastreport.getTitle(issue)
                        const body = sastreport.getBody(issue)
                        let issueGithubLabels = sastreport.getLabels(githubLabels, issue)

                        let state = GITHUB_STATE_OPEN
                        if (issue.resultState == sastreport.NOT_EXPLOITABLE) {
                            state = GITHUB_STATE_CLOSED
                        }

                        let issueExists = false
                        for (let j = 0; j < repositoryIssues.length; j++) {
                            let repositoryIssue = repositoryIssues[j]
                            const titleRepositoryIssue = repositoryIssue.title
                            if (titleRepositoryIssue == title) {
                                issuesChangedIds.push(repositoryIssue.number)
                                issueExists = true
                                if (state != repositoryIssue.state) {
                                    if (state == GITHUB_STATE_OPEN && repositoryIssue.state == GITHUB_STATE_CLOSED) {
                                        reopenedIssues++
                                    } else if (state == GITHUB_STATE_CLOSED && repositoryIssue.state == GITHUB_STATE_OPEN) {
                                        resolvedIssues++
                                    } else {
                                        recurrentIssues++
                                    }
                                } else {
                                    recurrentIssues++
                                }
                                await updateIssue(owner, repo, octokit, body, issueGithubLabels, githubAssignees, githubMilestone, repositoryIssue, state)
                                break
                            }
                        }
                        if (!issueExists) {
                            newIssues++
                            let issueId = await createIssue(owner, repo, octokit, title, body, issueGithubLabels, githubAssignees, githubMilestone, i, state)

                            issuesChangedIds.push(issueId)
                            /*for (let j = 0; j < issue.resultNodes.length; j++) {
                                let node = issue.resultNodes[j]
                                let commentBody = "**#" + issueId + " - " + issue.resultSeverity + " - " + issue.queryName + " - " + j + " Node** - " + node.name
                                await createCommitComment(owner, repo, octokit, commitSha, commentBody, node.relativefileName, node.line)
                            }*/
                            issueGithubLabels = []
                        }
                    }

                    if(repositoryIssues){
                        for (let i = 0; i < repositoryIssues.length; i++) {
                            let repositoryIssue = repositoryIssues[i]
                            const titleRepositoryIssue = repositoryIssue.title
                            if (titleRepositoryIssue.startsWith(sastreport.TITLE_PREFIX) && repositoryIssue.state == GITHUB_STATE_OPEN && !issuesChangedIds.includes(repositoryIssue.number)) {
                                await updateIssue(owner, repo, octokit, VULNERABILITY_DISAPPEAR_MESSAGE, [], githubAssignees, githubMilestone, repositoryIssue, GITHUB_STATE_CLOSED)
                                resolvedIssues++
                            }
                        }
                    }

                    let summary = sastreport.getSummary(issues, newIssues, recurrentIssues, resolvedIssues, reopenedIssues)
                    await createCommitAndPullRequestComment(owner, repo, octokit, commitSha, summary, event)
                } else {
                    if(repositoryIssues){
                        for (let i = 0; i < repositoryIssues.length; i++) {
                            let repositoryIssue = repositoryIssues[i]
                            const titleRepositoryIssue = repositoryIssue.title
                            if (titleRepositoryIssue.startsWith(sastreport.TITLE_PREFIX) && repositoryIssue.state == GITHUB_STATE_OPEN && !issuesChangedIds.includes(repositoryIssue.number)) {
                                await updateIssue(owner, repo, octokit, VULNERABILITY_DISAPPEAR_MESSAGE, [], githubAssignees, githubMilestone, repositoryIssue, GITHUB_STATE_CLOSED)
                            }
                        }
                    }
                }
            } else if (cxAction == utils.OSA_SCAN) {
                let osaReportPath = osareport.getOsaReportsPath(workspace)
                let osaIssues = osareport.getOsaIssuesFromJson(osaReportPath)
                let osaSummary = osareport.getOsaSummaryFromJson(osaReportPath)
                let osaLibraries = osareport.getOsaLibrariesFromJson(osaReportPath)
                let issuesChangedIds = []
                let repositoryIssues = await getIssues(owner, repo, octokit)
                if (osaIssues) {
                    let resolvedIssues = 0
                    let reopenedIssues = 0
                    let recurrentIssues = 0
                    let newIssues = 0

                    for (let i = 0; i < osaIssues.length; i++) {
                        let osaIssue = osaIssues[i]
                        const library = osareport.getLibrary(osaIssue, osaLibraries)
                        osaIssues[i].library = library
                        const title = osareport.getTitle(osaIssue, library)
                        const body = osareport.getBody(osaIssue, library)

                        let issueGithubLabels = osareport.getLabels(githubLabels, osaIssue)
                        let state = GITHUB_STATE_OPEN
                        if ((osaIssue.state.id + "") == osareport.NOT_EXPLOITABLE) {
                            state = GITHUB_STATE_CLOSED
                        }

                        let issueExists = false
                        if(repositoryIssues){
                            for (let j = 0; j < repositoryIssues.length; j++) {
                                let repositoryIssue = repositoryIssues[j]
                                const titleRepositoryIssue = repositoryIssue.title
                                if (titleRepositoryIssue == title) {
                                    issuesChangedIds.push(repositoryIssue.number)
                                    issueExists = true
                                    if (state != repositoryIssue.state) {
                                        if (state == GITHUB_STATE_OPEN && repositoryIssue.state == GITHUB_STATE_CLOSED) {
                                            reopenedIssues++
                                        } else if (state == GITHUB_STATE_CLOSED && repositoryIssue.state == GITHUB_STATE_OPEN) {
                                            resolvedIssues++
                                        } else {
                                            recurrentIssues++
                                        }
                                    } else {
                                        recurrentIssues++
                                    }
                                    await updateIssue(owner, repo, octokit, body, issueGithubLabels, githubAssignees, githubMilestone, repositoryIssue, state)
                                    break
                                }
                            }
                        }
                        if (!issueExists) {
                            newIssues++
                            let issueId = await createIssue(owner, repo, octokit, title, body, issueGithubLabels, githubAssignees, githubMilestone, i, state)

                            issuesChangedIds.push(issueId)
                            /*for (let j = 0; j < issue.resultNodes.length; j++) {
                                let node = issue.resultNodes[j]
                                let commentBody = "**#" + issueId + " - " + issue.resultSeverity + " - " + issue.queryName + " - " + j + " Node** - " + node.name
                                await createCommitComment(owner, repo, octokit, commitSha, commentBody, node.relativefileName, node.line)
                            }*/
                            issueGithubLabels = []
                        }
                    }

                    if(repositoryIssues){
                        for (let i = 0; i < repositoryIssues.length; i++) {
                            let repositoryIssue = repositoryIssues[i]
                            const titleRepositoryIssue = repositoryIssue.title
                            if (titleRepositoryIssue.startsWith(osareport.TITLE_PREFIX) && repositoryIssue.state == GITHUB_STATE_OPEN && !issuesChangedIds.includes(repositoryIssue.number)) {
                                await updateIssue(owner, repo, octokit, VULNERABILITY_DISAPPEAR_MESSAGE, [], githubAssignees, githubMilestone, repositoryIssue, GITHUB_STATE_CLOSED)
                                resolvedIssues++
                            }
                        }
                    }

                    let summary = osareport.getSummary(osaSummary, osaLibraries, osaIssues, newIssues, recurrentIssues, resolvedIssues, reopenedIssues)
                    await createCommitAndPullRequestComment(owner, repo, octokit, commitSha, summary, event)
                } else {
                    if(repositoryIssues){
                        for (let i = 0; i < repositoryIssues.length; i++) {
                            let repositoryIssue = repositoryIssues[i]
                            const titleRepositoryIssue = repositoryIssue.title
                            if (titleRepositoryIssue.startsWith(osareport.TITLE_PREFIX) && repositoryIssue.state == GITHUB_STATE_OPEN && !issuesChangedIds.includes(repositoryIssue.number)) {
                                await updateIssue(owner, repo, octokit, VULNERABILITY_DISAPPEAR_MESSAGE, [], githubAssignees, githubMilestone, repositoryIssue, GITHUB_STATE_CLOSED)
                            }
                        }
                    }
                }
            } else {
                core.info("Github Issues was not implemented for cxAction: " + cxAction)
            }
        } else {
            core.info("Unable to authenticate to octokit. Please provide a proper GITHUB_TOKEN")
        }
    } else {
        core.info("No issues will be created")
    }
}

async function createCommitAndPullRequestComment(owner, repo, octokit, commitSha, summary, event) {
    await createCommitComment(owner, repo, octokit, commitSha, summary, null, null)
    if (event == GITHUB_EVENT_PULL_REQUEST) {
        const pull_number = parseInt(envs.GITHUB_REF.replace("/merge", "").replace("refs/pull/", ""))
        core.info("\nUpdating Pull Request #" + pull_number + " for " + owner + "/" + repo)
        const pullRequestCommented = await octokit.issues.createComment({ owner: owner, repo: repo, body: summary, issue_number: pull_number })
        if (pullRequestCommented.status == HTTP_STATUS_CREATED) {
            core.info("\nUpdated Pull Request #" + pull_number + " for " + owner + "/" + repo)
        } else {
            core.info("\nFailed to Update Pull Request #" + pull_number + " for " + owner + "/" + repo)
        }
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

async function updateIssue(owner, repo, octokit, body, githubLabels, githubAssignees, githubMilestone, repositoryIssue, state) {

    core.info("\nUpdating ticket #" + repositoryIssue.number + " for " + owner + "/" + repo)
    let uniqueLabels = githubLabels
    for (let i = 0; i < repositoryIssue.labels.length; i++) {
        const label = repositoryIssue.labels[i].name
        if (!uniqueLabels.includes(label)) {
            uniqueLabels.push(label)
        }
    }
    let uniqueAssignees = githubAssignees
    for (let i = 0; i < repositoryIssue.assignees.length; i++) {
        const assignee = repositoryIssue.assignees[i].login
        if (!uniqueAssignees.includes(assignee)) {
            uniqueAssignees.push(assignee)
        }
    }

    const issueUpdated = await octokit.issues.update({
        owner: owner,
        repo: repo,
        issue_number: repositoryIssue.number,
        title: repositoryIssue.title,
        body: repositoryIssue.body,
        state: state,
        milestone: githubMilestone,
        labels: uniqueLabels,
        assignees: uniqueAssignees
    })
    if (issueUpdated.status == HTTP_STATUS_OK) {
        const issueCommented = await octokit.issues.createComment({
            owner: owner,
            repo: repo,
            issue_number: repositoryIssue.number,
            body: body
        })
        if (issueCommented.status == HTTP_STATUS_CREATED) {
            core.info("New Comment was Created for Issue #" + repositoryIssue.number + " for " + owner + "/" + repo)
            return issueCommented.data
        } else {
            core.info("Cannot Create Comment for issue #" + repositoryIssue.number + " from " + owner + "/" + repo)
            return issueCommented.data
        }
    } else {
        core.info("Cannot update issue #" + repositoryIssue.number + " from " + owner + "/" + repo)
        return issueUpdated.data
    }
}

async function createIssue(owner, repo, octokit, title, body, githubLabels, githubAssignees, githubMilestone, id, state) {
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

        const issueUpdated = await octokit.issues.update({
            owner: owner,
            repo: repo,
            issue_number: issueId,
            title: title,
            body: body,
            state: state,
            milestone: githubMilestone,
            labels: githubLabels,
            assignees: githubAssignees
        })
        if (issueUpdated.status == HTTP_STATUS_OK) {
            core.info("Update State of Issue #" + issueId + " from " + owner + "/" + repo)
            return issueId
        } else {
            core.info("Cannot update issue #" + issueId + " from " + owner + "/" + repo)
            return issueId
        }
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
    createIssue: createIssue,
    updateIssue: updateIssue,
    createCommitComment: createCommitComment
}