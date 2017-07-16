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

TriggerRrule.prototype.scheduleNext = function (date, isFirst) {
  var next = this.getEventAfter({ date: date, inclusive: isFirst })
  if (!next || this.isExpired(date)) return this.stop()
  debug('next tick at: ' + next.toISOString())
  var msUntilNext = next.getTime() - Date.now()
  if (msUntilNext < 0) msUntilNext = 0
  setTimeout(function () {
    this.observer.next({ date: next })
    if (this.state === 'RUNNING') this.scheduleNext(next)
  }.bind(this, next), msUntilNext)
}

TriggerRrule.prototype.getEventAfter = function (opts) {
  return this.rrule.after(opts.date, opts.inclusive)
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

TriggerRrule.prototype.isExpired = function (date) {
  if (!date) throw new Error('must pass date')
  if (!this.endDate) return false
  return date > this.endDate
}

TriggerRrule.prototype.start = function () {
  Trigger.prototype.start.call(this)
  this.scheduleNext(this.startDate, true)
}

TriggerRrule.prototype.stop = function () {
  Trigger.prototype.stop.call(this)
  debug('stopping rrule trigger: ' + this.rrule.toString())
}

TriggerRrule.prototype.toJSON = function () {
  return Object.assign(Trigger.prototype.toJSON.call(this), { rrule: this.rrule.toString() })
}

TriggerRrule.prototype.toString = function () {
  return this.rrule.toString()
}

module.exports = TriggerRrule
