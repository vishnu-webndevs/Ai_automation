import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { FlashProvider } from './contexts/FlashContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FlashProvider>
        <App />
      </FlashProvider>
    </AuthProvider>
  </StrictMode>,
)
