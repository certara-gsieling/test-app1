import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

test('renders hello world and increments counter', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  )
  expect(screen.getByText(/Hello World/i)).toBeInTheDocument()
  const button = screen.getByRole('button', { name: /Increment/i })
  fireEvent.click(button)
  expect(screen.getByText(/Counter: 1/)).toBeInTheDocument()
})


