'use strict'

var Observable = require('rxjs/Observable').Observable
// var debug = require('debug')('cogsworth:Trigger')

/**
 * Skeleton class/interface for triggers
 * @param {*} opts
 */
function Trigger (opts) {
  opts = opts || {}
  if (!this.start || !this.stop || !this.getStream) {
    throw new Error('start, stop, & getStream are required members')
  }
  this.startDate = opts.startDate || new Date()
  this.endDate = opts.endDate || null
  this.stream = Observable.create(function (observer) { this.observer = observer }.bind(this))
}

Trigger.prototype.clearInterval = function () {
  if (this.wakeUpInvterval) clearInterval(this.wakeUpInvterval)
}

Trigger.prototype.getStream = function () {
  return this.stream
}

Trigger.prototype.isExpired = function (date) {
  if (!date) throw new Error('must pass date')
  if (!this.endDate) return false
  return date > this.endDate
}

Trigger.prototype.start = function () {
  this.state = 'RUNNING'
}

Trigger.prototype.stop = function () {
  this.state = 'STOPPED'
  this.observer.complete()
  this.clearInterval()
}

module.exports = Trigger
