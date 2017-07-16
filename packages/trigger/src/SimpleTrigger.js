'use strict'

var Trigger = require('./Trigger')
var debug = require('debug')('cogsworth:SimpleTrigger')

function SimpleTrigger (opts) {
  opts = opts || {}
  Trigger.call(this, opts)
  if (opts.timeout) this.timeout = opts.timeout || 100
}
SimpleTrigger.prototype = Object.create(Trigger.prototype)
SimpleTrigger.prototype.constructor = SimpleTrigger

SimpleTrigger.prototype.start = function () {
  Trigger.prototype.start.call(this)
  debug('starting SimpleTrigger')
  setTimeout(function () {
    this.observer.next('SIMPLE_MESSAGE')
    this.stop()
  }.bind(this), this.timeout)
}

SimpleTrigger.prototype.stop = function () {
  Trigger.prototype.stop.call(this)
  debug('stopping SimpleTrigger')
}

SimpleTrigger.prototype.toJSON = function () {
  return Object.assign(Trigger.prototype.toJSON.call(this), { timeout: this.timeout })
}

module.exports = SimpleTrigger
