export default function ProductCard({ product, onQuickView, onToggleWishlist, isWishlisted }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
    }

    const installment = (price) => {
        const value = price / 6
        return `6x de ${formatPrice(value)} sem juros`
    }

    return (
        <div className="group bg-white overflow-hidden transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) hover:shadow-premium relative">
            {/* Image Wrapper */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9]">
                {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 shadow-sm">
                            {product.badge}
                        </span>
                    </div>
                )}

                <img
                    src={Array.isArray(product.image) ? (product.image[0] || '/placeholder.jpg') : (product.image || '/placeholder.jpg')}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.19, 1, 0.22, 1) group-hover:scale-110"
                />

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-end justify-center p-6">
                    <button
                        onClick={() => onQuickView?.(product)}
                        className="opacity-0 group-hover:opacity-100 w-full bg-white text-[#1A1A1A] py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 translate-y-4 group-hover:translate-y-0 hover:bg-[#1A1A1A] hover:text-white shadow-2xl border border-gray-100"
                    >
                        Vista Rápida
                    </button>
                </div>

                <button
                    onClick={() => onToggleWishlist?.(product.id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-500 hover:bg-white hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100"
                    aria-label="Favoritar"
                >
                    <svg
                        className={`w-4 h-4 transition-all duration-500 ${isWishlisted ? 'text-primary fill-primary' : 'text-[#1A1A1A]'}`}
                        fill={isWishlisted ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

            {/* Product Details */}
            <div className="pt-6 pb-4 px-2 text-center">
                <span className="text-[9px] text-[#C6A76A] font-bold uppercase tracking-[0.3em] mb-2 block">
                    {product.category}
                </span>
                <h3 className="font-heading text-lg font-medium text-[#1A1A1A] mb-2 tracking-tight line-clamp-1">
                    {product.name}
                </h3>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        {product.original_price > 0 && product.original_price > product.price && (
                            <span className="text-[13px] text-gray-400 line-through font-light">{formatPrice(product.original_price)}</span>
                        )}
                        <span className="text-base font-bold text-[#1A1A1A]">{formatPrice(product.price)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">{installment(product.price)}</p>
                </div>

                {/* Luxury indicator line */}
                <div className="w-8 h-[1px] bg-[#EEEEEE] mx-auto mt-4 group-hover:w-16 group-hover:bg-[#C6A76A] transition-all duration-700"></div>
            </div>
        </div>
    )
}
