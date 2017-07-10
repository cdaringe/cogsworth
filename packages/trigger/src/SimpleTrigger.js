'use strict'

var Trigger = require('./Trigger')
var Observable = require('rxjs').Observable

function SimpleTrigger (opts) {
  Trigger.call(this, opts)
  this.stream = Observable.create(function (observer) {
    this.observer = observer
  }.bind(this))
}
SimpleTrigger.prototype = Object.create(Trigger.prototype)
SimpleTrigger.prototype.constructor = SimpleTrigger

SimpleTrigger.prototype.start = function () {
  setTimeout(function () {
    this.observer.next('SIMPLE_MESSAGE')
  }.bind(this), 100)
}

SimpleTrigger.prototype.stop = function () {
  this.observer.complete()
}

SimpleTrigger.prototype.getStream = function () {
  return this.stream
}

module.exports = SimpleTrigger
