'use strict'

var test = require('ava').test
var Scheduler = require('../src/Scheduler')
var factory = require('./helpers/factory')
var bb = require('bluebird')

test('Scheduler', function (t) {
  var s1 = new Scheduler()
  t.truthy(s1.start, 'scheduler, startable')
  t.truthy(s1.stop, 'scheduler, stopable')
})

test('bogus job', function (t) {
  t.throws(() => new Scheduler().addJob(), Error, 'errors adding bogus job')
})

test('add job', function (t) {
  var scheduler
  t.plan(2)
  return factory({ randomJobs: 1 })
  .then(sched => {
    scheduler = sched
    return scheduler.start()
  })
  .then(function (observable) {
    return Promise.resolve(observable.forEach(function (evt) {
      t.truthy(evt, 'scheduler emits ticks')
      t.truthy(evt.job.id, 'scheduler emits job data in ticks')
      scheduler.stop()
    }))
  })
})

test('start scheduler, run many jobs', function (t) {
  var ticks = 0
  t.plan(1)
  var numSimpleTriggerTicks = 10
  return factory({ randomJobs: numSimpleTriggerTicks })
  .then(function (sched) {
    return sched.start()
  })
  .then(observable => observable.forEach(evt => {
    ++ticks
  }))
  .then(() => {
    t.is(numSimpleTriggerTicks, ticks, 'ticks correct amount')
  })
})

test('onTick (vs observable)', function (t) {
  t.plan(1)
  var ticks = 0
  var numSimpleTriggerTicks = 2
  return factory({
    scheduler: {
      completeOnEmpty: true,
      onTick: function () {
        ++ticks
      }
    },
    randomJobs: numSimpleTriggerTicks
  })
  .then(function (sched) { return sched.start() })
  .then(() => bb.delay(50))
  .then(() => {
    t.is(numSimpleTriggerTicks, ticks, 'ticks correct amount')// allow time for bogus events to attempt to ruin our ticks state!
  })
})

test('stop scheduler', function (t) {
  t.plan(1)
  var numSimpleTriggerTicks = 10
  var ticks = 0
  var scheduler
  return factory({ randomJobs: numSimpleTriggerTicks })
  .then(function (sched) {
    scheduler = sched
    return sched.start()
  })
  .then(function (observable) {
    return observable.forEach(function (evt) {
      ++ticks
      scheduler.stop()
    })
  })
  .then(() => bb.delay(20))
  .then(function () {
    t.is(ticks, 1, 'ticks correct amount when stopping and triggers queued')
  })
})
