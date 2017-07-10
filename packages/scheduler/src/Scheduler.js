'use strict'

var StorageMemory = require('@cogsworth/storage-memory')
var Job = require('@cogsworth/job')
var Observable = require('rxjs/Observable').Observable

/**
 * Cogsworth scheduler
 * @param {*} opts
 * @param {Storage} [opts.storage=StorageMemory]
 * @param {Function} [opts.onTick] Scheduler the scheduler calls a function each
 *  time a trigger emits, vs `.start` providing an Observable instance
 * @property {string} state STOPPED, STARTING, RUNNING, STOPPING
 */
function Scheduler (opts) {
  opts = opts || {}
  this.state = 'STOPPED'
  this.storage = opts.storage || new StorageMemory()
  this.triggerObserver = Observable.create(function (observer) {
    this.triggerObserver = observer
  }.bind(this))
  if (opts.onTick) this.onTick = opts.onTick
}

/**
 * Add a job to the system
 */
Scheduler.prototype.addJob = function (job) {
  Job.validate(job)
  if (!job.id) job.id = Math.random().toString().substr(2)
  return this.storage.create(job)
  .then(function subscribe (job) {
    job.trigger.getStream().forEach(function emitTriggerEvent (triggerMeta) {
      if (this.state !== 'RUNNING') return
      var payload = { job: job, trigger: triggerMeta }
      this.triggerObserver.next(payload)
    }.bind(this))
    return job
  }.bind(this))
}

/**
 * Execute a function against each scheduler job
 * @param {Function} fn
 * @returns {Promise}
 */
Scheduler.prototype.applyToJobs = function (fn) {
  return this.storage.get()
  .then(function apply (jobs) { return jobs.map(fn) })
}

Scheduler.prototype.start = function () {
  this.state = 'STARTING'
  return this.applyToJobs(function startJob (job) {
    return job.trigger.start()
  })
  .then(function () { this.state = 'RUNNING' }.bind(this))
  .then(function () {
    if (this.onTick) return this.triggerObserver.subscribe(this.onTick)
    return this.triggerObserver
  }.bind(this))
}

Scheduler.prototype.stop = function () {
  this.state = 'STOPPING'
  this.triggerObserver.complete()
  return this.applyToJobs(function stopJob (job) {
    return job.trigger.stop()
  })
  .then(function () { this.state = 'STOPPED' }.bind(this))
}

module.exports = Scheduler
