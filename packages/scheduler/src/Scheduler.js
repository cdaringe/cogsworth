'use strict'

var StorageMemory = require('@cogsworth/storage-memory')
var Job = require('@cogsworth/job')
var Observable = require('rxjs/Observable').Observable
var debug = require('debug')('cogsworth:Scheduler')

/**
 * Cogsworth scheduler
 * @param {*} opts
 * @param {Storage} [opts.storage=StorageMemory]
 * @param {Function} [opts.onTick] Scheduler the scheduler calls a function each
 *  time a trigger emits, vs `.start` providing an Observable instance
 * @property {string} state STOPPED, STARTING, RUNNING, STOPPING
 * @property {boolean} [opts.completeOnEmpty=false]
 */
function Scheduler (opts) {
  opts = opts || {}
  this.state = 'STOPPED'
  this.storage = opts.storage || new StorageMemory()
  this.triggerObservable = Observable.create(function (observer) {
    this.triggerObserver = observer
  }.bind(this))
  if (opts.onTick) this.onTick = opts.onTick
  this.jobTriggerCount = 0
  this.completeOnEmpty = !!opts.completeOnEmpty
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
    .then(function () {
      --this.jobTriggerCount
      debug('remaining unfininshed job triggers: ' + this.jobTriggerCount)
      if (!this.jobTriggerCount && this.completeOnEmpty) {
        return this.stop()
      }
    }.bind(this))
    ++this.jobTriggerCount
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
  debug('scheduler state: ' + this.state)
  return this.applyToJobs(function startJob (job) {
    debug('starting job: ' + job.id)
    return job.trigger.start()
  })
  .then(function () { this.state = 'RUNNING' }.bind(this))
  .then(function () {
    debug('scheduler state: ' + this.state)
    if (this.onTick) {
      return this.triggerObservable.forEach(this.onTick)
    }
    return this.triggerObservable
  }.bind(this))
}

Scheduler.prototype.stop = function () {
  if (this.state.match(/STOP/)) return Promise.resolve(this)
  this.state = 'STOPPING'
  this.triggerObserver.complete()
  return this.applyToJobs(function stopJob (job) {
    return job.trigger.stop()
  })
  .then(function () {
    this.state = 'STOPPED'
    debug('scheduler state: ' + this.state)
    return Promise.resolve(this)
  }.bind(this))
}

module.exports = Scheduler
