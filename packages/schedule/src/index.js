'use strict'

var uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)} // eslint-disable-line
var Trigger = require('cogsworth-trigger').Trigger

function Schedule (opts) {
  Schedule.validate(opts)
  this.id = opts.id || uuid()
  this.tourist = opts.tourist || null
  this.trigger = opts.trigger
}

Schedule.prototype.toJSON = function () {
  var serialized = {}
  for (var k in this) {
    if (this.hasOwnProperty(k)) {
      if (this[k] !== undefined && typeof this[k] !== 'function') {
        serialized[k] = (this[k] && this[k].toJSON) ? this[k].toJSON() : this[k]
      }
    }
  }
  return serialized
}

Schedule.prototype.toString = function () {
  return JSON.stringify(this.toJSON())
}

Schedule.validate = function validateSchedule (schedule) {
  if (!schedule) throw new Error('missing schedule options')
  if (!schedule.trigger) throw new Error('schedule has no trigger defined')
  if (!(schedule.trigger instanceof Trigger)) {
    throw new Error('schedule.trigger must be Trigger instance')
  }
}

module.exports = Schedule
