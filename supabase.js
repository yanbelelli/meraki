// ============================================
// MERAKI STORE - SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = 'https://rivbistxxyzgniartzbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpdmJpc3R4eHl6Z25pYXJ0emJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDg1NDgsImV4cCI6MjA3NjI4NDU0OH0.sAEyQpK0PmdFGBvzujly5YD2-WjtFHJ9_Q9qw9FeKYc';

// Initialize Supabase client
let supabase;
try {
    if (typeof window.supabase === 'undefined') {
        throw new Error('Script do Supabase CDN não foi carregado corretamente na página.');
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Client Initialized");
} catch (e) {
    console.error("❌ Erro ao inicializar o Supabase Cliente:", e.message);
}

// === AUTH HELPERS ===
const Auth = {
    // Sign up with email and password
    async signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'customer'
                }
            }
        });
        return { data, error };
    },

    // Sign in with email and password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    },

    // Get current user
    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },

    // Check if user is admin
    async isAdmin() {
        const { user } = await this.getUser();
        if (!user) return false;
        // Check user metadata for admin role
        return user.user_metadata?.role === 'admin';
    },

    // Listen for auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

// === DATABASE HELPERS ===
const DB = {
    // Products
    products: {
        async getAll() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            return { data, error };
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();
            return { data, error };
        },

        async getBySection(section) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('section', section)
                .order('created_at', { ascending: false });
            return { data, error };
        },

        async create(product) {
            const { data, error } = await supabase
                .from('products')
                .insert([product])
                .select()
                .single();
            return { data, error };
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        async delete(id) {
            const { data, error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);
            return { data, error };
        },

        async search(query) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
                .order('created_at', { ascending: false });
            return { data, error };
        }
    },

    // Upload product image
    async uploadImage(file, fileName) {
        const fileExt = file.name.split('.').pop();
        const filePath = `products/${fileName || Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) return { url: null, error };

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return { url: publicUrl, error: null };
    }
};

// === UI HELPERS ===
function updateAuthUI() {
    Auth.getSession().then(({ session }) => {
        const userBtn = document.getElementById('userBtn');
        const adminBtn = document.getElementById('adminLinkBtn');

        if (session) {
            if (userBtn) {
                userBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'auth.html';
                };
                // Change icon to filled user
                userBtn.innerHTML = `
            <svg fill="currentColor" stroke="none" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
                `;
            }

            // Check if admin and show admin button
            if (adminBtn) {
                Auth.isAdmin().then(isAdmin => {
                    if (isAdmin) {
                        adminBtn.style.display = 'flex';
                    }
                });
            }
        } else {
            if (userBtn) {
                userBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'auth.html';
                };
            }
        }
    });
}

// Export for use in other files
try {
    window.MerakiAuth = Auth;
    window.MerakiDB = DB;
    window.MerakiSupabase = supabase;
    console.log("✅ Supabase Module Loaded Successfully");
} catch (e) {
    console.error("❌ Erro ao exportar módulos do Supabase:", e);
}
