'use strict'

var Observable = require('rxjs/Observable').Observable
var debug = require('debug')('cogsworth:Trigger')

/**
 * Skeleton class/interface for triggers
 * @param {*} opts
 */
function Trigger (opts) {
  opts = opts || {}
  if (!this.start || !this.stop || !this.getStream) {
    throw new Error('start, stop, & getStream are required members')
  }
  this.startDate = opts.startDate || new Date(Date.now() - 10)
  this.endDate = opts.endDate || null
  this.tickScanDuration = opts.tickScanDuration || 30 * 1000 // @TODO document
  this.stream = Observable.create(function (observer) { this.observer = observer }.bind(this))
  this._isFirstNextTriggerCheck = true
}

Trigger.prototype.getStream = function () {
  return this.stream
}

Trigger.prototype.streamBatchedTriggerEvents = function () {
  var now = new Date()

  if (this.startDate > now) return

  var windowLeadingEdge = this._windowLeadingEdge = this._windowLeadingEdge || this.startDate
  var windowTrailingEdge = new Date(windowLeadingEdge.getTime() + this.tickScanDuration)
  var tDate = windowLeadingEdge
  var isWithinWindow
  do {
    if (this.endDate && tDate && tDate > this.endDate) return this.stop()
    tDate = this.getNextTriggerEvent(tDate, this._isFirstNextTriggerCheck)
    this._isFirstNextTriggerCheck = false
    if (!tDate) {
      isWithinWindow = false
      break
    }
    isWithinWindow = tDate.getTime() < windowTrailingEdge.getTime()
    if (isWithinWindow) {
      var msFromNow = tDate.getTime() - now.getTime()
      if (msFromNow < 0) msFromNow = 0
      debug('scheduling tick ' + msFromNow + ' msFromNow')
      setTimeout(
        function emitTriggerInfo (date) {
          if (!this.isRunning) return
          this.observer.next({ date: date })
          if (this.shouldStop(date)) this.stop()
        }.bind(this, tDate),
        msFromNow
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

Trigger.prototype.start = function () {
  if (this.getNextTriggerEvent) {
    this.wakeUpInvterval = setInterval(
      this.streamBatchedTriggerEvents.bind(this),
      this.streamBatchInterval
    )
    this.streamBatchedTriggerEvents()
  }
}

Trigger.prototype.stop = function () {
  this.observer.complete()
  if (this.getNextTriggerEvent) {
    clearInterval(this.wakeUpInvterval)
  }
}

module.exports = Trigger
