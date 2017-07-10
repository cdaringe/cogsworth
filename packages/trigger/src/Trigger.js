'use strict'

/**
 * Skeleton class/interface for triggers
 * @param {*} opts
 */
function Trigger (opts) {
  opts = opts || {}
  this.startDate = opts.startDate || new Date(Date.now() - 1000)
  if (!this.start || !this.stop || !this.getStream) {
    throw new Error('start, stop, & getStream are required members')
  }
}

module.exports = Trigger
