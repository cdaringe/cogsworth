process.env.DEBUG = '*'
require('./').start()
.then(triggerStream => {
  return triggerStream.forEach(({ schedule: { id }, trigger: { date } }) => {
    console.log(`schedule ${id} fired at ${date}`)
  })
})
