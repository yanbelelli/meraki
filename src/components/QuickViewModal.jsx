import { useState } from 'react'

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart, isWishlisted, onToggleWishlist }) {
    const [selectedSize, setSelectedSize] = useState(null)

    if (!isOpen || !product) return null

    const formatPrice = (price) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
    const sizes = product.sizes ? (typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : product.sizes) : []

    return (
        <>
            <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-[fadeInUp_300ms_ease-out]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Fechar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="aspect-square bg-gray-100">
                        <img src={Array.isArray(product.image) ? (product.image[0] || '/placeholder.jpg') : (product.image || '/placeholder.jpg')} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="p-6 md:p-8 flex flex-col">
                        <span className="text-xs text-primary font-semibold uppercase tracking-wider">{product.category}</span>
                        <h3 className="font-heading text-2xl font-bold text-gray-900 mt-2">{product.name}</h3>

                        <div className="mt-4">
                            {product.original_price > 0 && product.original_price > product.price && (
                                <span className="text-base text-gray-400 line-through mr-2">{formatPrice(product.original_price)}</span>
                            )}
                            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                            <p className="text-sm text-gray-500 mt-1">6x de {formatPrice(product.price / 6)} sem juros</p>
                        </div>

                        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                            {product.description || 'Peça confeccionada com tecidos de alta qualidade, proporcionando conforto e elegância.'}
                        </p>

                        {/* Sizes */}
                        {sizes.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tamanho</h4>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedSize === size ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-700 hover:border-primary'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-6 flex gap-4">
                            <button
                                onClick={() => {
                                    onAddToCart?.(product, selectedSize)
                                    if (!selectedSize && sizes.length > 0) {
                                        alert('Por favor, selecione um tamanho.')
                                    }
                                }}
                                className="flex-1 bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Adicionar ao Carrinho
                            </button>
                            <button
                                onClick={() => onToggleWishlist?.(product.id)}
                                className="p-4 rounded-xl border border-gray-200 hover:border-red-400 bg-white text-gray-400 hover:text-red-500 transition-all duration-300 shadow-sm"
                                aria-label="Favoritar"
                            >
                                <svg
                                    className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                                    fill={isWishlisted ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
