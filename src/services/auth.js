import { supabase } from './supabase.js'

export async function signUp(email, password, fullName, phone = '', cpf = '') {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: 'customer',
            },
        },
    })

    // After successful signup, upsert extra profile fields
    if (!error && data?.user) {
        await supabase.from('user_profile').upsert({
            id: data.user.id,
            full_name: fullName,
            phone: phone || null,
            cpf: cpf || null,
        }, { onConflict: 'id' })
    }

    return { data, error }
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
}

export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .single()
    return { profile: data, error }
}

export async function updateUserProfile(userId, updates) {
    const { data, error } = await supabase
        .from('user_profile')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
    return { profile: data, error }
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })
}

