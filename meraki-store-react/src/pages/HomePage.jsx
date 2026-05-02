import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroBanner from '../components/HeroBanner.jsx'
import BenefitsBar from '../components/BenefitsBar.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SearchOverlay from '../components/SearchOverlay.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import Notification from '../components/Notification.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../hooks/useCart.js'
import { useWishlist } from '../hooks/useWishlist.js'

const categories = [
    { name: 'Conjuntos', description: 'Sutiãs e calcinhas combinando', gradient: 'from-primary-light to-[#D4A69A]' },
    { name: 'Linha Noite', description: 'Camisolas e pijamas elegantes', gradient: 'from-success to-[#5A6B52]' },
    { name: 'Linha Sexy', description: 'Peças sensuais e sofisticadas', gradient: 'from-primary to-primary-dark' },
    { name: 'Plus Size', description: 'Elegância em todos os tamanhos', gradient: 'from-accent to-[#A88940]' },
]

export default function HomePage() {
    const [searchOpen, setSearchOpen] = useState(false)
    const [quickViewProduct, setQuickViewProduct] = useState(null)
    const [notification, setNotification] = useState({ message: '', visible: false })

    const { products: bestSellers, loading: loadingBest } = useProducts('best-sellers')
    const { products: featured, loading: loadingFeatured } = useProducts('featured')
    const { products: newCollection, loading: loadingNew } = useProducts('new-collection')

    const { cartCount, addToCart } = useCart()
    const { wishlistCount, toggleWishlist, isWishlisted } = useWishlist()

    const showNotification = useCallback((message) => {
        setNotification({ message, visible: true })
    }, [])

    const handleAddToCart = useCallback((product, size) => {
        addToCart(product, size)
        setQuickViewProduct(null)
        showNotification('Produto adicionado ao carrinho!')
    }, [addToCart, showNotification])

    function ProductSection({ title, subtitle, products, loading, id }) {
        return (
            <FadeInSection>
                <section className="py-24" id={id}>
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col items-center text-center mb-16 px-4">
                            <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
                                Exclusividade Meraki
                            </span>
                            <h2 className="font-heading text-4xl md:text-5xl text-[#1A1A1A] mb-6">
                                {title}
                            </h2>
                            <div className="w-12 h-[1px] bg-[#C6A76A] mb-6"></div>
                            <p className="text-gray-500 max-w-lg italic font-light text-lg">{subtitle}</p>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-[1px] border-[#C6A76A] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                                {products.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.1 }}
                                        transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
                                    >
                                        <ProductCard
                                            product={product}
                                            onQuickView={setQuickViewProduct}
                                            onToggleWishlist={toggleWishlist}
                                            isWishlisted={isWishlisted(product.id)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-8">Nenhum produto disponível no momento.</p>
                        )}
                    </div>
                </section>
            </FadeInSection>
        )
    }

    const FadeInSection = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay }}
        >
            {children}
        </motion.div>
    )

    return (
        <div className="bg-[#FCFAFA]">
            <Header cartCount={cartCount} wishlistCount={wishlistCount} onSearchOpen={() => setSearchOpen(true)} />

            <HeroBanner />

            <FadeInSection delay={0.2}>
                <BenefitsBar />
            </FadeInSection>

            {/* Categories */}
            <FadeInSection>
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col items-center text-center mb-16 px-4">
                            <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
                                Nossas Coleções
                            </span>
                            <h2 className="font-heading text-4xl md:text-5xl text-[#1A1A1A] mb-6">
                                Categorias
                            </h2>
                            <div className="w-12 h-[1px] bg-[#C6A76A] mb-6"></div>
                            <p className="text-gray-500 max-w-lg italic font-light text-lg">Curadoria exclusiva das melhores peças para você.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {categories.map((cat, idx) => (
                                <motion.div
                                    key={cat.name}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
                                >
                                    <CategoryCard {...cat} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <ProductSection id="best-sellers" title="Best Sellers" subtitle="As peças consagradas pela elegância e conforto." products={bestSellers} loading={loadingBest} />

            {/* Split Banner / Editorial Section */}
            <FadeInSection>
                <section className="py-12 px-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FDF8F6] p-8 md:p-16">
                        <div className="space-y-6">
                            <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em]">Artesanal & Premium</span>
                            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight">A arte de se sentir <span className="italic">extraordinária</span>.</h2>
                            <p className="text-gray-600 font-light leading-relaxed max-w-md">Cada costura, cada detalhe em renda foi pensado para elevar sua confiança e celebrar sua beleza única em todos os momentos.</p>
                            <Link to="/shop" className="inline-block border-b-2 border-[#1A1A1A] pb-2 text-xs font-bold uppercase tracking-widest hover:text-[#C6A76A] hover:border-[#C6A76A] transition-all">Ver Manifesto</Link>
                        </div>
                        <div className="relative aspect-square">
                            <img src="/assets/banners/banner-2.jpg" className="w-full h-full object-cover shadow-2xl" alt="Manifesto Meraki" />
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <ProductSection id="featured" title="Destaques Curados" subtitle="Uma seleção especial para quem valoriza o design exclusivo." products={featured} loading={loadingFeatured} />
            <ProductSection id="new-collection" title="Novos Horizontes" subtitle="Descubra o frescor da estação em nossa nova coleção." products={newCollection} loading={loadingNew} />

            {/* Newsletter - Editorial Style */}
            <FadeInSection>
                <section className="py-32 bg-white border-t border-[#EEEEEE]">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-6 block">Concierge & Lifestyle</span>
                        <h2 className="font-heading text-4xl md:text-6xl text-[#1A1A1A] mb-8 px-4">Junte-se ao Universo <span className="italic">Meraki</span>.</h2>
                        <p className="text-[#666666] mb-12 font-light text-lg max-w-xl mx-auto leading-relaxed">Assine nossa newsletter e receba convites para eventos exclusivos, lançamentos antecipados e curadoria de moda íntima.</p>

                        <form className="relative max-w-md mx-auto group" onSubmit={(e) => { e.preventDefault(); showNotification('Bem-vinda ao universo Meraki!') }}>
                            <div className="flex flex-col sm:flex-row items-center border-b border-[#1A1A1A] pb-2 transition-all duration-500 focus-within:border-[#C6A76A]">
                                <input
                                    type="email"
                                    placeholder="SEU MELHOR E-MAIL"
                                    required
                                    className="w-full px-2 py-4 text-[11px] font-bold tracking-[0.2em] outline-none bg-transparent placeholder:text-gray-300"
                                />
                                <button type="submit" className="whitespace-nowrap px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C6A76A] transition-colors">
                                    Inscrever
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </FadeInSection>

            <Footer />
            <WhatsAppButton />
            <ScrollToTop />

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={handleAddToCart}
                isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
                onToggleWishlist={toggleWishlist}
            />
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ message: '', visible: false })} />
        </div>
    )
}
