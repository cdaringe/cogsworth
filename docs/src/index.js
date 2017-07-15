import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
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
setInterval(() => {
  Array.from(window.document.getElementsByClassName('lang-javascript'))
  .forEach(node => {
    if (node.className.match(/hljs/)) return
    node.className += ' hljs'
  })
}, 2000)

ReactDOM.render(
  (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ),
  document.getElementById('root')
)
registerServiceWorker()
