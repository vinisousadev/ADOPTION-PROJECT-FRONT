import { BrowserRouter } from 'react-router-dom'
import { SmoothScrollProvider } from './components/SmoothScrollProvider'
import { AuthProvider } from './contexts/AuthContext'
import { AppRoutes } from './routes/AppRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SmoothScrollProvider>
    </BrowserRouter>
  )
}

export default App
