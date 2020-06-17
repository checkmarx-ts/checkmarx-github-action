const fs = require("fs")
const path = require("path")
const inputs = require("../github/inputs.js")
const utils = require("../utils/utils.js")
const core = require("@actions/core")
const DEFAULT_OSA_FOLDER = "OsaReports"
const DEFAULT_OSA_VULNERABILITIES_FILE_NAME = "CxOSAVulnerabilities"
const DEFAULT_OSA_LIBRARIES_FILE_NAME = "CxOSALibraries"
const DEFAULT_OSA_SUMMARY_FILE_NAME = "CxOSASummary"
const TO_VERIFY = "1"
const NOT_EXPLOITABLE = "2"
const CONFIRMED = "3"
const URGENT = "4"
const PROPOSED_NOT_EXPLOITABLE = "5"
const TO_VERIFY_LABEL = "To Verify"
const NOT_EXPLOITABLE_LABEL = "Not Exploitable"
const CONFIRMED_LABEL = "Confirmed"
const URGENT_LABEL = "Urgent"
const PROPOSED_NOT_EXPLOITABLE_LABEL = "Proposed Not Exploitable"
const TITLE_PREFIX = "[Checkmarx][OSA]"
const HIGH = "High"
const MEDIUM = "Medium"
const LOW = "Low"
const SEVERITIES = [HIGH, MEDIUM, LOW]

function getOsaReportsPath(workspace) {
    let osaJsonPath = ""
    let cxOsaJson = inputs.get(inputs.CX_OSA_JSON, false)
    if (utils.isValidString(cxOsaJson)) {
        core.info(inputs.CX_OSA_JSON + ": " + cxOsaJson)
        osaJsonPath = cxOsaJson.trim()
    } else {
        osaJsonPath = workspace + path.sep + DEFAULT_OSA_FOLDER
        core.info("No " + inputs.CX_OSA_JSON + " input provided. It will be used the default one: " + osaJsonPath)
    }
    return osaJsonPath
}

function getOsaIssuesFromJson(osaReportsPath) {
    let issuesJsonPath = osaReportsPath + path.sep + DEFAULT_OSA_VULNERABILITIES_FILE_NAME
    let issues = []
    if (fs.existsSync(issuesJsonPath)) {
        issues = JSON.parse(fs.readFileSync(issuesJsonPath))
        return issues
    } else {
        core.info(DEFAULT_OSA_VULNERABILITIES_FILE_NAME + " JSON does not exists in the path: " + issuesJsonPath)
        core.info("No issues will be created")
    }
    return issues
}

function getOsaLibrariesFromJson(osaReportsPath) {
    let librariesJsonPath = osaReportsPath + path.sep + DEFAULT_OSA_LIBRARIES_FILE_NAME
    let libraries = []
    if (fs.existsSync(librariesJsonPath)) {
        libraries = JSON.parse(fs.readFileSync(librariesJsonPath))
        return libraries
    } else {
        core.info(DEFAULT_OSA_LIBRARIES_FILE_NAME + " JSON does not exists in the path: " + librariesJsonPath)
    }
    return libraries
}

function getOsaSummaryFromJson(osaReportsPath) {
    let osaSummaryPath = osaReportsPath + path.sep + DEFAULT_OSA_SUMMARY_FILE_NAME
    let summary = {}
    if (fs.existsSync(osaSummaryPath)) {
        let summary = JSON.parse(fs.readFileSync(osaSummaryPath))
        return summary
    } else {
        core.info(DEFAULT_OSA_SUMMARY_FILE_NAME + " JSON does not exists in the path: " + osaSummaryPath)
    }
    return summary
}

function getTitle(osaIssue, osaLibrary) {
    return TITLE_PREFIX + " " + osaIssue.cveName + " - Score " + osaIssue.score + " - " + osaLibrary.name + ":" + osaLibrary.version
}

function getBody(osaIssue, library) {
    let body = ""
    body += "**Library Details**\n"
    body += "Library ID: " + library.id + "\n"
    body += "Library Name: " + library.name + "\n"
    body += "Library Version: " + library.version + "\n"
    body += "Library Source File Name: " + osaIssue.sourceFileName + "\n"
    body += "Library Confidence Level: " + library.confidenceLevel + "\n"
    body += "\n"
    body += "-----------------------------------\n"
    body += "**CVE Details**\n"
    body += "CVE Name: " + osaIssue.cveName + "\n"
    body += "CVE Score: " + osaIssue.score + "\n"
    body += "Severity: " + osaIssue.severity.name + "\n"
    body += "State: " + osaIssue.state.name + "\n"
    body += "CVE Publish Date: " + osaIssue.publishDate + "\n"
    body += "CVE URL: " + osaIssue.url + "\n"
    body += "CVE Description: " + osaIssue.description + "\n"
    body += "\n"
    body += "-----------------------------------\n"
    body += "**Recommendations**\n"
    body += "Library Newest Version: " + library.newestVersion + "\n"
    body += "Library Newest Version Release Date: " + library.newestVersionReleaseDate + "\n"
    body += "Library Number of Versions Since Last Update: " + library.numberOfVersionsSinceLastUpdate + "\n"
    body += "Recommendations: " + osaIssue.recommendations + "\n"
    return body
}

function getLibrary(osaIssue, osaLibraries) {
    let library = {}

    for (let i = 0; i < osaLibraries.length; i++) {
        let osaLibrary = osaLibraries[i]
        if (osaIssue.libraryId == osaLibrary.id) {
            return osaLibrary
        }
    }
    return library
}

function getLabels(githubLabels, osaIssue) {
    let issueGithubLabels = JSON.parse(JSON.stringify(githubLabels))

    issueGithubLabels.push(osaIssue.severity.name)

    switch (osaIssue.state.id + "") {
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

function getSummary(osaSummary, osaLibraries, osaIssues, newIssues, recurrentIssues, resolvedIssues, reopenedIssues) {
    let summaryBody = "**[Checkmarx][OSA]**\n"
    summaryBody += "\n"
    summaryBody += "**Libraries Summary**\n"
    summaryBody += "Score | Vulnerable and Outdated | Vulnerable and Updated | Non Vulnerable | Total\n"
    summaryBody += "------------ | ------------ | ------------ | ------------ | ------------\n"
    summaryBody += osaSummary.vulnerabilityScore + " | " + osaSummary.vulnerableAndOutdated + " | " + osaSummary.vulnerableAndUpdated + "|" + osaSummary.nonVulnerableLibraries + "|" + osaSummary.totalLibraries + "\n"
    summaryBody += "\n"
    summaryBody += "-----------------------------------\n"
    summaryBody += "**Libraries Summary By Severity**\n"
    summaryBody += "High Vulnerables Libraries | Medium Vulnerables Libraries | Low Vulnerables Libraries | Non Vulnerable | Total\n"
    summaryBody += "------------ | ------------ | ------------ | ------------ | ------------\n"
    summaryBody += osaSummary.highVulnerabilityLibraries + " | " + osaSummary.mediumVulnerabilityLibraries + " | " + osaSummary.lowVulnerabilityLibraries + "|" + osaSummary.nonVulnerableLibraries + "|" + osaSummary.totalLibraries + "\n"
    summaryBody += "\n"
    summaryBody += "-----------------------------------\n"
    summaryBody += "**Result Summary Details**\n"
    summaryBody += "\n"
    summaryBody += "**Results By Status**\n"
    summaryBody += "New | Recurrent | Resolved | Reopened \n"
    summaryBody += "------------ | ------------ | ------------ | ------------ \n"
    summaryBody += newIssues + " | " + recurrentIssues + " | " + resolvedIssues + " | " + reopenedIssues + "\n"
    summaryBody += "\n"
    for (let i = 0; i < SEVERITIES.length; i++) {
        let severity = SEVERITIES[i]
        if ((osaSummary.highVulnerabilityLibraries > 0 && severity == HIGH) ||
        (osaSummary.mediumVulnerabilityLibraries > 0 && severity == MEDIUM) ||
        (osaSummary.lowVulnerabilityLibraries > 0 && severity == LOW)) {
            summaryBody += "**Results By Severity - " + severity + "**\n"
            summaryBody += "Library | Version | Risk Score | CVE | Publish Date | Confidence Level | Newest Version | Newest Version Date | Versions Since Last Update | Recommendations\n"
            summaryBody += "------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------\n"

            for (let j = 0; j < osaIssues.length; j++) {
                let osaIssue = osaIssues[j]
                let library = osaIssue.library
                if (osaIssue.severity.name == severity) {
                    summaryBody += library.name + " | " + library.version + " | " + osaIssue.score + " | " + osaIssue.cveName + " (" + osaIssue.url + ")" + " | " + osaIssue.publishDate + " | " + library.confidenceLevel + " | " + library.newestVersion + " | " + library.newestVersionReleaseDate + " | " + library.numberOfVersionsSinceLastUpdate + " | " + osaIssue.recommendations + "\n"
                }
            }
            summaryBody += "\n"
        }
    }
    /*summaryBody += "\n"
    summaryBody += "**Results By State and Severity**\n"
    summaryBody += "Severity \\ State | Confirmed | Urgent | Proposed Not Exploitable | To Verify | Not Exploitable | Total\n"
    summaryBody += "------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------\n"
    summaryBody += "High | " + summary.confirmed.high + " | " + summary.urgent.high + " | " + summary.proposedNotExploitable.high + " | " + summary.toVerify.high + " | " + summary.notExploitable.high + " | " + summary.high.total + "\n"
    summaryBody += "Medium | " + summary.confirmed.medium + " | " + summary.urgent.medium + " | " + summary.proposedNotExploitable.medium + " | " + summary.toVerify.medium + " | " + summary.notExploitable.medium + " | " + summary.medium.total + "\n"
    summaryBody += "Low | " + summary.confirmed.low + " | " + summary.urgent.low + " | " + summary.proposedNotExploitable.low + " | " + summary.toVerify.low + " | " + summary.notExploitable.low + " | " + summary.low.total + "\n"
    summaryBody += "Info | " + summary.confirmed.info + " | " + summary.urgent.info + " | " + summary.proposedNotExploitable.info + " | " + summary.toVerify.info + " | " + summary.notExploitable.info + " | " + summary.info.total + "\n"
    summaryBody += "Total | " + summary.confirmed.total + " | " + summary.urgent.total + " | " + summary.proposedNotExploitable.total + " | " + summary.toVerify.total + " | " + summary.notExploitable.total + " | " + issues.length + "\n"
    summaryBody += "\n"*/
    return summaryBody
}

module.exports = {
    getOsaReportsPath: getOsaReportsPath,
    getOsaIssuesFromJson: getOsaIssuesFromJson,
    getOsaSummaryFromJson: getOsaSummaryFromJson,
    getOsaLibrariesFromJson: getOsaLibrariesFromJson,
    getTitle: getTitle,
    getBody: getBody,
    getLibrary: getLibrary,
    getLabels: getLabels,
    getSummary: getSummary,
    NOT_EXPLOITABLE: NOT_EXPLOITABLE,
    TITLE_PREFIX: TITLE_PREFIX
}