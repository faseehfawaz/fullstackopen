import React from 'react'
import ReactDOM from 'react-dom/client'
import { createStore } from 'redux'
import counterReducer from './reducer'
import App from './App'

const store = createStore(counterReducer)
const root = ReactDOM.createRoot(document.getElementById('root'))

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App store={store} />
    </React.StrictMode>
  )
}

renderApp()
store.subscribe(renderApp)
