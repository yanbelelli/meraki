// ============================================
// MERAKI ADMIN - APPLICATION LOGIC
// ============================================

let allProducts = [];
let editingProductId = null;
let deletingProductId = null;

// === ACCESS CONTROL ===
async function checkAccess() {
    const { session } = await MerakiAuth.getSession();
    if (!session) {
        document.getElementById('accessDenied').style.display = 'flex';
        document.getElementById('adminSidebar').style.display = 'none';
        document.querySelector('.admin-topbar').style.display = 'none';
        return false;
    }
    const user = session.user;
    const name = user.user_metadata?.full_name || user.email;
    document.getElementById('adminName').textContent = name;
    document.getElementById('adminAvatar').textContent = name.charAt(0).toUpperCase();
    return true;
}

// === NAVIGATION ===
function initNavigation() {
    document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.getElementById('section' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
            document.getElementById('pageTitle').textContent = link.textContent.trim();
            // Close mobile sidebar
            document.getElementById('adminSidebar').classList.remove('open');
        });
    });

    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('adminSidebar').classList.toggle('open');
    });

    document.getElementById('adminLogout').addEventListener('click', async () => {
        await MerakiAuth.signOut();
        window.location.href = 'auth.html';
    });
}

// === LOAD PRODUCTS ===
async function loadProducts() {
    const { data, error } = await MerakiDB.products.getAll();
    if (error) {
        console.error('Error loading products:', error);
        // Fallback: use local products if table doesn't exist yet
        allProducts = [];
        renderProducts([]);
        updateStats([]);
        return;
    }
    allProducts = data || [];
    renderProducts(allProducts);
    updateStats(allProducts);
}

function updateStats(products) {
    document.getElementById('statProducts').textContent = products.length;
    const categories = [...new Set(products.map(p => p.category))];
    document.getElementById('statCategories').textContent = categories.length;
    const offers = products.filter(p => p.original_price && p.original_price > 0);
    document.getElementById('statOffers').textContent = offers.length;
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    const empty = document.getElementById('emptyProducts');

    if (!products.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = products.map(p => `
    <tr data-id="${p.id}">
      <td><img class="table-img" src="${p.image || 'assets/images/product-1.jpg'}" alt="${p.name}"></td>
      <td><strong>${p.name}</strong></td>
      <td><span class="table-badge">${p.category}</span></td>
      <td>R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}</td>
      <td>${sectionLabel(p.section)}</td>
      <td><div class="table-actions">
        <button class="table-btn edit-btn" data-id="${p.id}" title="Editar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button class="table-btn delete delete-btn" data-id="${p.id}" data-name="${p.name}" title="Excluir">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div></td>
    </tr>
  `).join('');

    // Attach edit/delete handlers
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditProduct(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteConfirm(btn.dataset.id, btn.dataset.name));
    });
}

function sectionLabel(s) {
    const map = { 'best-sellers': 'Best Sellers', 'featured': 'Destaques', 'new-collection': 'Novas Coleções' };
    return map[s] || s || '—';
}

// === SEARCH ===
function initSearch() {
    document.getElementById('productSearch').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
        );
        renderProducts(filtered);
    });
}

// === PRODUCT MODAL ===
function initProductModal() {
    const overlay = document.getElementById('productModalOverlay');
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');

    function openModal() { overlay.classList.add('active'); modal.classList.add('active'); document.body.classList.add('no-scroll'); }
    function closeModal() { overlay.classList.remove('active'); modal.classList.remove('active'); document.body.classList.remove('no-scroll'); form.reset(); editingProductId = null; document.getElementById('pId').value = ''; }

    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productModalTitle').textContent = 'Novo Produto';
        editingProductId = null;
        form.reset();
        openModal();
    });

    document.getElementById('productModalClose').addEventListener('click', closeModal);
    document.getElementById('cancelProduct').addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('saveProduct');
        saveBtn.querySelector('.btn-text').style.display = 'none';
        saveBtn.querySelector('.spinner').style.display = 'block';
        saveBtn.disabled = true;

        const productData = {
            name: document.getElementById('pName').value.trim(),
            category: document.getElementById('pCategory').value,
            price: parseFloat(document.getElementById('pPrice').value),
            original_price: parseFloat(document.getElementById('pOriginalPrice').value) || 0,
            badge: document.getElementById('pBadge').value.trim() || 'NEW',
            section: document.getElementById('pSection').value,
            sizes: document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean),
            image: document.getElementById('pImage').value.trim() || 'assets/images/product-1.jpg',
            description: document.getElementById('pDescription').value.trim(),
            rating: 4.5,
            reviews: 0
        };

        let result;
        if (editingProductId) {
            result = await MerakiDB.products.update(editingProductId, productData);
        } else {
            result = await MerakiDB.products.create(productData);
        }

        saveBtn.querySelector('.btn-text').style.display = '';
        saveBtn.querySelector('.spinner').style.display = 'none';
        saveBtn.disabled = false;

        if (result.error) {
            alert('Erro: ' + result.error.message);
        } else {
            closeModal();
            await loadProducts();
        }
    });
}

function openEditProduct(id) {
    const p = allProducts.find(prod => String(prod.id) === String(id));
    if (!p) return;
    editingProductId = id;
    document.getElementById('productModalTitle').textContent = 'Editar Produto';
    document.getElementById('pId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pOriginalPrice').value = p.original_price || 0;
    document.getElementById('pBadge').value = p.badge || '';
    document.getElementById('pSection').value = p.section || 'best-sellers';
    document.getElementById('pSizes').value = (p.sizes || []).join(', ');
    document.getElementById('pImage').value = p.image || '';
    document.getElementById('pDescription').value = p.description || '';
    document.getElementById('productModalOverlay').classList.add('active');
    document.getElementById('productModal').classList.add('active');
    document.body.classList.add('no-scroll');
}

// === DELETE ===
function initDeleteModal() {
    const overlay = document.getElementById('deleteOverlay');
    const modal = document.getElementById('deleteModal');

    function closeDelete() { overlay.classList.remove('active'); modal.classList.remove('active'); document.body.classList.remove('no-scroll'); deletingProductId = null; }

    document.getElementById('deleteModalClose').addEventListener('click', closeDelete);
    document.getElementById('cancelDelete').addEventListener('click', closeDelete);
    overlay.addEventListener('click', closeDelete);

    document.getElementById('confirmDelete').addEventListener('click', async () => {
        if (!deletingProductId) return;
        const { error } = await MerakiDB.products.delete(deletingProductId);
        if (error) { alert('Erro ao excluir: ' + error.message); }
        closeDelete();
        await loadProducts();
    });
}

function openDeleteConfirm(id, name) {
    deletingProductId = id;
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('deleteOverlay').classList.add('active');
    document.getElementById('deleteModal').classList.add('active');
    document.body.classList.add('no-scroll');
}

// === INIT ===
(async () => {
    const hasAccess = await checkAccess();
    if (!hasAccess) return;
    initNavigation();
    initSearch();
    initProductModal();
    initDeleteModal();
    await loadProducts();
})();
