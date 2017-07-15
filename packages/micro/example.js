process.env.DEBUG = '*'
require('./').start()
.then(triggerStream => {
  return triggerStream.forEach(({ job: { id } }) => {
    console.log(id)
    // kafka.push(evt)
  })
})
