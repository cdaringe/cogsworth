// these are NOT Schedule instances, they are payloads to the service
module.exports = function scheduleFactory (opts) {
  opts = opts || {}
  return {
    trigger: opts.trigger || {
      vevent: `
        RRULE:FREQ=SECONDLY
      `
    }
  }
}
