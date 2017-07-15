'use strict'

var Trigger = require('./Trigger')
var debug = require('debug')('cogsworth:SimpleTrigger')

function SimpleTrigger (opts) {
  Trigger.call(this, opts)
}
SimpleTrigger.prototype = Object.create(Trigger.prototype)
SimpleTrigger.prototype.constructor = SimpleTrigger

SimpleTrigger.prototype.start = function () {
  Trigger.prototype.start.call(this)
  debug('starting SimpleTrigger')
  setTimeout(function () {
    this.observer.next('SIMPLE_MESSAGE')
    this.stop()
  }.bind(this), 100)
}

SimpleTrigger.prototype.stop = function () {
  Trigger.prototype.stop.call(this)
  debug('stopping SimpleTrigger')
}

module.exports = SimpleTrigger
