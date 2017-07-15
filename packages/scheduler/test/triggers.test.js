'use strict'

var test = require('ava').test
var factory = require('./helpers/factory')
var bb = require('bluebird')

var TriggerRrule = require('../../trigger-rrule/')
var TriggerCron = require('../../trigger-cron/')

test('rrule triggers', function (t) {
  var aTicks = 2
  var bTicks = 4
  var expectedTicks = aTicks + bTicks
  var scheduler
  var jobs = [
    {
      id: 'rrule_test_a',
      trigger: new TriggerRrule({ rrule: 'FREQ=SECONDLY;COUNT=' + aTicks })
    },
    {
      id: 'rrule_test_b',
      trigger: new TriggerRrule({ rrule: 'FREQ=SECONDLY;INTERVAL=2;COUNT=' + bTicks })
    }
  ]
  var ticks = 0
  var aEmissions = 0
  var bEmissions = 0
  t.plan(3)
  return factory({ jobs: jobs })
  .then(function (sched) {
    scheduler = sched
    return sched.start()
  })
  .then(function (observable) {
    var chain = observable
    .forEach(function (evt) {
      ++ticks
      if (evt.job.id === jobs[0].id) ++aEmissions
      else if (evt.job.id === jobs[1].id) ++bEmissions
      else throw new Error('unable to determine emitted job')
    })
    return chain
  })
  .then(function () { return bb.delay(50) })
  .then(function (res) {
    scheduler.stop()
    t.is(ticks, expectedTicks, 'rrule ticks per expectation')
    t.is(aEmissions, aTicks, 'rrule ticks per expectation on trigger a')
    t.is(bEmissions, bTicks, 'rrule ticks per expectation on trigger b')
  })
})

test('cron triggers', function (t) {
  var aTicks = 9
  var bTicks = 4
  var cronDuration = 10000 // ms
  var expectedTicks = aTicks + bTicks
  var t1 = new Date(Date.now() + 100)
  var t2 = new Date(t1.getTime() + cronDuration)
  var jobs = [
    {
      id: 'cron_test_a',
      trigger: new TriggerCron({
        cron: '* * * * * *',
        startDate: t1,
        endDate: t2
      })
    },
    {
      id: 'cron_test_b',
      trigger: new TriggerCron({
        cron: '*/2 * * * * *',
        startDate: new Date(t1 - 100),
        endDate: t2
      })
    }
  ]
  var aEmissions = 0
  var bEmissions = 0
  var ticks
  t.plan(3)
  return factory({ jobs: jobs })
  .then(function (sched) {
    return sched.start()
  })
  .then(function (observable) {
    return observable.forEach(function (evt) {
      ++ticks
      if (evt.job.id === jobs[0].id) ++aEmissions
      else if (evt.job.id === jobs[1].id) ++bEmissions
      else throw new Error('unable to determine emitted job')
    })
  })
  .then(() => bb.delay(20))
  .then(function () {
    t.truthy((expectedTicks - 1) < ticks < (expectedTicks + 1), 'cron ticks per expectation')
    t.truthy((aTicks - 1) < aEmissions < (aTicks + 1), 'cron ticks per expectation on trigger a')
    t.truthy((bTicks - 1) < bEmissions < (bTicks + 1), 'cron ticks per expectation on trigger b')
  })
})

test('long running triggers', function (t) {
  var scheduler
  var jobs = [
    {
      id: 'forever_trigger_job',
      trigger: new TriggerRrule({ rrule: 'FREQ=SECONDLY' })
    }
  ]
  var ticks = 0
  t.plan(1)
  return factory({ jobs: jobs })
  .then(function (sched) {
    scheduler = sched
    return sched.start()
  })
  .then(function (observable) {
    observable.forEach(function (evt) {
      ++ticks
    })
  })
  .then(function () { return bb.delay(2000) })
  .then(function () {
    scheduler.stop()
    t.truthy(2 < ticks <= 3, 'rrule ticks per expectation') // eslint-disable-line
  })
})
