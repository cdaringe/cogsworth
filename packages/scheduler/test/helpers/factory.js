'use strict'

var times = require('lodash/times')
var Scheduler = require('../../')
var SimpleTrigger = require('../../../trigger/src/SimpleTrigger')

module.exports = function schedulerFactory (opts) {
  opts = opts || {}
  opts.scheduler = opts.scheduler || {}
  opts.scheduler.completeOnEmpty = opts.scheduler.completeOnEmpty === undefined
    ? true
    : opts.scheduler.completeOnEmpty
  var sch = new Scheduler(opts.scheduler)
  var chain = Promise.resolve(sch)
  if (opts.randomSchedules) {
    chain = times(opts.randomSchedules).reduce(function (chain, n) {
      return chain.then(function () {
        var trigger = new SimpleTrigger()
        return sch.addSchedule({ trigger: trigger })
      })
    }, chain)
  }
  if (opts.schedules) {
    chain = opts.schedules.reduce(function (chain, schedule) {
      return chain.then(function () {
        return sch.addSchedule(schedule)
      })
    }, chain)
  }
  return chain.then(function () { return sch })
}
