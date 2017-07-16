'use strict'

var test = require('ava').test
var Scheduler = require('../')
var factory = require('./helpers/factory')
var bb = require('bluebird')

test('Scheduler', function (t) {
  var s1 = new Scheduler()
  t.truthy(s1.start, 'scheduler, startable')
  t.truthy(s1.stop, 'scheduler, stopable')
})

test('bogus schedule', function (t) {
  t.throws(() => new Scheduler().addSchedule(), Error, 'errors adding bogus schedule')
})

test('add schedule', function (t) {
  var scheduler
  t.plan(2)
  return factory({ randomSchedules: 1 })
  .then(sched => {
    scheduler = sched
    return scheduler.start()
  })
  .then(function (observable) {
    return Promise.resolve(observable.forEach(function (schedule) {
      t.truthy(schedule, 'scheduler emits ticks')
      t.truthy(schedule.id, 'scheduler emits schedule data in ticks')
      scheduler.stop()
    }))
  })
})

test('start scheduler, run many schedules', function (t) {
  var ticks = 0
  t.plan(1)
  var numSimpleTriggerTicks = 10
  return factory({ randomSchedules: numSimpleTriggerTicks })
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
    randomSchedules: numSimpleTriggerTicks
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
  return factory({ randomSchedules: numSimpleTriggerTicks })
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
