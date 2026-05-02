import { supabase } from './supabase.js'

// =============================================
// PRODUCTS
// =============================================

export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
    return { data, error }
}

export async function getProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
    return { data, error }
}

export async function getProductsBySection(section) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('section', section)
        .order('created_at', { ascending: false })
    return { data, error }
}

export async function createProduct(product) {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()
    return { data, error }
}

export async function updateProduct(id, updates) {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    return { data, error }
}

export async function deleteProduct(id) {
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
    return { data, error }
}

export async function searchProducts(query) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false })
    return { data, error }
}

// =============================================
// STORAGE
// =============================================

export async function uploadImage(file) {
    const fileExt = file.name.split('.').pop()
    const filePath = `products/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`

    const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (error) return { url: null, error }

    const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
}

export async function uploadMultipleImages(files) {
    const results = await Promise.all(files.map(f => uploadImage(f)))
    const urls = results.filter(r => r.url).map(r => r.url)
    const errors = results.filter(r => r.error).map(r => r.error)
    return { urls, errors }
}

export async function deleteImage(url) {
    try {
        const pathMatch = url.match(/product-images\/(.+)$/)
        if (!pathMatch) return { error: 'Invalid URL' }
        const filePath = pathMatch[1]
        const { error } = await supabase.storage
            .from('product-images')
            .remove([filePath])
        return { error }
    } catch (e) {
        return { error: e }
    }
}
