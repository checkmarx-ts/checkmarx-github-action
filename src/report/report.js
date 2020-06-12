const fs = require("fs")
const path = require('path')
const xmljs = require('xml-js')
const inputs = require('../github/inputs.js')
const utils = require('../utils/utils.js')
const core = require('@actions/core')
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

function getXmlReportPath(workspace) {
    let reportXml = ''
    let cxReportXML = inputs.get(inputs.CX_REPORT_XML, false)
    if (utils.isValidString(cxReportXML)) {
        core.info(inputs.CX_REPORT_XML + ': ' + cxReportXML)
        reportXml = cxReportXML.trim()
    } else {
        core.info("No '" + inputs.CX_REPORT_XML + "' input provided. It will be used the default one: " + workspace + path.sep + "report.xml")
        reportXml = workspace + path.sep + "report.xml"
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
                        break;
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
                        break;
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
                        break;
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
                        break;
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
                        break;
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
                        break;
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
                        break;
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
                        break;
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
                        break;
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
    return summary
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

module.exports = {
    getXmlReportPath: getXmlReportPath,
    getIssuesFromXml: getIssuesFromXml,
    getSummary: getSummary,
    getLabels: getLabels
}