import { createContext, useReducer, useContext } from 'react';
export const CartContext = createContext(null);
function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find(i => i.id === action.item.id);
      if (exists) return state.map(i => i.id === action.item.id ? {...i, qty: i.qty + 1} : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'REMOVE': return state.filter(i => i.id !== action.id);
    case 'UPDATE_QTY': return state.map(i => i.id === action.id ? {...i, qty: action.qty} : i);
    case 'CLEAR': return [];
    default: return state;
  }
}
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, []);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  return <CartContext.Provider value={{ cart, dispatch, total }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
