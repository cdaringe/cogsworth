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
  this._includeMomentIfOnIntervalBoundary = true
}

Trigger.prototype.clearInterval = function () {
  if (this.wakeUpInvterval) clearInterval(this.wakeUpInvterval)
}

Trigger.prototype.getStream = function () {
  return this.stream
}

Trigger.prototype.streamBatchedTriggerEvents = function () {
  if (this.startDate > new Date()) return debug('too early to start trigger')

  var windowLeadingEdge = this._windowLeadingEdge = this._windowLeadingEdge || this.startDate
  var windowTrailingEdge = new Date(windowLeadingEdge.getTime() + this.tickScanDuration)
  this._windowLeadingEdge = windowTrailingEdge
  debug('start batching ticks. leading edge: ' + windowLeadingEdge.toISOString())
  var tickMoment = windowLeadingEdge
  var isWithinWindow
  do {
    // assert we haven't exceeded the trigger end date
    if (this.endDate && tickMoment && tickMoment > this.endDate) {
      debug('end date reached, stopping')
      return this.stop()
    }

    // get next tick date from the last tick date
    tickMoment = this.getNextTriggerEvent(tickMoment, this._includeMomentIfOnIntervalBoundary)
    this._includeMomentIfOnIntervalBoundary = false

    // exit if no ticks remain
    if (!tickMoment) {
      debug('trigger indicated no more events available, waiting for final tick to complete')
      this.clearInterval()
      return
    }

    // emit tick if it falls within this batch window
    isWithinWindow = tickMoment.getTime() < windowTrailingEdge.getTime()
    if (isWithinWindow) {
      var msFromNow = tickMoment.getTime() - new Date().getTime()
      if (msFromNow < 0) {
        debug('time slip: javascript vm slow, time fast! trigger should have fired in past--launching it now')
        msFromNow = 0
      }
      debug('scheduling tick ' + msFromNow + ' msFromNow')
      setTimeout(
        function emitTriggerInfo (date) {
          if (!this.isRunning) return
          this.observer.next({ date: date })
          if (this.shouldStop(date)) {
            return this.stop()
          }
        }.bind(this, tickMoment),
        msFromNow
      )
    }
  } while (isWithinWindow)
  this._includeMomentIfOnIntervalBoundary = true
  debug('finish batching ticks. leading edge: ' + windowLeadingEdge.toISOString())

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
  this.clearInterval()
}

module.exports = Trigger
