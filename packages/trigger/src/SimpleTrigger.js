'use strict'

var Trigger = require('./Trigger')
var debug = require('debug')('cogsworth:SimpleTrigger')

function SimpleTrigger (opts) {
  Trigger.call(this, opts)
}
SimpleTrigger.prototype = Object.create(Trigger.prototype)
SimpleTrigger.prototype.constructor = SimpleTrigger

SimpleTrigger.prototype.start = function () {
  debug('starting trigger')
  setTimeout(function () {
    this.observer.next('SIMPLE_MESSAGE')
    this.stop()
  }.bind(this), 100)
}

SimpleTrigger.prototype.stop = function () {
  debug('stopping trigger')
  this.observer.complete()
}

SimpleTrigger.prototype.getStream = function () {
  return this.stream
}

module.exports = SimpleTrigger
