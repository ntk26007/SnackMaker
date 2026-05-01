import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { CartProvider } from './context/CartContext'

const isElectron =
  window.location.protocol === 'file:' ||
  navigator.userAgent.toLowerCase().includes('electron')

function App() {
  if (isElectron) {
    return (     
       <CartProvider>     
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </CartProvider>    )
  }

  return (
    <CartProvider>           
      <BrowserRouter basename={"/"}>
        <AppRoutes />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App