import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function Header({ cartCount = 0, wishlistCount = 0, onSearchOpen }) {
    const { session, user, profile } = useAuth()
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const userName = profile?.full_name || user?.user_metadata?.full_name || ''
    const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'glass shadow-premium'
                    : 'bg-white'
                }`}
        >
            {/* Top Bar - Hidden on scroll for focus */}
            <div className={`bg-[#C6A76A] text-white text-center text-[10px] uppercase tracking-[0.2em] py-1.5 px-4 font-semibold transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
                }`}>
                ✨ Frete Grátis acima de R$ 299 • Parcele em até 12x
            </div>

            {/* Main Header Container */}
            <div className="max-w-7xl mx-auto px-4">
                {/* Row 1: Logo and Icons */}
                <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'py-3' : 'py-6'}`}>
                    <Link to="/" className="font-heading text-3xl font-bold tracking-[0.15em] text-[#1A1A1A] hover:text-[#7A3E4A] transition-all duration-500 group flex items-center gap-2">
                        <span className="relative">
                            MERAKI
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#7A3E4A] transition-all duration-500 group-hover:w-full"></span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-5 md:gap-8">
                        {/* Search */}
                        <button onClick={onSearchOpen} className="group relative p-2 transition-all hover:-translate-y-0.5" aria-label="Buscar">
                            <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* User / Logged-in indicator */}
                        {session && initials ? (
                            <Link to="/auth" className="group flex items-center gap-3 transition-all hover:-translate-y-0.5" aria-label="Minha Conta">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#4A4A4A] flex items-center justify-center text-white text-[10px] font-bold shadow-premium ring-1 ring-black/5 group-hover:scale-110 transition-all duration-500">
                                    {initials}
                                </div>
                                <span className="hidden lg:block text-[11px] font-semibold uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors">
                                    {userName.split(' ')[0]}
                                </span>
                            </Link>
                        ) : (
                            <Link to="/auth" className="group relative p-2 transition-all hover:-translate-y-0.5" aria-label="Conta">
                                <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>
                        )}

                        {/* Wishlist */}
                        <button className="group relative p-2 transition-all hover:-translate-y-0.5" aria-label="Favoritos">
                            <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {wishlistCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[#7A3E4A] text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                                    {wishlistCount}
                                </span>
                            )}
                        </button>

                        {/* Cart */}
                        <button className="group relative p-2 transition-all hover:-translate-y-0.5" aria-label="Carrinho">
                            <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[#7A3E4A] text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Row 2: Navigation */}
                <nav className={`transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100 border-t border-black/[0.03]'}`}>
                    <ul className="flex justify-center items-center gap-10 py-5">
                        {['Home', 'Conjuntos', 'Linha Noite', 'Linha Sexy', 'Plus Size', 'Ofertas'].map((item) => (
                            <li key={item}>
                                <Link
                                    to={item === 'Home' ? '/' : `#${item.toLowerCase().replace(' ', '-')}`}
                                    className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#7A3E4A] transition-all duration-300 group inline-block"
                                >
                                    {item}
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-[#C6A76A] transition-all duration-500 group-hover:w-full"></span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    )
}
