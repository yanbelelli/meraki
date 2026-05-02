import { useState, useEffect } from 'react'

const CART_KEY = 'meraki_cart'

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(CART_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

export function useCart() {
    const [cart, setCart] = useState(loadFromStorage)

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart))
    }, [cart])

    function addToCart(product, size) {
        setCart(prev => {
            const existingIndex = prev.findIndex(
                item => item.id === product.id && item.size === size
            )
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1,
                }
                return updated
            }
            return [...prev, { ...product, size, quantity: 1 }]
        })
    }

    function removeFromCart(productId, size) {
        setCart(prev => prev.filter(item => !(item.id === productId && item.size === size)))
    }

    function clearCart() {
        setCart([])
    }

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

    return { cart, addToCart, removeFromCart, clearCart, cartCount }
}
