'use strict'

var Observable = require('rxjs/Observable').Observable
// var debug = require('debug')('cogsworth:Trigger')

/**
 * Skeleton class/interface for triggers
 * @param {*} opts
 */
function Trigger (opts) {
  opts = opts || {}
  if (!this.start || !this.stop) {
    throw new Error('start, stop are required members')
  }
  this.startDate = opts.startDate || new Date()
  this.endDate = opts.endDate || null
  this.stream = Observable.create(function (observer) { this.observer = observer }.bind(this))
}

Trigger.prototype.start = function () {
  this.state = 'RUNNING'
}

Trigger.prototype.stop = function () {
  this.state = 'STOPPED'
  this.observer.complete()
}

Trigger.prototype.toJSON = function () {
  return {
    startDate: this.startDate,
    endDate: this.endDate
  }
}

module.exports = Trigger
