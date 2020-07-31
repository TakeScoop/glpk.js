'use strict'

const Code = require('code')
const path = require('path')

global.expect = Code.expect

global.rootRequire = function(name) {
    return require(path.join(__dirname, '../', name))
}
