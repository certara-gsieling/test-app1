import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { defineCustomElements, setAssetPath } from '@certara/certara-ui-react'
import { store } from './store'
import App from './App'

// Initialize Certara DS web components and assets
if (typeof window !== 'undefined') {
  try {
    setAssetPath(window.location.origin)
    defineCustomElements(window)
  } catch {}
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)


