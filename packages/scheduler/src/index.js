'use strict'

var StorageMemory = require('cogsworth-storage-memory')
var Schedule = require('cogsworth-schedule')
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
  this.subscriptions = {}
  this.state = 'STOPPED'
  this.storage = opts.storage || new StorageMemory()
  this.triggerObservable = Observable.create(function (observer) {
    this.triggerObserver = observer
  }.bind(this))
  if (opts.onTick) this.onTick = opts.onTick
  this.completeOnEmpty = !!opts.completeOnEmpty
}

/**
 * Add a schedule to the system
 */
Scheduler.prototype.addSchedule = function (_schedule) {
  var schedule = new Schedule(_schedule)
  if (!schedule.id) schedule.id = Math.random().toString().substr(2)
  return this.storage.create(schedule)
  .then(function subscribe (schedule) {
    debug('schedule added: ' + schedule.id)
    var sub = schedule.trigger.stream.subscribe({
      next: function emitTriggerEvent (triggerMeta) {
        if (this.state !== 'RUNNING') return
        var payload = schedule.toJSON()
        payload.event = triggerMeta
        if (!this.triggerObserver) throw new Error('scheduler has not be subscribed to')
        this.triggerObserver.next(payload)
      }.bind(this),
      complete: function () {
        debug('schedule completed: ' + schedule.id)
        return this.deleteSchedule(schedule.id)
      }.bind(this)
    })
    this.subscriptions[schedule.id] = sub
    if (!this.state.match(/STOP/i)) schedule.trigger.start()
    return schedule
  }.bind(this))
}

Scheduler.prototype.deleteSchedule = function (id) {
  if (!this.subscriptions[id]) throw new Error('no schedule id ' + id)
  this.subscriptions[id].unsubscribe()
  delete this.subscriptions[id]
  return this.storage.get(id)
  .then(function (schedule) { schedule.trigger.stop() })
  .then(function () { this.storage.delete(id) }.bind(this))
  .then(function () {
    debug('remaining unfininshed schedule triggers: ' + Object.keys(this.subscriptions).length)
    if (!Object.keys(this.subscriptions).length && this.completeOnEmpty) {
      return this.stop()
    }
  }.bind(this))
}

Scheduler.prototype.getSchedule = function (id) {
  return this.storage.get(id)
}

Scheduler.prototype.getSchedules = function () {
  return this.storage.get()
}

/**
 * Execute a function against each scheduler schedule
 * @param {Function} fn
 * @returns {Promise}
 */
Scheduler.prototype.applyToSchedules = function (fn) {
  return this.storage.get()
  .then(function apply (schedules) { return schedules.map(fn) })
}

/**
 * Start the scheduler
 * @returns {Promise}
 */
Scheduler.prototype.start = function () {
  this.state = 'STARTING'
  debug('scheduler state: ' + this.state)
  return this.applyToSchedules(function startSchedule (schedule) {
    debug('starting schedule: ' + schedule.id)
    return schedule.trigger.start()
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
  if (this.triggerObserver) this.triggerObserver.complete()
  return this.applyToSchedules(function stopSchedule (schedule) {
    return schedule.trigger.stop()
  })
  .then(function () {
    this.state = 'STOPPED'
    debug('scheduler state: ' + this.state)
    return Promise.resolve(this)
  }.bind(this))
}

module.exports = Scheduler
