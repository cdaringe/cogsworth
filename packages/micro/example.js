// var kafka = require('node-kafka)
// var client = new kafka.Client() // defaults are all good!
// var producer = new kafka.Producer(client)
// ...
// producer.send('schedules', schedule)
process.env.DEBUG = '*'

// require('cogsworth-micro').start()
require('./').start()
.then(triggerStream => {
  return triggerStream.forEach(({ id, event: { date } }) => {
    console.log(`schedule ${id} fired at ${date}`)
  })
})
