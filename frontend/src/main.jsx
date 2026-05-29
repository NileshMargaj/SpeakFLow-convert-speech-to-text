import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './components/Router.jsx'

createRoot(document.getElementById('root')).render(
  <AppRouter />
)

