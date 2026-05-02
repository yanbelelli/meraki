import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { signIn, signUp, signOut, getUserProfile } from '../services/auth.js'

export default function AuthPage() {
    const { session, user, profile, admin, loading } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState('login')
    const [alert, setAlert] = useState({ message: '', type: '' })
    const [submitting, setSubmitting] = useState(false)

    function showAlert(message, type = 'error') {
        setAlert({ message, type })
    }

    // Input masks
    function maskPhone(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15)
    }

    function maskCpf(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .slice(0, 14)
    }

    // Login handler
    async function handleLogin(e) {
        e.preventDefault()
        setAlert({ message: '', type: '' })
        const email = e.target.loginEmail.value.trim()
        const password = e.target.loginPassword.value

        setSubmitting(true)
        const { error } = await signIn(email, password)
        setSubmitting(false)

        if (error) {
            if (error.message.includes('Invalid login credentials')) showAlert('E-mail ou senha incorretos.')
            else if (error.message.includes('Email not confirmed')) showAlert('Verifique seu e-mail para confirmar sua conta.')
            else showAlert('Erro ao fazer login.')
        } else {
            // Check if user is admin to redirect accordingly
            const userId = data?.user?.id
            if (userId) {
                const { profile: userProfile } = await getUserProfile(userId)
                if (userProfile?.tipo_user === 'admin') {
                    showAlert('Login admin realizado! Redirecionando...', 'success')
                    setTimeout(() => navigate('/admin'), 1000)
                    return
                }
            }
            showAlert('Login realizado com sucesso! Redirecionando...', 'success')
            setTimeout(() => navigate('/'), 1000)
        }
    }

    // Signup handler
    async function handleSignup(e) {
        e.preventDefault()
        setAlert({ message: '', type: '' })
        const name = e.target.signupName.value.trim()
        const phone = e.target.signupPhone.value.trim()
        const cpf = e.target.signupCpf.value.trim()
        const email = e.target.signupEmail.value.trim()
        const password = e.target.signupPassword.value
        const confirm = e.target.signupConfirm.value

        if (password !== confirm) {
            showAlert('As senhas não coincidem.')
            return
        }

        setSubmitting(true)
        const { data, error } = await signUp(email, password, name, phone, cpf)
        setSubmitting(false)

        if (error) {
            if (error.message.includes('already registered')) showAlert('Este e-mail já está cadastrado.')
            else showAlert('Erro ao criar conta: ' + error.message)
        } else if (data.session) {
            showAlert('Conta criada com sucesso! Redirecionando...', 'success')
            setTimeout(() => navigate('/'), 1500)
        } else {
            showAlert('Conta criada! Verifique seu e-mail para confirmar.', 'success')
        }
    }

    // Logout handler
    async function handleLogout() {
        await signOut()
        showAlert('Você saiu da conta.', 'success')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const userName = profile?.full_name || user?.user_metadata?.full_name || 'Usuário'
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] rounded-full" />
            <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(198,167,106,0.06)_0%,transparent_70%)] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 font-heading text-3xl font-bold text-gray-900 hover:text-primary transition-colors tracking-widest">
                        MERAKI
                    </Link>
                    <p className="text-gray-500 mt-2">Sua conta Meraki</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-8 shadow-[0_20px_60px_rgba(28,28,28,0.08)] border border-gray-200/30">
                    {/* Alert */}
                    {alert.message && (
                        <div className={`px-4 py-3 rounded-xl mb-6 text-sm animate-[fadeIn_300ms_ease-out] ${alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            {alert.message}
                        </div>
                    )}

                    {session ? (
                        /* Logged in */
                        <div className="animate-[fadeIn_300ms_ease-out]">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                {initials}
                            </div>
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold">{userName}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                                {profile?.phone && (
                                    <p className="text-gray-400 text-xs mt-1">📱 {profile.phone}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <Link to="/" className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl text-gray-900 hover:bg-white hover:border-gray-200 border border-transparent transition-all">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Ir para a Loja
                                </Link>
                                {admin && (
                                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl text-gray-900 hover:bg-white hover:border-gray-200 border border-transparent transition-all">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Painel Administrativo
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sair da Conta
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Login / Signup */
                        <>
                            <div className="flex bg-background rounded-xl p-1 mb-8">
                                <button onClick={() => { setTab('login'); setAlert({ message: '', type: '' }) }} className={`flex-1 py-3 text-center font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                    Entrar
                                </button>
                                <button onClick={() => { setTab('signup'); setAlert({ message: '', type: '' }) }} className={`flex-1 py-3 text-center font-semibold rounded-lg transition-all ${tab === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                    Criar Conta
                                </button>
                            </div>

                            {tab === 'login' ? (
                                <form onSubmit={handleLogin} className="animate-[fadeIn_300ms_ease-out]">
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">E-mail</label>
                                        <input type="email" name="loginEmail" placeholder="seu@email.com" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Senha</label>
                                        <input type="password" name="loginPassword" placeholder="Sua senha" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Entrar'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleSignup} className="animate-[fadeIn_300ms_ease-out]">
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Nome Completo</label>
                                        <input type="text" name="signupName" placeholder="Seu nome completo" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Telefone</label>
                                            <input type="tel" name="signupPhone" placeholder="(11) 99999-9999" onChange={(e) => { e.target.value = maskPhone(e.target.value) }} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">CPF</label>
                                            <input type="text" name="signupCpf" placeholder="000.000.000-00" onChange={(e) => { e.target.value = maskCpf(e.target.value) }} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                        </div>
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">E-mail</label>
                                        <input type="email" name="signupEmail" placeholder="seu@email.com" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Senha</label>
                                        <input type="password" name="signupPassword" placeholder="Mínimo 6 caracteres" required minLength={6} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Confirmar Senha</label>
                                        <input type="password" name="signupConfirm" placeholder="Confirme sua senha" required minLength={6} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Criar Conta'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                <Link to="/" className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-6 hover:text-primary transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar para a loja
                </Link>
            </div>
        </main>
    )
}
