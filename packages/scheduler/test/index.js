'use strict'

var tape = require('tape')
var Scheduler = require('../src/Scheduler')
var times = require('lodash/times')

var SimpleTrigger = require('../../trigger/src/SimpleTrigger')
var TriggerRrule = require('../../trigger-rrule/')

var factory = function (opts) {
  opts = opts || {}
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

tape('Scheduler', function (t) {
  var s1 = new Scheduler()
  t.ok(s1.start, 'scheduler, startable')
  t.ok(s1.stop, 'scheduler, stopable')
  t.end()
})

tape('add job', function (t) {
  var sched = new Scheduler()
  t.plan(3)
  t.throws(function () { sched.addJob() }, 'errors adding bogus job')
  return factory({ randomJobs: 1 })
  .then(function (sched) { return sched.start() })
  .then(function (observable) {
    observable.subscribe(function (evt) {
      t.ok(evt, 'scheduler emits ticks')
      t.ok(evt.job.id, 'scheduler emits job data in ticks')
      t.end()
    })
  })
  .then(function () { /* noop */ }, t.end)
})

tape('start scheduler, run many jobs', function (t) {
  t.plan(1)
  var numSimpleTriggerTicks = 10
  return factory({ randomJobs: numSimpleTriggerTicks })
  .then(function (sched) { return sched.start() })
  .then(function (observable) {
    var ticks = 0
    observable.subscribe(function (evt) {
      ++ticks
      if (ticks < numSimpleTriggerTicks) return
      setTimeout(function () {
        t.equal(numSimpleTriggerTicks, ticks, 'ticks correct amount')
        t.end()
      }, 10) // allow time for bogus events to attempt to ruin our ticks state!
    })
  })
  .then(function () { /* noop */ }, t.end)
})

tape('onTick (vs observable)', function (t) {
  t.plan(1)
  var ticks = 0
  var numSimpleTriggerTicks = 2
  return factory({
    scheduler: {
      onTick: function () {
        ++ticks
        if (ticks < numSimpleTriggerTicks) return
        setTimeout(function () {
          t.equal(numSimpleTriggerTicks, ticks, 'ticks correct amount')
          t.end()
        }, 10) // allow time for bogus events to attempt to ruin our ticks state!
      }
    },
    randomJobs: numSimpleTriggerTicks
  })
  .then(function (sched) {
    return sched.start()
  })
  .then(function () { /* noop */ }, t.end)
})

tape('stop scheduler', function (t) {
  t.plan(1)
  var numSimpleTriggerTicks = 10
  var scheduler
  return factory({ randomJobs: numSimpleTriggerTicks })
  .then(function (sched) {
    scheduler = sched
    return sched.start()
  })
  .then(function (observable) {
    var ticks = 0
    observable.subscribe(function (evt) {
      ++ticks
      scheduler.stop()
      setTimeout(function () {
        t.equal(ticks, 1, 'ticks correct amount when stopping and triggers queued')
        t.end()
      }, 20) // allow time for bogus events to attempt to ruin our ticks state!
    })
  })
  .then(function () { /* noop */ }, t.end)
})

tape('rrule triggers', function (t) {
  t.plan(1)
  var aTicks = 10
  var bTicks = 4
  var expectedTicks = aTicks + bTicks
  var jobs = [
    {
      id: 'rrule_test_a',
      trigger: new TriggerRrule({ rrule: 'FREQ=SECONDLY;COUNT=' + aTicks })
    },
    {
      id: 'rrule_test_b',
      trigger: new TriggerRrule({ rrule: 'FREQ=SECONDLY;COUNT=4;INTERVAL=' + bTicks })
    }
  ]
  var scheduler
  return factory({ jobs: jobs })
  .then(function (sched) {
    scheduler = sched
    return sched.start()
  })
  .then(function (observable) {
    var ticks = 0
    observable.subscribe(function (evt) {
      ++ticks
      if (ticks < expectedTicks) return
      setTimeout(function () {
        scheduler.stop()
        t.equal(ticks, expectedTicks, 'rrule ticks per expectation')
        t.end()
      }, 50) // allow time for bogus events to attempt to ruin our ticks state!
    })
  })
  .then(function () { /* noop */ }, t.end)
})
