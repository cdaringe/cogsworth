import React, { Component } from 'react'
import { MuiThemeProvider } from 'material-ui/styles'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { Link, Route } from 'react-router-dom'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'

import Home from './Home'

const LINKS = [
  {text: 'Home', url: '/', component: Home},
  {text: 'Scheduler'},
  {text: 'Micro(service)', url: '/microservice'},
  {text: 'Triggers'}
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
            iconClassNameRight='muidocs-icon-navigation-expand-more'
          />
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
