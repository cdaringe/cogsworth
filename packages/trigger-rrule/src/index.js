'use strict'

var Trigger = require('@cogsworth/trigger').Trigger
var rrule = require('rrule')
var Observable = require('rxjs/Observable').Observable

var RRule = rrule.RRule
var rrulestr = rrule.rrulestr

function TriggerRrule (opts) {
  Trigger.call(this, opts)
  this.tickScanDuration = opts.tickScanDuration || 30 * 1000 // @TODO document
  if (!opts || !opts.rrule) throw new Error('rrule required')
  this.rrule = this.initRrule(opts.rrule)
  this.observer = null // set by Observable.create(...)
  this.stream = Observable.create(function (observer) { this.observer = observer })
}
TriggerRrule.prototype = Trigger.prototype

TriggerRrule.prototype.start = function () {
  this.wakeUp()
}

TriggerRrule.prototype.getStream = function () {
  return this.stream
}

TriggerRrule.prototype.wakeUp = function () {
  this.isRunning = true
  this.wakeUpInvterval = setInterval(function () {
    this.streamTicks()
  }.bind(this), this.queueRefreshInterval)
}

TriggerRrule.prototype.sleep = function () {
  this.isRunning = false
  clearInterval(this.wakeUpInvterval)
}

TriggerRrule.prototype.stop = function () {
  this.observer.complete()
}

TriggerRrule.prototype.initRrule = function (rrule) {
  if (rrule instanceof RRule) return rrule
  else if (rrule instanceof 'string') return rrulestr(rrule)
  throw new Error('invalid rrule: ' + rrule)
}

TriggerRrule.prototype.streamTicks = function () {
  var now = Date.now()
  if (this.startDate < now) return
  var prev = this._prevScanForTicksStamp = this._prevScanForTicksStamp || now
  var next = prev + this.tickScanDuration
  this.rrule.getBetween(prev, next)
  .map(function (timestamp) {
    if (!this.isRunning) return
    return setTimeout(
      function emitTriggerInfo () { this.observer.next({ timestamp: timestamp }) }.bind(this),
      new Date(timestamp).getTime() - now
    )
  }.bind(this))
  if (Date.now() > next) {
    throw new Error([
      'TriggerRrule overloaded: unable to process all rrule ticks within',
      'duration',
      this.tickScanDuration + 'ms.',
      'Trying specifying a larger `tickScanDuration`.'
    ].join(' '))
  }
}

module.exports = TriggerRrule
