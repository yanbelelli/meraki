// ============================================
// MERAKI STORE - MAIN APPLICATION LOGIC
// ============================================

// === STATE MANAGEMENT ===
const state = {
  cart: [],
  wishlist: [],
  products: [],
  currentSlide: 0,
  heroInterval: null,
  currentModalProduct: null,
  selectedModalSize: null
};

// === PRODUCT DATA ===
let products = [];

state.products = products;

// === UTILITY FUNCTIONS ===
function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

function calculateInstallment(price) {
  return (price / 12).toFixed(2).replace('.', ',');
}

function createStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = '';

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }

  if (hasHalfStar) {
    starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill-opacity="0.5"/></svg>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }

  return starsHTML;
}

// === PRODUCT RENDERING ===
function createProductCard(product) {
  const badgeClass = product.badge === 'NEW' ? 'new' : '';
  const installment = calculateInstallment(product.price);

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
        <span class="product-badge ${badgeClass}">${product.badge}</span>
        <div class="product-actions">
          <button class="action-btn wishlist-btn" data-product-id="${product.id}" aria-label="Adicionar aos favoritos">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button class="action-btn quick-view-btn" data-product-id="${product.id}" aria-label="Ver detalhes">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
        <button class="product-add-cart" data-product-id="${product.id}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          Adicionar ao Carrinho
        </button>
      </div>
      
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        
        <div class="product-rating">
          <div class="stars">${createStars(product.rating)}</div>
          <span class="rating-count">(${product.reviews})</span>
        </div>
        
        <div class="product-price">
          ${product.originalPrice > 0 ? `<span class="price-original">R$ ${formatPrice(product.originalPrice)}</span>` : ''}
          <span class="price-current">R$ ${formatPrice(product.price)}</span>
        </div>
        
        <p class="price-installment">ou 12x de R$ ${installment}</p>
        
        <div class="product-sizes">
          ${product.sizes.map(size => `<button class="size-btn" data-size="${size}">${size}</button>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const sections = {
    'best-sellers': document.getElementById('bestSellersGrid'),
    'featured': document.getElementById('featuredGrid'),
    'new-collection': document.getElementById('newCollectionGrid')
  };

  products.forEach(product => {
    const container = sections[product.section];
    if (container) {
      container.innerHTML += createProductCard(product);
    }
  });

  // Add event listeners
  attachProductEventListeners();
}

// === EVENT LISTENERS ===
function attachProductEventListeners() {
  // Wishlist buttons
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = parseInt(btn.dataset.productId);
      toggleWishlist(productId);
    });
  });

  // Size selection
  document.querySelectorAll('.product-card .size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Add to cart with selected size
      const productId = parseInt(card.dataset.productId);
      const size = btn.dataset.size;
      addToCart(productId, size);
    });
  });

  // Quick view
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = parseInt(btn.dataset.productId);
      showQuickView(productId);
    });
  });

  // Add to cart buttons (slide-up)
  document.querySelectorAll('.product-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = parseInt(btn.dataset.productId);
      // Open quick view so user can select a size
      showQuickView(productId);
    });
  });
}

// === CART MANAGEMENT ===
function addToCart(productId, size) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const cartItem = {
    ...product,
    selectedSize: size,
    quantity: 1
  };

  const existingItem = state.cart.find(item => item.id === productId && item.selectedSize === size);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    state.cart.push(cartItem);
  }

  updateCartCount();
  showNotification(`${product.name} (${size}) adicionado ao carrinho!`);

  // Badge bump animation
  const badge = document.getElementById('cartCount');
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

function updateCartCount() {
  const count = state.cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
}

// === WISHLIST MANAGEMENT ===
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);

  if (index > -1) {
    state.wishlist.splice(index, 1);
    showNotification('Removido dos favoritos');
  } else {
    state.wishlist.push(productId);
    showNotification('Adicionado aos favoritos! ❤️');
  }

  updateWishlistCount();
  updateWishlistUI();

  // Badge bump animation
  const badge = document.getElementById('wishlistCount');
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

function updateWishlistCount() {
  document.getElementById('wishlistCount').textContent = state.wishlist.length;
}

function updateWishlistUI() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const productId = parseInt(btn.dataset.productId);
    if (state.wishlist.includes(productId)) {
      btn.classList.add('active');
      btn.innerHTML = `
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      `;
    } else {
      btn.classList.remove('active');
      btn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      `;
    }
  });
}

// === HERO CAROUSEL ===
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    dots[index].classList.add('active');
    state.currentSlide = index;
  }

  function nextSlide() {
    const nextIndex = (state.currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      resetAutoplay();
    });
  });

  // Auto-play
  function startAutoplay() {
    state.heroInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoplay() {
    clearInterval(state.heroInterval);
    startAutoplay();
  }

  startAutoplay();

  // Pause on hover
  const hero = document.getElementById('heroBanner');
  hero.addEventListener('mouseenter', () => clearInterval(state.heroInterval));
  hero.addEventListener('mouseleave', startAutoplay);
}

// === MOBILE MENU ===
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  // Close menu on link click (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });
}

// === NAVIGATION ===
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// === SEARCH OVERLAY ===
function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');

  function openSearch() {
    searchOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
    setTimeout(() => searchInput.focus(), 300);
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    searchInput.value = '';
  }

  searchBtn.addEventListener('click', openSearch);
  searchCloseBtn.addEventListener('click', closeSearch);

  // Close on overlay click (not on content)
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      closeSearch();
    }
  });

  // Suggestion tags
  document.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      searchInput.value = tag.textContent;
      searchInput.focus();
    });
  });
}

// === QUICK VIEW MODAL ===
function initQuickViewModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('quickViewModal');
  const modalClose = document.getElementById('modalClose');

  function closeModal() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
    state.currentModalProduct = null;
    state.selectedModalSize = null;
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Modal add to cart
  document.getElementById('modalAddToCart').addEventListener('click', () => {
    if (!state.currentModalProduct) return;
    if (!state.selectedModalSize) {
      showNotification('Por favor, selecione um tamanho');
      return;
    }
    addToCart(state.currentModalProduct.id, state.selectedModalSize);
    closeModal();
  });

  // Modal wishlist
  document.getElementById('modalWishlistBtn').addEventListener('click', () => {
    if (!state.currentModalProduct) return;
    toggleWishlist(state.currentModalProduct.id);
    updateModalWishlistButton();
  });
}

function showQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  state.currentModalProduct = product;
  state.selectedModalSize = null;

  // Populate modal
  document.getElementById('modalProductImage').src = product.image;
  document.getElementById('modalProductImage').alt = product.name;
  document.getElementById('modalProductCategory').textContent = product.category;
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductDescription').textContent = product.description || 'Peça confeccionada com tecidos de alta qualidade, proporcionando conforto e elegância.';

  // Rating
  const ratingContainer = document.getElementById('modalProductRating');
  ratingContainer.innerHTML = `
    <div class="stars">${createStars(product.rating)}</div>
    <span class="rating-count">(${product.reviews} avaliações)</span>
  `;

  // Price
  const priceContainer = document.getElementById('modalProductPrice');
  priceContainer.innerHTML = `
    ${product.originalPrice > 0 ? `<span class="price-original">R$ ${formatPrice(product.originalPrice)}</span>` : ''}
    <span class="price-current">R$ ${formatPrice(product.price)}</span>
  `;

  // Installment
  document.getElementById('modalProductInstallment').textContent = `ou 12x de R$ ${calculateInstallment(product.price)}`;

  // Sizes
  const sizesContainer = document.getElementById('modalProductSizes');
  sizesContainer.innerHTML = product.sizes.map(size => `
    <button class="size-btn modal-size-btn" data-size="${size}">${size}</button>
  `).join('');

  // Size selection handlers
  sizesContainer.querySelectorAll('.modal-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sizesContainer.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedModalSize = btn.dataset.size;
    });
  });

  // Update wishlist button state
  updateModalWishlistButton();

  // Show modal
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('quickViewModal').classList.add('active');
  document.body.classList.add('no-scroll');
}

function updateModalWishlistButton() {
  if (!state.currentModalProduct) return;
  const btn = document.getElementById('modalWishlistBtn');
  const isWishlisted = state.wishlist.includes(state.currentModalProduct.id);

  if (isWishlisted) {
    btn.innerHTML = `
      <svg fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    `;
    btn.style.borderColor = 'var(--wine-rose)';
    btn.style.color = 'var(--wine-rose)';
  } else {
    btn.innerHTML = `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    `;
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

// === HEADER SCROLL EFFECT ===
function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    lastScroll = scrollY;
  }, { passive: true });
}

// === SCROLL TO TOP ===
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// === NOTIFICATIONS ===
function showNotification(message) {
  // Remove existing notification if any
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = 'notification-toast';
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #7A3E4A 0%, #5A2E34 100%);
    color: white;
    padding: 16px 28px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(122, 62, 74, 0.35);
    z-index: 9999;
    animation: slideInNotification 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    font-weight: 500;
    font-size: 14px;
    max-width: 320px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutNotification 0.3s ease-out forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// === SCROLL ANIMATIONS ===
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add stagger delay for grid items
        const card = entry.target;
        const parent = card.parentElement;
        if (parent && card.classList.contains('product-card')) {
          const cards = Array.from(parent.querySelectorAll('.product-card'));
          const index = cards.indexOf(card);
          card.style.animationDelay = `${index * 100}ms`;
        }
        card.classList.add('animate-in');
        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe product cards
  document.querySelectorAll('.product-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

  // Observe section headers
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        headerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.section-header').forEach(el => {
    headerObserver.observe(el);
  });

  // Observe category cards
  const catObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = document.querySelectorAll('.category-card');
        cards.forEach((card, index) => {
          card.style.animationDelay = `${index * 100}ms`;
          card.classList.add('animate-scale-in');
        });
        catObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const categoriesSection = document.getElementById('categoriesSection');
  if (categoriesSection) {
    catObserver.observe(categoriesSection);
  }
}

// === NEWSLETTER ===
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    if (input.value) {
      showNotification('Cadastro realizado com sucesso! 🎉');
      input.value = '';
    }
  });
}

// === INITIALIZATION ===
async function init() {
  console.log('🌸 Meraki Store - Inicializando...');

  // Load products from Supabase
  try {
    if (window.MerakiDB) {
      const dbResponse = await window.MerakiDB.products.getAll();
      if (dbResponse && dbResponse.data && dbResponse.data.length > 0) {
        products = dbResponse.data.map(p => ({
          ...p,
          originalPrice: p.original_price,
          price: parseFloat(p.price)
        }));
        state.products = products;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar os produtos banco de dados:', error);
  }

  // Render products
  renderProducts();

  // Initialize components
  initHeroCarousel();
  initMobileMenu();
  initNavigation();
  initSearch();
  initQuickViewModal();
  initHeaderScroll();
  initScrollToTop();
  initScrollAnimations();
  initNewsletter();

  // Set initial counts
  updateCartCount();
  updateWishlistCount();

  console.log('✅ Meraki Store - Pronto!');
}

// Start application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInNotification {
    from {
      opacity: 0;
      transform: translateX(100px) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  
  @keyframes slideOutNotification {
    from {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateX(100px) scale(0.8);
    }
  }

  .product-card.animate-in {
    opacity: 1 !important;
    animation: fadeInUp 600ms ease-out both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
