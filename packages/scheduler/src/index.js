'use strict'

var StorageMemory = require('cogsworth-storage-memory')
var Job = require('cogsworth-job')
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
  this.jobSubscriptions = {}
  this.state = 'STOPPED'
  this.storage = opts.storage || new StorageMemory()
  this.triggerObservable = Observable.create(function (observer) {
    this.triggerObserver = observer
  }.bind(this))
  if (opts.onTick) this.onTick = opts.onTick
  this.completeOnEmpty = !!opts.completeOnEmpty
}

/**
 * Add a job to the system
 */
Scheduler.prototype.addJob = function (_job) {
  var job = new Job(_job)
  if (!job.id) job.id = Math.random().toString().substr(2)
  return this.storage.create(job)
  .then(function subscribe (job) {
    debug('job added: ' + job.id)
    var sub = job.trigger.getStream().subscribe({
      next: function emitTriggerEvent (triggerMeta) {
        if (this.state !== 'RUNNING') return
        var payload = { job: job, trigger: triggerMeta }
        this.triggerObserver.next(payload)
      }.bind(this),
      complete: function () {
        debug('job completed: ' + job.id)
        return this.deleteJob(job.id)
      }.bind(this)
    })
    this.jobSubscriptions[job.id] = sub
    if (!this.state.match(/STOP/i)) job.trigger.start()
    return job
  }.bind(this))
}

Scheduler.prototype.deleteJob = function (id) {
  if (!this.jobSubscriptions[id]) {
    throw new Error('no job id ' + id)
  }
  this.jobSubscriptions[id].unsubscribe()
  delete this.jobSubscriptions[id]
  debug('remaining unfininshed job triggers: ' + Object.keys(this.jobSubscriptions).length)
  if (!Object.keys(this.jobSubscriptions).length && this.completeOnEmpty) {
    return this.stop()
  }
}

Scheduler.prototype.getJobs = function () {
  return this.storage.get()
}

Scheduler.prototype.getStream = function () {
  return this.triggerObservable
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

/**
 * Start the scheduler
 * @returns {Promise}
 */
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

/**
 * Stop the scheduler
 * @returns {Promise}
 */
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
