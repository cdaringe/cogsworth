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
  this.maxCount = this.rrule.origOptions.count || Infinity
  this.observer = null // set by Observable.create(...)
  this.stream = Observable.create(function (observer) { this.observer = observer }.bind(this))
}
TriggerRrule.prototype = Object.create(Trigger.prototype)
TriggerRrule.prototype.constructor = TriggerRrule

TriggerRrule.prototype.start = function () {
  this.count = 0
  this.isRunning = true
  this.wakeUpInvterval = setInterval(function () {
    this.streamTicks()
  }.bind(this), this.queueRefreshInterval)
}

TriggerRrule.prototype.getStream = function () {
  return this.stream
}

TriggerRrule.prototype.stop = function () {
  this.isRunning = false
  this.count = 0
  this.observer.complete()
  clearInterval(this.wakeUpInvterval)
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

TriggerRrule.prototype.streamTicks = function () {
  var now = new Date()

  if (this.startDate > now) return

  var windowLeadingEdge = this._windowLeadingEdge = this._windowLeadingEdge || this.startDate
  var windowTrailingEdge = new Date(windowLeadingEdge.getTime() + this.tickScanDuration)
  var tDate
  var isWithinWindow

  do {
    tDate = this.rrule.after(tDate || windowLeadingEdge, !tDate)
    if (tDate === null) {
      isWithinWindow = false
      break
    }
    isWithinWindow = tDate.getTime() < windowTrailingEdge.getTime()
    if (isWithinWindow) {
      setTimeout(
        function emitTriggerInfo (date) {
          if (!this.isRunning) return
          this.observer.next({ date: date })
          if (!this.rrule.after(date, !date)) this.stop()
        }.bind(this, tDate),
        tDate.getTime() - now.getTime()
      )
    }
  } while (isWithinWindow)

  this._windowLeadingEdge = windowTrailingEdge
  if (Date.now() > windowTrailingEdge) {
    throw new Error([
      'TriggerRrule overloaded: unable to process all rrule ticks within',
      'duration',
      this.tickScanDuration + 'ms.',
      'Trying specifying a larger `tickScanDuration`.'
    ].join(' '))
  }
}

module.exports = TriggerRrule
