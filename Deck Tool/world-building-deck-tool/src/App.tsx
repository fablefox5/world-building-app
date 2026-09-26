import { BrowserRouter } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import AuthProvider from './context/AuthContext'

function App() {

  return (
    <BrowserRouter>
    <AuthProvider>
      <LandingPage />
    </AuthProvider>
    </BrowserRouter>
  )
}

export default App
