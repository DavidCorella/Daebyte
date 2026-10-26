import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'

// Usado en el build para generar el HTML estático (ver scripts/prerender.mjs)
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
