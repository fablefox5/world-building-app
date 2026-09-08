import { BrowserRouter } from 'react-router-dom'
import './App.css'
import DeckCreator from './components/DeckCreator'
import DeckViewer from './components/DeckViewer'
import MainMenu from './components/MainMenu'
import AuthProvider from './context/AuthContext'

function App() {

  return (
    <BrowserRouter>
    <AuthProvider>
      <MainMenu />
    </AuthProvider>
    </BrowserRouter>
  )
}

export default App
