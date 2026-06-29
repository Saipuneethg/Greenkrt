import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      const token = sessionStorage.getItem('greenkrt_token');
      if (!token) {
        setInitialLoaded(true);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/cart', {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch cart", err);
      } finally {
        setInitialLoaded(true);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    if (!initialLoaded) return;
    const token = sessionStorage.getItem('greenkrt_token');
    if (!token) return;

    const syncTimer = setTimeout(async () => {
      try {
        await fetch('http://localhost:5000/api/cart/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ items: cart })
        });
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
    }, 500);

    return () => clearTimeout(syncTimer);
  }, [cart, initialLoaded]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCart((prev) => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
};
