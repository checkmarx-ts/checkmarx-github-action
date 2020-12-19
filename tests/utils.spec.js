const assert = require('assert')
const utils = require('./../src/utils/utils')

describe('utils', function () {
  describe('#getLastString()', function () {
    it('Null - Fail', function () {
      var s = utils.getLastString()
      assert(s == null)
    })
    it('Empty String - Fail', function () {
      var s = utils.getLastString("")
      assert(s == "")
    })
    it('Integer - Fail', function () {
      var s = utils.getLastString(1)
      assert(s == 1)
    })
    it('Boolean - Fail', function () {
      var s = utils.getLastString(true)
      assert(s == true)
    })
    it('Array - Fail', function () {
      var s = utils.getLastString([])
      assert(s instanceof Array && s.length == 0)
    })
    it('Object - Fail', function () {
      var s = utils.getLastString({})
      assert(s instanceof Object)
    })
    it('String without / - Fail', function () {
      var s = utils.getLastString("1234")
      assert(s == "1234")
    })
    it('Valid - Success', function () {
      var s = utils.getLastString("1234/test")
      assert(s == "test")
    })
  })
  describe('#isValidUrl()', function () {
    it('Null - Fail', function () {
      assert(!utils.isValidUrl())
    })
    it('Empty - Fail', function () {
      assert(!utils.isValidUrl(""))
    })
    it('Integer - Fail', function () {
      assert(!utils.isValidUrl(1))
    })
    it('Boolean - Fail', function () {
      assert(!utils.isValidUrl(true))
    })
    it('Array - Fail', function () {
      assert(!utils.isValidUrl([]))
    })
    it('Object - Fail', function () {
      assert(!utils.isValidUrl({}))
    })
    it('Invalid - Fail', function () {
      assert(!utils.isValidUrl("test"))
    })
    it('Invalid HTTP - Fail', function () {
      assert(!utils.isValidUrl("http://www.test.com"))
    })
    it('Valid HTTPS - Success', function () {
      assert(utils.isValidUrl("https://www.test.com"))
    })
  })
  describe('#isValidString()', function () {
    it('Null - Fail', function () {
      assert(!utils.isValidString())
    })
    it('Empty - Fail', function () {
      assert(!utils.isValidString(""))
    })
    it('Integer - Fail', function () {
      assert(!utils.isValidString(1))
    })
    it('Boolean - Fail', function () {
      assert(!utils.isValidString(true))
    })
    it('Array - Fail', function () {
      assert(!utils.isValidString([]))
    })
    it('Object - Fail', function () {
      assert(!utils.isValidString({}))
    })
    it('String - Success', function () {
      assert(utils.isValidString("test"))
    })
  })
  describe('#isValidInt()', function () {
    it('Null - Fail', function () {
      assert(!utils.isValidInt())
    })
    it('Empty String - Fail', function () {
      assert(!utils.isValidInt(""))
    })
    it('Boolean - Fail', function () {
      assert(!utils.isValidInt(true))
    })
    it('Array - Fail', function () {
      assert(!utils.isValidInt([]))
    })
    it('Object - Fail', function () {
      assert(!utils.isValidInt({}))
    })
    it('Negative Integer - Fail', function () {
      assert(!utils.isValidInt(-1))
    })
    it('Positive Integer - Success', function () {
      assert(utils.isValidInt(123))
    })
  })
  describe('#isBoolean()', function () {
    it('Null - Fail', function () {
      assert(!utils.isBoolean())
    })
    it('Empty String - Fail', function () {
      assert(!utils.isBoolean(""))
    })
    it('Integer - Fail', function () {
      assert(!utils.isBoolean(1))
    })
    it('Array - Fail', function () {
      assert(!utils.isBoolean([]))
    })
    it('Object - Fail', function () {
      assert(!utils.isBoolean({}))
    })
    it('String Boolean true - Success', function () {
      assert(utils.isBoolean("true"))
    })
    it('String Boolean false - Success', function () {
      assert(utils.isBoolean("false"))
    })
    it('Boolean true - Success', function () {
      assert(utils.isBoolean(true))
    })
    it('Boolean false - Success', function () {
      assert(utils.isBoolean(false))
    })
  })
  describe('#isValidTeam()', function () {
    it('Null - Fail', function () {
      assert(!utils.isValidTeam())
    })
    it('Empty - Fail', function () {
      assert(!utils.isValidTeam(""))
    })
    it('Integer - Fail', function () {
      assert(!utils.isValidTeam(1))
    })
    it('Boolean - Fail', function () {
      assert(!utils.isValidTeam(true))
    })
    it('Array - Fail', function () {
      assert(!utils.isValidTeam([]))
    })
    it('Object - Fail', function () {
      assert(!utils.isValidTeam({}))
    })
    it('String without \\ - Fail', function () {
      assert(!utils.isValidTeam("test"))
    })
    it('String with \\ in middle - Fail', function () {
      assert(!utils.isValidTeam("test\\test"))
    })
    it('String with \\ in the middle and end - Fail', function () {
      assert(!utils.isValidTeam("test\\test\\"))
    })
    it('String with \\ in the start, middle and end - Fail', function () {
      assert(!utils.isValidTeam("\\test\\test\\"))
    })
    it('String with \\ in the start - Success', function () {
      assert(utils.isValidTeam("\\test"))
    })
    it('String with \\ in the start and middle - Success', function () {
      assert(utils.isValidTeam("\\test\\test"))
    })
  })
  describe('#isValidFilename()', function () {
    it('Null - Fail', function () {
      assert(!utils.isValidFilename())
    })
    it('Empty - Fail', function () {
      assert(!utils.isValidFilename(""))
    })
    it('Integer - Fail', function () {
      assert(!utils.isValidFilename(1))
    })
    it('Boolean - Fail', function () {
      assert(!utils.isValidFilename(true))
    })
    it('Array - Fail', function () {
      assert(!utils.isValidFilename([]))
    })
    it('Object - Fail', function () {
      assert(!utils.isValidFilename({}))
    })
    it('String with / - Fail', function () {
      assert(!utils.isValidFilename("test/"))
    })
    it('String with \\ in middle - Fail', function () {
      assert(!utils.isValidFilename("test\\test"))
    })
    it('String - Success', function () {
      assert(utils.isValidFilename("test"))
    })
  })
  describe('#isValidAction()', function () {
    it('Null - Fail', function () {
      assert(!utils.isValidAction())
    })
    it('Empty - Fail', function () {
      assert(!utils.isValidAction(""))
    })
    it('Integer - Fail', function () {
      assert(!utils.isValidAction(1))
    })
    it('Boolean - Fail', function () {
      assert(!utils.isValidAction(true))
    })
    it('Array - Fail', function () {
      assert(!utils.isValidAction([]))
    })
    it('Object - Fail', function () {
      assert(!utils.isValidAction({}))
    })
    it('Invalid Action - Fail', function () {
      assert(!utils.isValidAction("test"))
    })
    it('Valid Action - Fail', function () {
      assert(utils.isValidAction(utils.getValidAction()[0]))
    })
  })
  describe('#getValidAction()', function () {
    it('Null - Success', function () {
      let array = utils.getValidAction()
      assert(array && array.length > 0 && array instanceof Array)
    })
  })
})