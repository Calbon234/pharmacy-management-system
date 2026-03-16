/**
 * PharmacyContext
 * Global pharmacy state: selected branch, cart/POS items, notifications.
 * Add more shared state here as the app grows.
 */
import { createContext, useContext, useState } from 'react'

const PharmacyContext = createContext(null)

export function PharmacyProvider({ children }) {
  const [activeBranch, setActiveBranch] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [notifications, setNotifications] = useState([])

  const addToCart = (item) => setCartItems(prev => [...prev, item])
  const clearCart = () => setCartItems([])

  return (
    <PharmacyContext.Provider value={{
      activeBranch, setActiveBranch,
      cartItems, addToCart, clearCart,
      notifications, setNotifications,
    }}>
      {children}
    </PharmacyContext.Provider>
  )
}

export const usePharmacy = () => useContext(PharmacyContext)
