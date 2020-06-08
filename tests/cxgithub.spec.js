const assert = require('assert')
const cxgithub = require('./../src/cxgithub.js')

describe('cxgithub', function () {
    describe('#getIssuesFromXml()', function () {
        let issues = cxgithub.getIssuesFromXml(__dirname + "\\samples\\report.xml")
        console.error(issues[0])
        assert(issues && issues.length > 0)
    })
    describe('#getSummary()', function () {
        let issues = cxgithub.getIssuesFromXml(__dirname + "\\samples\\report.xml")
        let summary = cxgithub.getSummary(issues)
        assert(summary)
    })
})
