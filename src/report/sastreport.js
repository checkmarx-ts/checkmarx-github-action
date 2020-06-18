const fs = require("fs")
const path = require("path")
const xmljs = require("xml-js")
const inputs = require("../github/inputs.js")
const utils = require("../utils/utils.js")
const core = require("@actions/core")
const HIGH = "High"
const MEDIUM = "Medium"
const LOW = "Low"
const INFO = "Information"
const NEW = "New"
const RECURRENT = "Recurrent"
const TO_VERIFY = "0"
const NOT_EXPLOITABLE = "1"
const CONFIRMED = "2"
const URGENT = "3"
const PROPOSED_NOT_EXPLOITABLE = "4"
const TO_VERIFY_LABEL = "To Verify"
const NOT_EXPLOITABLE_LABEL = "Not Exploitable"
const CONFIRMED_LABEL = "Confirmed"
const URGENT_LABEL = "Urgent"
const PROPOSED_NOT_EXPLOITABLE_LABEL = "Proposed Not Exploitable"
const TITLE_PREFIX = "[Checkmarx]"

function getXmlReportPath(workspace) {
    let reportXml = ""
    let cxReportXML = inputs.get(inputs.CX_REPORT_XML, false)
    if (utils.isValidString(cxReportXML)) {
        core.info(inputs.CX_REPORT_XML + ": " + cxReportXML)
        reportXml = cxReportXML.trim()
    } else {
        reportXml = workspace + path.sep + "report.xml"
        core.info("No " + inputs.CX_REPORT_XML + " input provided. It will be used the default one: " + reportXml)
    }
    return reportXml
}

function getIssuesFromXml(xmlPath, repository, commitSha) {
    const GITHUB_FILE_URL = "https://github.com/" + repository + "/blob/" + commitSha + "/"
    let issues = []
    if (fs.existsSync(xmlPath)) {
        let xmlData = fs.readFileSync(xmlPath)
        let jsonObj = xmljs.xml2js(xmlData, { compact: false, spaces: 4 })
        let root = jsonObj.elements
        if (root && root.length > 0) {
            let reportXml = root[0]
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
                            queryCategories: queryAttrs.categories.length > 0 ? queryAttrs.categories.replace(/;/g, ",").split(",") : [],
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

                                resultNode.line = parseInt(node.elements[1].elements[0].text)
                                resultNode.relativefileName = node.elements[0].elements[0].text
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
                            issue.resultStartNodeRelativeFileName = startNode.elements[0].elements[0].text
                            issue.resultStartNodeFileName = GITHUB_FILE_URL + startNode.elements[0].elements[0].text + "#L" + (issue.resultStartNodeLine - 1) + "-L" + (issue.resultStartNodeLine + 1)
                            issue.resultStartNodeColumn = startNode.elements[2].elements[0].text
                            issue.resultStartNodeId = startNode.elements[3].elements[0].text
                            issue.resultStartNodeName = startNode.elements[4].elements[0].text
                            //issue.resultStartNodeType= startNode.elements[5] does not have elements
                            issue.resultStartNodeLength = startNode.elements[6].elements[0].text
                            issue.resultStartNodeSnippet = startNode.elements[7].elements[0].elements[1].elements[0].text.trim()

                            issue.resultEndNodeLine = parseInt(endNode.elements[1].elements[0].text)
                            issue.resultEndNodeRelativeFileName = endNode.elements[0].elements[0].text
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
        core.info("No issues will be created")
    }
    return issues
}

function getSummary(issues, newIssues, recurrentIssues, resolvedIssues, reopenedIssues) {
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
    let queries = []
    let languages = []
    let files = []
    let firstIssue
    for (let i = 0; i < issues.length; i++) {
        let issue = issues[i];

        for (let j = 0; j < issue.resultNodes.length; j++) {
            let fileName = issue.resultNodes[j].fileName.split("#")[0]
            if (!files.includes(fileName)) {
                files.push(fileName)
            }
        }


        let addLanguage = true
        for (let k = 0; k < languages.length; k++) {
            if (languages[k].name == issue.queryLanguage) {
                languages[k].count++
                addLanguage = false
            }
        }
        if (addLanguage) {
            languages.push({ name: issue.queryLanguage, count: 1 })
        }
        let addQuery = true
        for (let k = 0; k < queries.length; k++) {
            if (queries[k].name == issue.queryName) {
                queries[k].count++
                addQuery = false
            }
        }
        if (addQuery) {
            queries.push({ name: issue.queryName, count: 1 })
        }
        firstIssue = issue
        summary.total++
        switch (issue.resultStatus) {
            case NEW:
                summary.new.total++
                switch (issue.resultSeverity) {
                    case HIGH:
                        summary.high.new++
                        break
                    case MEDIUM:
                        summary.medium.new++
                        break
                    case LOW:
                        summary.low.new++
                        break
                    case INFO:
                        summary.info.new++
                        break
                }

                switch (issue.resultState) {
                    case TO_VERIFY:
                        summary.toVerify.new++
                        break
                    case NOT_EXPLOITABLE:
                        summary.notExploitable.new++
                        break
                    case CONFIRMED:
                        summary.confirmed.new++
                        break
                    case URGENT:
                        summary.urgent.new++
                        break
                    case PROPOSED_NOT_EXPLOITABLE:
                        summary.proposedNotExploitable.new++
                        break
                }
                break
            case RECURRENT:
                summary.recurrent.total++
                switch (issue.resultSeverity) {
                    case HIGH:
                        summary.high.recurrent++
                        break
                    case MEDIUM:
                        summary.medium.recurrent++
                        break
                    case LOW:
                        summary.low.recurrent++
                        break
                    case INFO:
                        summary.info.recurrent++
                        break
                }
                switch (issue.resultState) {
                    case TO_VERIFY:
                        summary.toVerify.recurrent++
                        break
                    case NOT_EXPLOITABLE:
                        summary.notExploitable.recurrent++
                        break
                    case CONFIRMED:
                        summary.confirmed.recurrent++
                        break
                    case URGENT:
                        summary.urgent.recurrent++
                        break
                    case PROPOSED_NOT_EXPLOITABLE:
                        summary.proposedNotExploitable.recurrent++
                        break
                }
                break
        }

        switch (issue.resultSeverity) {
            case HIGH:
                summary.high.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.high++
                        break
                    case RECURRENT:
                        summary.recurrent.high++
                        break
                }
                switch (issue.resultState) {
                    case TO_VERIFY:
                        summary.toVerify.high++
                        break
                    case NOT_EXPLOITABLE:
                        summary.notExploitable.high++
                        break
                    case CONFIRMED:
                        summary.confirmed.high++
                        break
                    case URGENT:
                        summary.urgent.high++
                        break
                    case PROPOSED_NOT_EXPLOITABLE:
                        summary.proposedNotExploitable.high++
                        break
                }
                break
            case MEDIUM:
                summary.medium.total++

                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.medium++
                        break
                    case RECURRENT:
                        summary.recurrent.medium++
                        break
                }
                switch (issue.resultState) {
                    case TO_VERIFY:
                        summary.toVerify.medium++
                        break
                    case NOT_EXPLOITABLE:
                        summary.notExploitable.medium++
                        break
                    case CONFIRMED:
                        summary.confirmed.medium++
                        break
                    case URGENT:
                        summary.urgent.medium++
                        break
                    case PROPOSED_NOT_EXPLOITABLE:
                        summary.proposedNotExploitable.medium++
                        break
                }
                break
            case LOW:
                summary.low.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.low++
                        break
                    case RECURRENT:
                        summary.recurrent.low++
                        break
                }
                switch (issue.resultState) {
                    case TO_VERIFY:
                        summary.toVerify.low++
                        break
                    case NOT_EXPLOITABLE:
                        summary.notExploitable.low++
                        break
                    case CONFIRMED:
                        summary.confirmed.low++
                        break
                    case URGENT:
                        summary.urgent.low++
                        break
                    case PROPOSED_NOT_EXPLOITABLE:
                        summary.proposedNotExploitable.low++
                        break
                }
                break
            case INFO:
                summary.info.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.info++
                        break
                    case RECURRENT:
                        summary.recurrent.info++
                        break
                }
                switch (issue.resultState) {
                    case TO_VERIFY:
                        summary.toVerify.info++
                        break
                    case NOT_EXPLOITABLE:
                        summary.notExploitable.info++
                        break
                    case CONFIRMED:
                        summary.confirmed.info++
                        break
                    case URGENT:
                        summary.urgent.info++
                        break
                    case PROPOSED_NOT_EXPLOITABLE:
                        summary.proposedNotExploitable.info++
                        break
                }
                break
        }

        switch (issue.resultState) {
            case TO_VERIFY:
                summary.toVerify.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.toVerify++
                        break
                    case RECURRENT:
                        summary.recurrent.toVerify++
                        break
                }

                switch (issue.resultSeverity) {
                    case HIGH:
                        summary.high.toVerify++
                        break
                    case MEDIUM:
                        summary.medium.toVerify++
                        break
                    case LOW:
                        summary.low.toVerify++
                        break
                    case INFO:
                        summary.info.toVerify++
                        break
                }
                break
            case NOT_EXPLOITABLE:
                summary.notExploitable.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.notExploitable++
                        break
                    case RECURRENT:
                        summary.recurrent.notExploitable++
                        break
                }

                switch (issue.resultSeverity) {
                    case HIGH:
                        summary.high.notExploitable++
                        break
                    case MEDIUM:
                        summary.medium.notExploitable++
                        break
                    case LOW:
                        summary.low.notExploitable++
                        break
                    case INFO:
                        summary.info.notExploitable++
                        break
                }
                break
            case CONFIRMED:
                summary.confirmed.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.confirmed++
                        break
                    case RECURRENT:
                        summary.recurrent.confirmed++
                        break
                }

                switch (issue.resultSeverity) {
                    case HIGH:
                        summary.high.confirmed++
                        break
                    case MEDIUM:
                        summary.medium.confirmed++
                        break
                    case LOW:
                        summary.low.confirmed++
                        break
                    case INFO:
                        summary.info.confirmed++
                        break
                }
                break
            case URGENT:
                summary.urgent.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.urgent++
                        break
                    case RECURRENT:
                        summary.recurrent.urgent++
                        break
                }

                switch (issue.resultSeverity) {
                    case HIGH:
                        summary.high.urgent++
                        break
                    case MEDIUM:
                        summary.medium.urgent++
                        break
                    case LOW:
                        summary.low.urgent++
                        break
                    case INFO:
                        summary.info.urgent++
                        break
                }
                break
            case PROPOSED_NOT_EXPLOITABLE:
                summary.proposedNotExploitable.total++
                switch (issue.resultStatus) {
                    case NEW:
                        summary.new.proposedNotExploitable++
                        break
                    case RECURRENT:
                        summary.recurrent.proposedNotExploitable++
                        break
                }

                switch (issue.resultSeverity) {
                    case HIGH:
                        summary.high.proposedNotExploitable++
                        break
                    case MEDIUM:
                        summary.medium.proposedNotExploitable++
                        break
                    case LOW:
                        summary.low.proposedNotExploitable++
                        break
                    case INFO:
                        summary.info.proposedNotExploitable++
                        break
                }
                break
        }
    }

    let summaryBody = "[Checkmarx] - Project : " + firstIssue.projectName + " - Scan ID : " + firstIssue.scanId + "\n"
    summaryBody += "\n"
    summaryBody += "-----------------------------------\n"
    summaryBody += "**Project Details**\n"
    summaryBody += "Checkmarx Version: " + firstIssue.cxVersion + "\n"
    summaryBody += "Project ID: " + firstIssue.projectId + "\n"
    summaryBody += "Project Name: " + firstIssue.projectName + "\n"
    summaryBody += "Preset: " + firstIssue.preset + "\n"
    summaryBody += "Owner: " + firstIssue.owner + "\n"
    summaryBody += "Team: " + firstIssue.teamFullPath + "\n"
    summaryBody += "\n"
    summaryBody += "-----------------------------------\n"
    summaryBody += "**Scan Details**\n"
    summaryBody += "Initiator Name: " + firstIssue.initiatorName + "\n"
    summaryBody += "Scan ID: " + firstIssue.scanId + "\n"
    summaryBody += "LOC: " + firstIssue.loc + "\n"
    summaryBody += "Files Scanned: " + firstIssue.filesScanned + "\n"
    summaryBody += "Scan Type: " + firstIssue.scanType + "\n"
    summaryBody += "Scan URL: " + firstIssue.scanDeepLink + "\n"
    summaryBody += "Scan Comment: " + firstIssue.scanComment + "\n"
    summaryBody += "Scan Type: " + firstIssue.scanTime + "\n"
    summaryBody += "Scan Start Date: " + firstIssue.scanStartDate + "\n"
    summaryBody += "Scan Time: " + firstIssue.scanTime + "\n"
    summaryBody += "Source Origin: " + firstIssue.sourceOrigin + "\n"
    summaryBody += "Visibility: " + firstIssue.visibility + "\n"
    summaryBody += "\n"
    summaryBody += "-----------------------------------\n"
    summaryBody += "**Results Summary Details**\n"
    summaryBody += "\n"
    summaryBody += "**Results By Status**\n"
    summaryBody += "New | Recurrent | Resolved | Reopened | Total\n"
    summaryBody += "------------ | ------------ | ------------ | ------------ | ------------\n"
    summaryBody += newIssues + " | " + recurrentIssues + " | " + resolvedIssues + " | " + reopenedIssues + " | " + issues.length + "\n"
    summaryBody += "\n"
    summaryBody += "**Results By State and Severity**\n"
    summaryBody += "Severity \\ State | Confirmed | Urgent | Proposed Not Exploitable | To Verify | Not Exploitable | Total\n"
    summaryBody += "------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------\n"
    summaryBody += "High | " + summary.confirmed.high + " | " + summary.urgent.high + " | " + summary.proposedNotExploitable.high + " | " + summary.toVerify.high + " | " + summary.notExploitable.high + " | " + summary.high.total + "\n"
    summaryBody += "Medium | " + summary.confirmed.medium + " | " + summary.urgent.medium + " | " + summary.proposedNotExploitable.medium + " | " + summary.toVerify.medium + " | " + summary.notExploitable.medium + " | " + summary.medium.total + "\n"
    summaryBody += "Low | " + summary.confirmed.low + " | " + summary.urgent.low + " | " + summary.proposedNotExploitable.low + " | " + summary.toVerify.low + " | " + summary.notExploitable.low + " | " + summary.low.total + "\n"
    summaryBody += "Info | " + summary.confirmed.info + " | " + summary.urgent.info + " | " + summary.proposedNotExploitable.info + " | " + summary.toVerify.info + " | " + summary.notExploitable.info + " | " + summary.info.total + "\n"
    summaryBody += "Total | " + summary.confirmed.total + " | " + summary.urgent.total + " | " + summary.proposedNotExploitable.total + " | " + summary.toVerify.total + " | " + summary.notExploitable.total + " | " + issues.length + "\n"
    summaryBody += "\n"
    if (queries.length > 0) {
        summaryBody += "**Results By Queries**\n"
        summaryBody += "Queries | Total Results\n"
        summaryBody += "------------ |------------\n"
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i]
            summaryBody += query.name + " | " + query.count + "\n"
        }
        summaryBody += "\n"
    }
    if (languages.length > 0) {
        summaryBody += "**Results By Languages**\n"
        summaryBody += "Languages | Total Results\n"
        summaryBody += "------------ |------------\n"
        for (let i = 0; i < languages.length; i++) {
            const language = languages[i]
            summaryBody += language.name + " | " + language.count + "\n"
        }
        summaryBody += "\n"
    }
    if (files.length > 0) {
        summaryBody += "**Vulnerabilities in Files:**\n"
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            summaryBody += file + "\n"
        }
        summaryBody += "\n"
    }

    return summaryBody
}

function getLabels(githubLabels, issue) {
    let issueGithubLabels = JSON.parse(JSON.stringify(githubLabels))

    issueGithubLabels.push(issue.resultSeverity)
    issueGithubLabels.push(issue.resultStatus)

    switch (issue.resultState) {
        case TO_VERIFY:
            issueGithubLabels.push(TO_VERIFY_LABEL)
            break
        case NOT_EXPLOITABLE:
            issueGithubLabels.push(NOT_EXPLOITABLE_LABEL)
            break
        case CONFIRMED:
            issueGithubLabels.push(CONFIRMED_LABEL)
            break
        case URGENT:
            issueGithubLabels.push(URGENT_LABEL)
            break
        case PROPOSED_NOT_EXPLOITABLE:
            issueGithubLabels.push(PROPOSED_NOT_EXPLOITABLE_LABEL)
            break
        default:
            break
    }
    return issueGithubLabels
}

function getTitle(issue) {
    return TITLE_PREFIX + " " + issue.queryGroup + " - " + issue.queryName + " : " + issue.similarityId
}


function getBody(issue) {

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
    return body
}
module.exports = {
    getXmlReportPath: getXmlReportPath,
    getIssuesFromXml: getIssuesFromXml,
    getSummary: getSummary,
    getLabels: getLabels,
    getTitle: getTitle,
    getBody: getBody,
    NOT_EXPLOITABLE: NOT_EXPLOITABLE,
    TITLE_PREFIX: TITLE_PREFIX
}