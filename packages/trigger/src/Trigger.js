'use strict'

/**
 * Skeleton class/interface for triggers
 * @param {*} opts
 */
function Trigger (opts) {
  opts = opts || {}
  this.startDate = opts.startDate || Date.now()
  if (!this.start || !this.stop || !this.getStream) {
    throw new Error('start, stop, & getStream are required members')
  }
}

module.exports = Trigger
