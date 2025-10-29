import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { increment } from './store'

export default function App() {
  const value = useSelector(state => state.counter.value)
  const dispatch = useDispatch()
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h1>Hello World (React + Vite + Redux Toolkit)</h1>
      <p>Counter: {value}</p>
      <button onClick={() => dispatch(increment())}>Increment</button>
    </div>
  )
}


