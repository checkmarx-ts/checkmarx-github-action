const fs = require("fs")
const xmljs = require('xml-js')
const core = require('@actions/core')
const github = require('@actions/github')
const utils = require('./utils.js')
const cxcli = require('./cxcli.js')

function getToken() {
    let token = ""
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
        if (utils.isValidString(cxGithubToken)) {
            core.info('cxGithubToken was provided')
            token = cxGithubToken
        } else {
            token = ''
            core.info('cxGithubToken was not provided')
            core.info('No issues will be created')
        }
    } else {
        core.info('Issues will not be created since cxGithubIssues was not provided or set to fals')
    }

    return token
}

function getXmlReportPath() {
    let reportXml = ''
    let cxReportXML = core.getInput('cxReportXML', { required: false })
    if (utils.isValidString(cxReportXML)) {
        core.info('cxReportXML: ' + cxReportXML)
        reportXml = cxReportXML.trim()
    } else {
        core.info("No 'cxReportXML' input provided. It will be used: report.xml")
        reportXml = "report.xml"
    }
    return "./" + cxcli.getFolderName() + "/Checkmarx/Reports/" + reportXml
}

function getIssuesFromXml(xmlPath, repository, commitSha) {
    const GITHUB_FILE_URL = "https://github.com/" + repository + "/blob/" + commitSha + "/"
    let issues = []
    if (fs.existsSync(xmlPath)) {
        let xmlData = fs.readFileSync(xmlPath)
        let jsonObj = xmljs.xml2js(xmlData, { compact: false, spaces: 4 })
        let root = jsonObj.elements
        if (root && root.length > 0) {
            let reportXml = jsonObj.elements[0]
            let attrs = reportXml.attributes
            let queries = reportXml.elements
            if (queries && queries.length > 0) {
                for (let i = 0; i < queries.length; i++) {
                    let query = queries[i]
                    let queryAttrs = query.attributes
                    let results = query.elements
                    for (let j = 0; j < results.length; j++) {
                        let result = results[j]
                        let resultAttrs = result.attributes
                        let issue = {
                            initiatorName: attrs.InitiatorName,
                            owner: attrs.Owner,
                            scanId: attrs.ScanId,
                            projectId: attrs.ProjectId,
                            projectName: attrs.ProjectName,
                            teamFullPath: attrs.TeamFullPathOnReportDate,
                            scanDeepLink: attrs.DeepLink,
                            scanStartDate: new Date(attrs.ScanStart),
                            preset: attrs.Preset,
                            scanTime: attrs.ScanTime,
                            loc: attrs.LinesOfCodeScanned,
                            filesScanned: attrs.FilesScanned,
                            reportCreationDate: new Date(attrs.ReportCreationTime),
                            teamShortPath: attrs.Team,
                            cxVersion: attrs.CheckmarxVersion,
                            scanComment: attrs.ScanComments,
                            scanType: attrs.ScanType,
                            sourceOrigin: attrs.SourceOrigin,
                            visibility: attrs.Visibility,
                            queryId: queryAttrs.id,
                            queryCategories: queryAttrs.categories.length > 0 ? queryAttrs.categories.replace(/;/g, ',').split(",") : [],
                            cweId: queryAttrs.cweId,
                            queryName: queryAttrs.name,
                            queryGroup: queryAttrs.group,
                            querySeverity: queryAttrs.Severity,
                            queryLanguage: queryAttrs.Language,
                            queryLanguageHash: queryAttrs.LanguageHash,
                            queryLanguageChangeDate: new Date(queryAttrs.LanguageChangeDate),
                            querySeverityIndex: queryAttrs.SeverityIndex,
                            queryPath: queryAttrs.QueryPath,
                            queryVersionCode: queryAttrs.QueryVersionCode,
                            resultNodeId: resultAttrs.NodeId,
                            resultLine: parseInt(resultAttrs.Line),
                            resultFileName: GITHUB_FILE_URL + resultAttrs.FileName + "#L" + (parseInt(resultAttrs.Line) - 1) + "-L" + (parseInt(resultAttrs.Line) + 1),
                            resultStatus: resultAttrs.Status,
                            resultColumn: parseInt(resultAttrs.Column),
                            resultFalsePositive: resultAttrs.FalsePositive,
                            resultSeverity: resultAttrs.Severity,
                            resultAssignee: resultAttrs.AssignToUser,
                            resultState: resultAttrs.state,
                            resultRemark: resultAttrs.Remark.split("\r\n"),
                            resultDeepLink: resultAttrs.DeepLink,
                            resultSeverityIndex: resultAttrs.SeverityIndex
                        }
                        let paths = result.elements
                        for (let k = 0; k < paths.length; k++) {
                            let path = paths[k]
                            let pathAttributes = path.attributes

                            issue.resultId = pathAttributes.ResultId
                            issue.pathId = pathAttributes.PathId
                            issue.similarityId = pathAttributes.SimilarityId

                            let pathNodes = path.elements
                            issue.resultNodes = []

                            for (let w = 0; w < pathNodes.length; w++) {
                                let node = pathNodes[w]
                                let resultNode = {}

                                resultNode.line = parseInt(node.elements[1].elements[0].text),
                                    resultNode.fileName = GITHUB_FILE_URL + node.elements[0].elements[0].text + "#L" + (resultNode.line - 1) + "-L" + (resultNode.line + 1)
                                resultNode.column = node.elements[2].elements[0].text
                                resultNode.id = node.elements[3].elements[0].text
                                resultNode.name = node.elements[4].elements[0].text
                                //resultNode.type= node.elements[5] does not have elements
                                resultNode.length = node.elements[6].elements[0].text
                                resultNode.snippet = node.elements[7].elements[0].elements[1].elements[0].text.trim()

                                issue.resultNodes.push(resultNode)
                            }

                            let startNode = pathNodes[0]
                            let endNode = pathNodes[pathNodes.length - 1]

                            issue.resultStartNodeLine = parseInt(startNode.elements[1].elements[0].text)
                            issue.resultStartNodeFileName = GITHUB_FILE_URL + startNode.elements[0].elements[0].text + "#L" + (issue.resultStartNodeLine - 1) + "-L" + (issue.resultStartNodeLine + 1)
                            issue.resultStartNodeColumn = startNode.elements[2].elements[0].text
                            issue.resultStartNodeId = startNode.elements[3].elements[0].text
                            issue.resultStartNodeName = startNode.elements[4].elements[0].text
                            //issue.resultStartNodeType= startNode.elements[5] does not have elements
                            issue.resultStartNodeLength = startNode.elements[6].elements[0].text
                            issue.resultStartNodeSnippet = startNode.elements[7].elements[0].elements[1].elements[0].text.trim()

                            issue.resultEndNodeLine = parseInt(endNode.elements[1].elements[0].text)
                            issue.resultEndNodeFileName = GITHUB_FILE_URL + endNode.elements[0].elements[0].text + "#L" + + (issue.resultEndNodeLine - 1) + "-L" + (issue.resultEndNodeLine + 1)
                            issue.resultEndNodeColumn = endNode.elements[2].elements[0].text
                            issue.resultEndNodeId = endNode.elements[3].elements[0].text
                            issue.resultEndNodeName = endNode.elements[4].elements[0].text
                            //issue.resultEndNodeType= endNode.elements[5] does not have elements
                            issue.resultEndNodeLength = endNode.elements[6].elements[0].text
                            issue.resultEndNodeSnippet = endNode.elements[7].elements[0].elements[1].elements[0].text.trim()
                        }
                        issues.push(issue)
                    }
                }
            }
        }
    } else {
        core.info("reportXml does not exists in the path: " + xmlPath)
        core.info('No issues will be created')
    }
    return issues
}

function getSummary(issues) {
    let summary = {
        total: 0,
        high: {
            total: 0,
            new: 0,
            recurrent: 0,
            toVerify: 0,
            notExploitable: 0,
            confirmed: 0,
            urgent: 0,
            proposedNotExploitable: 0
        },
        medium: {
            total: 0,
            new: 0,
            recurrent: 0,
            toVerify: 0,
            notExploitable: 0,
            confirmed: 0,
            urgent: 0,
            proposedNotExploitable: 0
        },
        low: {
            total: 0,
            new: 0,
            recurrent: 0,
            toVerify: 0,
            notExploitable: 0,
            confirmed: 0,
            urgent: 0,
            proposedNotExploitable: 0
        },
        info: {
            total: 0,
            new: 0,
            recurrent: 0,
            toVerify: 0,
            notExploitable: 0,
            confirmed: 0,
            urgent: 0,
            proposedNotExploitable: 0
        },
        new: {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            toVerify: 0,
            notExploitable: 0,
            confirmed: 0,
            urgent: 0,
            proposedNotExploitable: 0
        },
        recurrent: {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            toVerify: 0,
            notExploitable: 0,
            confirmed: 0,
            urgent: 0,
            proposedNotExploitable: 0
        },
        toVerify: {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            new: 0,
            recurrent: 0
        },
        notExploitable: {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            new: 0,
            recurrent: 0
        },
        confirmed: {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            new: 0,
            recurrent: 0
        },
        urgent: {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            new: 0,
            recurrent: 0
        },
        proposedNotExploitable: {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
            new: 0,
            recurrent: 0
        },
    }
    for (let i = 0; i < issues.length; i++) {
        let issue = issues[i];
        summary.total++
        switch (issue.resultStatus) {
            case "New":
                summary.new.total++
                switch (issue.resultSeverity) {
                    case "High":
                        summary.high.new++
                        break
                    case "Medium":
                        summary.medium.new++
                        break
                    case "Low":
                        summary.low.new++
                        break
                    case "Information":
                        summary.info.new++
                        break
                }

                switch (issue.resultState) {
                    case "0":
                        summary.toVerify.new++
                        break
                    case "1":
                        summary.notExploitable.new++
                        break
                    case "2":
                        summary.confirmed.new++
                        break
                    case "3":
                        summary.urgent.new++
                        break
                    case "4":
                        summary.proposedNotExploitable.new++
                        break
                }
                break
            case "Recurrent":
                summary.recurrent.total++
                switch (issue.resultSeverity) {
                    case "High":
                        summary.high.recurrent++
                        break
                    case "Medium":
                        summary.medium.recurrent++
                        break
                    case "Low":
                        summary.low.recurrent++
                        break
                    case "Information":
                        summary.info.recurrent++
                        break
                }
                switch (issue.resultState) {
                    case "0":
                        summary.toVerify.recurrent++
                        break
                    case "1":
                        summary.notExploitable.recurrent++
                        break
                    case "2":
                        summary.confirmed.recurrent++
                        break
                    case "3":
                        summary.urgent.recurrent++
                        break
                    case "4":
                        summary.proposedNotExploitable.recurrent++
                        break
                }
                break
        }

        switch (issue.resultSeverity) {
            case "High":
                summary.high.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.high++
                        break;
                    case "Recurrent":
                        summary.recurrent.high++
                        break
                }
                switch (issue.resultState) {
                    case "0":
                        summary.toVerify.high++
                        break
                    case "1":
                        summary.notExploitable.high++
                        break
                    case "2":
                        summary.confirmed.high++
                        break
                    case "3":
                        summary.urgent.high++
                        break
                    case "4":
                        summary.proposedNotExploitable.high++
                        break
                }
                break
            case "Medium":
                summary.medium.total++

                switch (issue.resultStatus) {
                    case "New":
                        summary.new.medium++
                        break;
                    case "Recurrent":
                        summary.recurrent.medium++
                        break
                }
                switch (issue.resultState) {
                    case "0":
                        summary.toVerify.medium++
                        break
                    case "1":
                        summary.notExploitable.medium++
                        break
                    case "2":
                        summary.confirmed.medium++
                        break
                    case "3":
                        summary.urgent.medium++
                        break
                    case "4":
                        summary.proposedNotExploitable.medium++
                        break
                }
                break
            case "Low":
                summary.low.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.low++
                        break;
                    case "Recurrent":
                        summary.recurrent.low++
                        break
                }
                switch (issue.resultState) {
                    case "0":
                        summary.toVerify.low++
                        break
                    case "1":
                        summary.notExploitable.low++
                        break
                    case "2":
                        summary.confirmed.low++
                        break
                    case "3":
                        summary.urgent.low++
                        break
                    case "4":
                        summary.proposedNotExploitable.low++
                        break
                }
                break
            case "Information":
                summary.info.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.info++
                        break;
                    case "Recurrent":
                        summary.recurrent.info++
                        break
                }
                switch (issue.resultState) {
                    case "0":
                        summary.toVerify.info++
                        break
                    case "1":
                        summary.notExploitable.info++
                        break
                    case "2":
                        summary.confirmed.info++
                        break
                    case "3":
                        summary.urgent.info++
                        break
                    case "4":
                        summary.proposedNotExploitable.info++
                        break
                }
                break
        }

        switch (issue.resultState) {
            case "0":
                summary.toVerify.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.toVerify++
                        break;
                    case "Recurrent":
                        summary.recurrent.toVerify++
                        break
                }

                switch (issue.resultSeverity) {
                    case "High":
                        summary.high.toVerify++
                        break
                    case "Medium":
                        summary.medium.toVerify++
                        break
                    case "Low":
                        summary.low.toVerify++
                        break
                    case "Information":
                        summary.info.toVerify++
                        break
                }
                break
            case "1":
                summary.notExploitable.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.notExploitable++
                        break;
                    case "Recurrent":
                        summary.recurrent.notExploitable++
                        break
                }

                switch (issue.resultSeverity) {
                    case "High":
                        summary.high.notExploitable++
                        break
                    case "Medium":
                        summary.medium.notExploitable++
                        break
                    case "Low":
                        summary.low.notExploitable++
                        break
                    case "Information":
                        summary.info.notExploitable++
                        break
                }
                break
            case "2":
                summary.confirmed.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.confirmed++
                        break;
                    case "Recurrent":
                        summary.recurrent.confirmed++
                        break
                }

                switch (issue.resultSeverity) {
                    case "High":
                        summary.high.confirmed++
                        break
                    case "Medium":
                        summary.medium.confirmed++
                        break
                    case "Low":
                        summary.low.confirmed++
                        break
                    case "Information":
                        summary.info.confirmed++
                        break
                }
                break
            case "3":
                summary.urgent.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.urgent++
                        break;
                    case "Recurrent":
                        summary.recurrent.urgent++
                        break
                }

                switch (issue.resultSeverity) {
                    case "High":
                        summary.high.urgent++
                        break
                    case "Medium":
                        summary.medium.urgent++
                        break
                    case "Low":
                        summary.low.urgent++
                        break
                    case "Information":
                        summary.info.urgent++
                        break
                }
                break
            case "4":
                summary.proposedNotExploitable.total++
                switch (issue.resultStatus) {
                    case "New":
                        summary.new.proposedNotExploitable++
                        break;
                    case "Recurrent":
                        summary.recurrent.proposedNotExploitable++
                        break
                }

                switch (issue.resultSeverity) {
                    case "High":
                        summary.high.proposedNotExploitable++
                        break
                    case "Medium":
                        summary.medium.proposedNotExploitable++
                        break
                    case "Low":
                        summary.low.proposedNotExploitable++
                        break
                    case "Information":
                        summary.info.proposedNotExploitable++
                        break
                }
                break
        }
    }
    return summary
}

async function createIssues(repository, commitSha) {

    let token = getToken()

    if (token) {

        let githubLabels = ["bug"]
        let githubAssignees = []

        let cxGithubLabels = core.getInput('cxGithubLabels', { required: false })
        if (utils.isValidString(cxGithubLabels)) {
            if (cxGithubLabels.indexOf(",") != -1) {
                githubLabels = cxGithubLabels.split(",")
            } else {
                githubLabels = [cxGithubLabels]
            }
        } else {
            githubLabels = ["bug"]
        }

        githubLabels.push("checkmarx")

        let cxGithubAssignees = core.getInput('cxGithubAssignees', { required: false })
        if (utils.isValidString(cxGithubAssignees)) {
            if (cxGithubAssignees.indexOf(",") != -1) {
                githubAssignees = cxGithubAssignees.split(",")
            } else {
                githubAssignees = [cxGithubAssignees]
            }
        } else {
            githubAssignees = []
        }

        const repoSplit = repository.split("/")
        const owner = repoSplit[0]
        const repo = repoSplit[1]

        core.info("Getting Octokit...")
        const octokit = github.getOctokit(token)

        let xmlPath = getXmlReportPath()
        let issues = getIssuesFromXml(xmlPath, repository, commitSha)
        if (issues) {
            let summary = getSummary(issues)

            for (let i = 0; i < issues.length; i++) {
                let issue = issues[i]

                let issueGithubLabels = JSON.parse(JSON.stringify(githubLabels))

                issueGithubLabels.push(issue.resultSeverity)
                issueGithubLabels.push(issue.resultStatus)

                switch (issue.resultState) {
                    case "0":
                        issueGithubLabels.push("To Verify")
                        break
                    case "1":
                        issueGithubLabels.push("Not Exploitable")
                        break
                    case "2":
                        issueGithubLabels.push("Confirmed")
                        break
                    case "3":
                        issueGithubLabels.push("Urgent")
                        break
                    case "4":
                        issueGithubLabels.push("Proposed Not Exploitable")
                        break
                    default:
                        break
                }

                const title = "[Cx] " + issue.resultSeverity + " - " + issue.queryName
                let body = "**" + issue.resultSeverity + " - " + issue.queryName + "**\n"
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

                await createIssue(owner, repo, octokit, title, body, issueGithubLabels, githubAssignees, i)
                issueGithubLabels = []
            }
        }
    }
}

async function createIssue(owner, repo, octokit, title, body, githubLabels, githubAssignees, id) {

    core.info("Creating ticket #" + id + " for " + owner + "/" + repo)
    let issueCreated = await octokit.issues.create({
        owner: owner,
        repo: repo,
        title: title,
        body: body,
        assignees: githubAssignees,
        labels: githubLabels
    })
    core.info("Ticket #" + id + " Created!")
    return true
}

module.exports = {
    createIssues: createIssues,
    createIssue: createIssue,
    getIssuesFromXml: getIssuesFromXml,
    getSummary: getSummary
}