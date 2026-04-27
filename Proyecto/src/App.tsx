import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppRoutes } from './router'

const isElectron = 
  window.location.protocol === 'file:' || 
  navigator.userAgent.toLowerCase().includes('electron')

console.log('isElectron:', isElectron)
console.log('protocol:', window.location.protocol)
console.log('userAgent:', navigator.userAgent)

function App() {
  if (isElectron) {
    return (
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    )
  }

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App