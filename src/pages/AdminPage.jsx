import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useProducts } from '../hooks/useProducts.js'
import { createProduct, updateProduct, deleteProduct, uploadMultipleImages, deleteImage } from '../services/database.js'
import { signOut } from '../services/auth.js'

export default function AdminPage() {
    const { session, user, admin, loading: authLoading } = useAuth()
    const { products, loading: productsLoading, setProducts } = useProducts()
    const [activeSection, setActiveSection] = useState('dashboard')
    const [searchQuery, setSearchQuery] = useState('')
    const [modal, setModal] = useState({ open: false, editing: null })
    const [deleteModal, setDeleteModal] = useState({ open: false, product: null })
    const [saving, setSaving] = useState(false)

    // Image upload state
    const [imageFiles, setImageFiles] = useState([])       // new files to upload
    const [existingImages, setExistingImages] = useState([]) // already-uploaded URLs
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    // Reset image state when modal opens/closes
    useEffect(() => {
        if (modal.open && modal.editing) {
            const product = products.find(p => p.id === modal.editing)
            const imgs = product?.image || []
            setExistingImages(Array.isArray(imgs) ? imgs : (imgs ? [imgs] : []))
            setImageFiles([])
        } else if (modal.open && !modal.editing) {
            setExistingImages([])
            setImageFiles([])
        }
    }, [modal.open, modal.editing, products])

    // Access control
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session || !admin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Acesso Restrito</h2>
                <p className="text-gray-500">Você precisa ser administrador para acessar esta página.</p>
                <Link to="/auth" className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors">Fazer Login</Link>
            </div>
        )
    }

    const filteredProducts = searchQuery
        ? products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
        : products

    const stats = {
        total: products.length,
        categories: [...new Set(products.map(p => p.category))].length,
        offers: products.filter(p => p.original_price > 0 && p.original_price > p.price).length,
    }

    const sectionLabel = (s) => ({ 'best-sellers': 'Best Sellers', 'featured': 'Destaques', 'new-collection': 'Novas Coleções' }[s] || s)

    // Get the primary display image for a product (handles array or string)
    const getProductImage = (product) => {
        if (Array.isArray(product.image)) return product.image[0] || '/placeholder.jpg'
        return product.image || '/placeholder.jpg'
    }

    // Image handlers
    const handleFileSelect = (files) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
        setImageFiles(prev => [...prev, ...validFiles])
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        handleFileSelect(e.dataTransfer.files)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => setDragActive(false)

    const removeNewFile = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    // Save handler
    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        const form = e.target

        // Upload new images
        let uploadedUrls = []
        if (imageFiles.length > 0) {
            const { urls } = await uploadMultipleImages(imageFiles)
            uploadedUrls = urls
        }

        // Combine existing + newly uploaded, filter empty values
        const allImages = [...existingImages, ...uploadedUrls].filter(Boolean)

        // Parse sizes string into array
        const sizesRaw = form.pSizes.value
        const sizesArray = sizesRaw.includes(',')
            ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean)
            : sizesRaw.split(/\s+/).filter(Boolean)

        const productData = {
            name: form.pName.value,
            category: form.pCategory.value,
            price: parseFloat(form.pPrice.value),
            original_price: parseFloat(form.pOriginalPrice.value) || 0,
            badge: form.pBadge.value,
            section: form.pSection.value,
            sizes: sizesArray,
            image: allImages,
            description: form.pDescription.value,
        }

        if (modal.editing) {
            const { data, error } = await updateProduct(modal.editing, productData)
            if (!error && data) {
                setProducts(prev => prev.map(p => p.id === modal.editing ? data : p))
            }
        } else {
            const { data, error } = await createProduct(productData)
            if (!error && data) {
                setProducts(prev => [data, ...prev])
            }
        }
        setSaving(false)
        setModal({ open: false, editing: null })
    }

    // Delete handler
    async function handleDelete() {
        if (!deleteModal.product) return
        // Also delete images from storage
        const imgs = deleteModal.product.image
        if (Array.isArray(imgs)) {
            await Promise.all(imgs.map(url => deleteImage(url)))
        }
        await deleteProduct(deleteModal.product.id)
        setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id))
        setDeleteModal({ open: false, product: null })
    }

    const editProduct = (product) => setModal({ open: true, editing: product.id })

    const adminName = user?.user_metadata?.full_name || 'Admin'
    const adminInitials = adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 hidden md:flex">
                <div className="p-6 border-b border-gray-100">
                    <Link to="/" className="font-heading text-xl font-bold tracking-widest text-gray-900">MERAKI</Link>
                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full font-semibold">Admin</span>
                </div>
                <nav className="flex-1 p-4 flex flex-col gap-1">
                    <button onClick={() => setActiveSection('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeSection === 'dashboard' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Dashboard
                    </button>
                    <button onClick={() => setActiveSection('products')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeSection === 'products' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Produtos
                    </button>
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Ver Loja
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors w-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                {/* Topbar */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">{activeSection === 'dashboard' ? 'Dashboard' : 'Produtos'}</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 hidden sm:block">{adminName}</span>
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold">{adminInitials}</div>
                    </div>
                </div>

                {/* Dashboard */}
                {activeSection === 'dashboard' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Produtos', value: stats.total, gradient: 'from-primary to-primary-dark' },
                            { label: 'Categorias', value: stats.categories, gradient: 'from-amber-500 to-amber-600' },
                            { label: 'Em Oferta', value: stats.offers, gradient: 'from-green-600 to-green-700' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-gray-900">{productsLoading ? '...' : stat.value}</span>
                                    <span className="block text-sm text-gray-500">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Products */}
                {activeSection === 'products' && (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar produtos..."
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                            />
                            <button onClick={() => setModal({ open: true, editing: null })} className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors whitespace-nowrap">
                                + Novo Produto
                            </button>
                        </div>

                        {productsLoading ? (
                            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Imagem</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Nome</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Categoria</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Preço</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Seção</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredProducts.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                                            <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                                                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                                                    <td className="px-4 py-3 text-gray-900 font-medium">R$ {p.price?.toFixed(2)}</td>
                                                    <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-primary px-2 py-1 rounded-full">{sectionLabel(p.section)}</span></td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => editProduct(p)} className="text-primary hover:text-primary-dark transition-colors text-xs font-semibold">Editar</button>
                                                            <button onClick={() => setDeleteModal({ open: true, product: p })} className="text-red-500 hover:text-red-700 transition-colors text-xs font-semibold">Excluir</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-12">Nenhum produto encontrado.</p>
                        )}
                    </>
                )}
            </main>

            {/* Product Modal */}
            {modal.open && (() => {
                const editingProduct = modal.editing ? products.find(p => p.id === modal.editing) : null
                return (
                    <>
                        <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setModal({ open: false, editing: null })} />
                        <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold">{modal.editing ? 'Editar Produto' : 'Novo Produto'}</h2>
                                <button onClick={() => setModal({ open: false, editing: null })} className="p-1 hover:bg-gray-100 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <form onSubmit={handleSave} className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nome</label><input type="text" name="pName" required defaultValue={editingProduct?.name || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" /></div>
                                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
                                        <select name="pCategory" defaultValue={editingProduct?.category || 'Conjuntos'} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary">
                                            <option>Conjuntos</option><option>Linha Noite</option><option>Linha Sexy</option><option>Plus Size</option><option>Fitness</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$)</label><input type="number" name="pPrice" step="0.01" min="0" required defaultValue={editingProduct?.price || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" /></div>
                                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Preço Original (R$)</label><input type="number" name="pOriginalPrice" step="0.01" min="0" defaultValue={editingProduct?.original_price || '0'} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Badge</label><input type="text" name="pBadge" placeholder="Ex: NEW, 15% OFF" defaultValue={editingProduct?.badge || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" /></div>
                                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Seção</label>
                                        <select name="pSection" defaultValue={editingProduct?.section || 'best-sellers'} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary">
                                            <option value="best-sellers">Best Sellers</option><option value="featured">Destaques</option><option value="new-collection">Novas Coleções</option>
                                        </select>
                                    </div>
                                </div>
                                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tamanhos</label><input type="text" name="pSizes" defaultValue={editingProduct?.sizes || 'P, M, G, GG'} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" /></div>

                                {/* Image Upload Section */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">Imagens do Produto</label>

                                    {/* Existing image previews */}
                                    {existingImages.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mb-3">
                                            {existingImages.map((url, i) => (
                                                <div key={`existing-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                                                    <img src={url} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(i)}
                                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                    {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-[8px] px-1 rounded font-bold">CAPA</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New file previews */}
                                    {imageFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mb-3">
                                            {imageFiles.map((file, i) => (
                                                <div key={`new-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-primary/30 group">
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewFile(i)}
                                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                    <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[8px] px-1 rounded font-bold">NOVO</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Drop zone */}
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                            }`}
                                    >
                                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {dragActive ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP até 5MB</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => handleFileSelect(e.target.files)}
                                        />
                                    </div>
                                </div>

                                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label><textarea name="pDescription" rows={3} defaultValue={editingProduct?.description || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary resize-none" /></div>
                                <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
                                    <button type="button" onClick={() => setModal({ open: false, editing: null })} className="px-5 py-2.5 border border-gray-300 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">Cancelar</button>
                                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60">
                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Enviando...
                                            </span>
                                        ) : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )
            })()}

            {/* Delete Modal */}
            {deleteModal.open && (
                <>
                    <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setDeleteModal({ open: false, product: null })} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <h2 className="text-lg font-bold mb-2">Excluir Produto</h2>
                        <p className="text-gray-600 text-sm mb-6">Tem certeza que deseja excluir <strong>{deleteModal.product?.name}</strong>? Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteModal({ open: false, product: null })} className="px-5 py-2 border border-gray-300 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">Cancelar</button>
                            <button onClick={handleDelete} className="px-5 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">Excluir</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
