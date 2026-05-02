import { useState, useEffect } from 'react'

const WISHLIST_KEY = 'meraki_wishlist'

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(WISHLIST_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

export function useWishlist() {
    const [wishlist, setWishlist] = useState(loadFromStorage)

    useEffect(() => {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
    }, [wishlist])

    function toggleWishlist(productId) {
        setWishlist(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId)
            }
            return [...prev, productId]
        })
    }

    function isWishlisted(productId) {
        return wishlist.includes(productId)
    }

    return { wishlist, toggleWishlist, isWishlisted, wishlistCount: wishlist.length }
}
