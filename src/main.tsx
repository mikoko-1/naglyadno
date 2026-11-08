import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { bootstrapSocraticProvider } from './lib/socratic/bootstrap.ts'

const socratesMode = bootstrapSocraticProvider()
if (import.meta.env.DEV) {
  console.info(`[Сократ] режим: ${socratesMode}`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
