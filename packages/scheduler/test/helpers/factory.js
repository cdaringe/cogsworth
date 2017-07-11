'use strict'

var times = require('lodash/times')
var Scheduler = require('../../src/Scheduler')
var SimpleTrigger = require('../../../trigger/src/SimpleTrigger')

module.exports = function schedulerFactory (opts) {
  opts = opts || {}
  opts.scheduler = opts.scheduler || {}
  opts.scheduler.completeOnEmpty = opts.scheduler.completeOnEmpty === undefined
    ? true
    : opts.scheduler.completeOnEmpty
  var sch = new Scheduler(opts.scheduler)
  var chain = Promise.resolve(sch)
  if (opts.randomJobs) {
    chain = times(opts.randomJobs).reduce(function (chain, n) {
      return chain.then(function () {
        var trigger = new SimpleTrigger()
        return sch.addJob({ trigger: trigger })
      })
    }, chain)
  }
  if (opts.jobs) {
    chain = opts.jobs.reduce(function (chain, job) {
      return chain.then(function () {
        return sch.addJob(job)
      })
    }, chain)
  }
  return chain.then(function () { return sch })
}
