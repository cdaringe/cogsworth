import React, { Component } from 'react'
import { MuiThemeProvider } from 'material-ui/styles'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { Link, Route } from 'react-router-dom'
import marked from 'marked'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import Home from './Home'
const readmes = {
  scheduler: require('raw-loader!cogsworth/packages/scheduler/README.md'), // eslint-disable-line
  micro: require('raw-loader!cogsworth/packages/micro/README.md'), // eslint-disable-line
  schedule: require('raw-loader!cogsworth/packages/schedule/README.md'), // eslint-disable-line
  trigger: require('raw-loader!cogsworth/packages/trigger/README.md') // eslint-disable-line
}

function toPaper (subproject) {
  return () => (
    <Paper className='content'>
      <div dangerouslySetInnerHTML={{ __html: marked(readmes[subproject]) }} />
    </Paper>
  )
}

const LINKS = [
  { text: 'Home', url: '/', component: Home },
  { text: 'Scheduler', component: toPaper('scheduler') },
  { text: 'Micro(service)', url: '/microservice', component: toPaper('micro') },
  { text: 'Schedule', component: toPaper('schedule') },
  { text: 'Trigger', component: toPaper('trigger') }
].map(it => {
  it.url = (it.url || ('/' + it.text)).toLowerCase()
  it.component = it.component || function Blah () { return <p>arstar</p> }
  return it
})

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: 'orange'
  }
})

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      drawerOpen: false
    }
  }
  toggleDrawer () {
    this.setState({ ...this.state, drawerOpen: !this.state.drawerOpen })
  }
  toggleDrawerClosed () {
    this.setState({ ...this.state, drawerOpen: false })
  }
  render () {
    const { drawerOpen } = this.state
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <AppBar
            onLeftIconButtonTouchTap={this.toggleDrawer.bind(this)}
            title='Cogsworth'
            iconClassNameRight='muidocs-icon-navigation-expand-more' />
          <Drawer open={drawerOpen}>
            {LINKS.map(it => (
              <Link key={it.url} to={it.url} onClick={this.toggleDrawerClosed.bind(this)}>
                <MenuItem>{it.text}</MenuItem>
              </Link>
            ))}
          </Drawer>
          <div id='content' onClick={this.toggleDrawerClosed.bind(this)}>
            {LINKS.map(it => {
              return <Route
                key={it.url}
                exact={it.url === '/'}
                path={it.url}
                component={it.component} />
            })}
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
