import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { HashRouter } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker'
import * as highlight from 'highlight.js'
import 'highlight.js/styles/solarized-light.css'
import marked from 'marked'
highlight.initHighlightingOnLoad()
marked.setOptions({
  highlight: function (code) {
    return highlight.highlightAuto(code).value
  }
})

// HACKS
var process = node => {
  if (node.className.match(/hljs/)) return
  node.className += ' hljs'
}
setInterval(() => {
  var setA = Array.from(window.document.getElementsByClassName('lang-javascript'))
  var setB = Array.from(window.document.getElementsByClassName('lang-js'))
  setA.forEach(process)
  setB.forEach(process)
}, 2000)

ReactDOM.render(
  (
    <HashRouter>
      <App />
    </HashRouter>
  ),
  document.getElementById('root')
)
registerServiceWorker()
