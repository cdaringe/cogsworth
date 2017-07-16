process.env.DEBUG = '*'
require('./').start()
.then(triggerStream => {
  return triggerStream.forEach(({ id, event: { date } }) => {
    console.log(`schedule ${id} fired at ${date}`)
  })
})
