export default function Footer() {
    return (
        <footer className="bg-text text-white/80 pt-16 pb-8 border-t-[6px] border-primary">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <h3 className="font-heading text-xl font-bold text-white mb-4">Meraki</h3>
                        <p className="text-sm leading-relaxed mb-6">
                            Moda íntima feminina com elegância e sofisticação. Qualidade premium para mulheres que valorizam estilo.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                                    <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" />
                                    <circle cx="18.406" cy="5.594" r="1.44" />
                                </svg>
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap">
                            {['Visa', 'MC', 'Elo', 'Pix', 'Boleto'].map(p => (
                                <span key={p} className="text-xs bg-white/10 rounded px-2 py-1">{p}</span>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4">Categorias</h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Conjuntos</a>
                            <a href="#" className="hover:text-white transition-colors">Linha Noite</a>
                            <a href="#" className="hover:text-white transition-colors">Linha Sexy</a>
                            <a href="#" className="hover:text-white transition-colors">Plus Size</a>
                            <a href="#" className="hover:text-white transition-colors">Fitness</a>
                        </div>
                    </div>

                    {/* Institutional */}
                    <div>
                        <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4">Institucional</h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Sobre Nós</a>
                            <a href="#" className="hover:text-white transition-colors">Seja Revendedora</a>
                            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
                            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                            <a href="#" className="hover:text-white transition-colors">Trocas e Devoluções</a>
                        </div>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4">Atendimento</h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Central de Ajuda</a>
                            <a href="#" className="hover:text-white transition-colors">Entrega e Frete</a>
                            <a href="#" className="hover:text-white transition-colors">Formas de Pagamento</a>
                            <a href="#" className="hover:text-white transition-colors">Contato</a>
                            <a href="#" className="hover:text-white transition-colors">FAQ</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                    <p>© 2026 Meraki - Todos os direitos reservados. Desenvolvido com ❤️</p>
                </div>
            </div>
        </footer>
    )
}
