'use strict'

var Trigger = require('cogsworth-trigger').Trigger
var rrule = require('rrule')
var debug = require('debug')('cogsworth:trigger-rrule')
var RRule = rrule.RRule
var rrulestr = rrule.rrulestr

function TriggerRrule (opts) {
  Trigger.call(this, opts)
  if (!opts || !opts.rrule) throw new Error('rrule required')
  this.rrule = this.initRrule(opts.rrule)
}
TriggerRrule.prototype = Object.create(Trigger.prototype)
TriggerRrule.prototype.constructor = TriggerRrule

TriggerRrule.prototype.getNextTriggerEvent = function (date, isFirstRequest) {
  return this.rrule.after(date, isFirstRequest)
}

TriggerRrule.prototype.initRrule = function (rrule) {
  if (rrule instanceof RRule) {
    if (!rrule.origOptions.dtstart) throw new Error('rrule must have dtstart set')
    return rrule
  } else if (typeof rrule === 'string') {
    var tmp = rrulestr(rrule).origOptions
    tmp.dtstart = new Date(this.startDate)
    return new RRule(tmp)
  }
  throw new Error('invalid rrule: ' + rrule)
}

TriggerRrule.prototype.start = function () {
  Trigger.prototype.start.call(this)
  this.isRunning = true
}

TriggerRrule.prototype.shouldStop = function (date) {
  var after = this.rrule.after(date, false)
  return !after
}

TriggerRrule.prototype.stop = function () {
  debug('stopping rrule trigger: ' + this.rrule.toString())
  Trigger.prototype.stop.call(this)
  this.observer.complete()
  this.isRunning = false
}

TriggerRrule.prototype.toJSON = function () {
  return { rrule: this.rrule.toString() }
}

module.exports = TriggerRrule
