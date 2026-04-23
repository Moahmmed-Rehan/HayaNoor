/* =====================================================
   Haya & Noor — shared.js
   Works on ALL pages: index, products, accessories,
   new-in, wishlist, about, account, contact, etc.
   ===================================================== */

// ===== State (loaded from localStorage) =====
let cart = JSON.parse(localStorage.getItem('hayaCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('hayaWishlist')) || [];

// ===== Save helpers =====
function saveCart() {
  localStorage.setItem('hayaCart', JSON.stringify(cart));
}

function saveWishlist() {
  localStorage.setItem('hayaWishlist', JSON.stringify(wishlist));
}

// ===== Toast =====
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== Cart: Add =====
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id && (item.color || 'Default') === (product.color || 'Default'));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartDisplay();
  showToast(product.name + ' added to cart ✓');
}

// ===== Cart: Remove =====
function removeFromCart(id, color) {
  color = color || 'Default';
  cart = cart.filter(item => !(item.id === id && (item.color || 'Default') === color));
  saveCart();
  updateCartDisplay();
  showToast('Item removed from cart');
}

// ===== Cart: Change Qty =====
function changeQuantity(id, color, change) {
  color = color || 'Default';
  const item = cart.find(p => p.id === id && (p.color || 'Default') === color);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(p => !(p.id === id && (p.color || 'Default') === color));
  }
  saveCart();
  updateCartDisplay();
}

// ===== Cart: Update Display =====
function updateCartDisplay() {
  const cartItems  = document.getElementById('cartItems');
  const cartBadge  = document.getElementById('cartBadge');
  const cartCount  = document.getElementById('cartCount');
  const cartTotal  = document.getElementById('cartTotal');

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
  if (cartCount) cartCount.textContent = `(${totalItems})`;
  if (cartTotal) cartTotal.textContent = `£${totalPrice.toFixed(2)}`;

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">Your cart is empty</p>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        ${item.color && item.color !== 'Default' ? `<p class="cart-item-color">Colour: ${item.color}</p>` : ''}
        <p class="cart-item-price">£${item.price.toFixed(2)}</p>
        <div class="qty-controls">
          <button onclick="changeQuantity(${item.id}, '${item.color || 'Default'}', -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, '${item.color || 'Default'}', 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.color || 'Default'}')">×</button>
    </div>
  `).join('');
}

// ===== Cart: Drawer =====
function setupCartDrawer() {
  const cartToggle     = document.getElementById('cartToggle');
  const cartDrawer     = document.getElementById('cartDrawer');
  const cartOverlay    = document.getElementById('cartOverlay');
  const cartClose      = document.getElementById('cartClose');
  const continueShopping = document.getElementById('continueShopping');
  const checkoutBtn    = document.getElementById('checkoutBtn');

  function openCart() {
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartToggle?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  continueShopping?.addEventListener('click', closeCart);
  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
    } else {
      window.location.href = 'checkout.html';
    }
  });
}

// ===== Wishlist: Toggle =====
function toggleWishlist(productId, productName, productPrice, productImage) {
  const idx = wishlist.findIndex(i => i.id === productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast(productName + ' removed from wishlist');
  } else {
    wishlist.push({ id: productId, name: productName, price: productPrice, image: productImage });
    showToast(productName + ' saved to wishlist ♡');
  }
  saveWishlist();
  updateWishlistBadge();
  syncAllWishlistButtons();
  // If we're on the wishlist page, re-render
  if (document.getElementById('wishlistGrid')) renderWishlistPage();
}

// ===== Wishlist: Badge =====
function updateWishlistBadge() {
  const badge = document.getElementById('wishlistBadge');
  if (!badge) return;
  badge.textContent = wishlist.length;
  badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
}

// ===== Wishlist: Sync all heart buttons =====
function syncAllWishlistButtons() {
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    const id = parseInt(btn.dataset.wishlistId);
    const active = wishlist.some(i => i.id === id);
    btn.classList.toggle('wishlist-active', active);
    // update SVG fill
    const path = btn.querySelector('path');
    if (path) path.setAttribute('fill', active ? '#c9a96e' : 'none');
  });
}

// ===== Wishlist: Render wishlist page =====
function renderWishlistPage() {
  const grid = document.getElementById('wishlistGrid');
  if (!grid) return;

  const countEl = document.getElementById('wishlistCountDisplay');
  if (countEl) countEl.textContent = wishlist.length > 0 ? `(${wishlist.length})` : '';

  if (wishlist.length === 0) {
    grid.innerHTML = `
      <div class="empty-wishlist" style="grid-column:1/-1;text-align:center;padding:80px 20px;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1" style="margin:0 auto 20px;display:block"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:400;margin-bottom:12px;">Your wishlist is empty</h3>
        <p style="color:#888;font-size:15px;margin-bottom:28px;">Save pieces you love and come back to them anytime.</p>
        <a href="products.html" style="display:inline-block;padding:14px 28px;background:#0d0d0d;color:white;font-size:12px;text-transform:uppercase;letter-spacing:1px;text-decoration:none;transition:all .3s;">Browse the Collection</a>
      </div>`;
    return;
  }

  grid.innerHTML = wishlist.map(item => `
    <article class="product-card" style="background:white;transition:transform .3s,box-shadow .3s;position:relative;">
      <div style="aspect-ratio:3/4;overflow:hidden;background:#f0ebe2;">
        <img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="padding:16px;">
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:6px;">${item.name}</h3>
        <p style="font-size:13px;color:#888;margin-bottom:14px;">Elegant luxury modestwear from Haya & Noor.</p>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #eee;padding-top:14px;gap:10px;">
          <span style="font-family:'Cormorant Garamond',serif;font-size:22px;">£${item.price.toFixed(2)}</span>
          <button onclick="addToCart({id:${item.id},name:'${item.name.replace(/'/g,"\\'")}',price:${item.price},image:'${item.image}'})"
            style="background:#0d0d0d;color:white;padding:10px 14px;font-size:11px;text-transform:uppercase;letter-spacing:1px;border:none;cursor:pointer;font-family:'Jost',sans-serif;transition:all .3s;"
            onmouseover="this.style.background='#c9a96e';this.style.color='#0d0d0d'"
            onmouseout="this.style.background='#0d0d0d';this.style.color='white'">
            Add to Cart
          </button>
        </div>
        <button onclick="toggleWishlist(${item.id},'${item.name.replace(/'/g,"\\'")}',${item.price},'${item.image}')"
          style="margin-top:10px;width:100%;padding:9px;background:none;border:1px solid #eee;font-size:12px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;color:#888;font-family:'Jost',sans-serif;transition:all .3s;"
          onmouseover="this.style.borderColor='#ef4444';this.style.color='#ef4444'"
          onmouseout="this.style.borderColor='#eee';this.style.color='#888'">
          Remove
        </button>
      </div>
    </article>
  `).join('');
}

// ===== Generic "Add to Cart" button setup =====
// Works for cards with data-id, data-price and an img + h3
function setupGenericCartButtons() {
  // featured-cart-btn (index page)
  document.querySelectorAll('.featured-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-id]');
      if (!card) return;
      addToCart({
        id: parseInt(card.dataset.id),
        name: card.querySelector('h3').textContent.trim(),
        price: parseFloat(card.dataset.price),
        image: card.querySelector('img').src
      });
    });
  });

  // product-cart-btn (products page, new-in page, accessories page)
  document.querySelectorAll('.product-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-id]');
      if (!card) return;
      // Check for active colour button
      const colorBtn = card.querySelector('.color-btn.active');
      addToCart({
        id: parseInt(card.dataset.id),
        name: (card.querySelector('.product-name') || card.querySelector('h3')).textContent.trim(),
        price: parseFloat(card.dataset.price),
        image: card.querySelector('img').src,
        color: colorBtn ? colorBtn.dataset.color : 'Default'
      });
    });
  });

  // newin-cart-btn (new-in page custom button class)
  document.querySelectorAll('.newin-cart-btn').forEach(btn => {
    // Only attach if it's an "Add to Cart" (not "Notify Me")
    if (btn.getAttribute('onclick')) return; // already has inline handler, skip
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-id]');
      if (!card) return;
      addToCart({
        id: parseInt(card.dataset.id),
        name: card.querySelector('h3').textContent.trim(),
        price: parseFloat(card.dataset.price),
        image: card.querySelector('img').src
      });
    });
  });

  // add-to-cart-btn (products-script style)
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-id]');
      if (!card) return;
      const colorBtn = card.querySelector('.color-btn.active');
      addToCart({
        id: parseInt(card.dataset.id),
        name: (card.querySelector('.product-name') || card.querySelector('h3')).textContent.trim(),
        price: parseFloat(card.dataset.price),
        image: card.querySelector('img').src,
        color: colorBtn ? colorBtn.dataset.color : 'Default'
      });
    });
  });
}

// ===== Generic Wishlist button setup =====
function setupGenericWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    // Skip if already has a data-wishlist-id (already set up)
    if (btn.dataset.wishlistId) return;
    const card = btn.closest('[data-id]');
    if (!card) return;

    const id    = parseInt(card.dataset.id);
    const name  = (card.querySelector('.product-name') || card.querySelector('h3'))?.textContent.trim() || '';
    const price = parseFloat(card.dataset.price);
    const image = card.querySelector('img')?.src || '';

    btn.dataset.wishlistId = id;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(id, name, price, image);
    });
  });

  syncAllWishlistButtons();
}

// ===== Colour Buttons (products page) =====
function setupColorButtons() {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const img  = card?.querySelector('img');
      const newSrc = btn.dataset.image;

      btn.closest('.color-options, .colors')?.querySelectorAll('.color-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (img && newSrc) img.src = newSrc;
    });
  });
}

// ===== Filter pills (generic — works on any page) =====
function setupFilterPills() {
  document.querySelectorAll('.filter-pills .pill, .featured-filter-btn, .product-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.filter-pills, .featured-filters, .products-toolbar, .filter-tabs');
      group?.querySelectorAll('.pill, .featured-filter-btn, .product-filter-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter || 'all';
      document.querySelectorAll('[data-style]').forEach(card => {
        const match = filter === 'all' || card.dataset.style === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

// ===== Search Bar =====
function setupSearchBar() {
  const searchToggle = document.getElementById('searchToggle');
  const searchClose  = document.getElementById('searchClose');
  const searchBar    = document.getElementById('searchBar');
  const searchInput  = document.getElementById('searchInput');

  searchToggle?.addEventListener('click', () => {
    searchBar?.classList.add('open');
    searchInput?.focus();
  });

  searchClose?.addEventListener('click', () => {
    searchBar?.classList.remove('open');
    if (searchInput) {
      searchInput.value = '';
      // restore all cards
      document.querySelectorAll('[data-id]').forEach(c => c.style.display = '');
    }
  });

  searchInput?.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    document.querySelectorAll('[data-id]').forEach(card => {
      const name = (card.querySelector('.product-name') || card.querySelector('h3'))?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      card.style.display = (!val || name.includes(val) || desc.includes(val)) ? '' : 'none';
    });
  });
}

// ===== Mobile Menu =====
function setupMobileMenu() {
  const hamburger  = document.getElementById('hamburgerBtn');
  const navLinks   = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  hamburger?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.toggle('open');
    hamburger?.classList.toggle('open', isOpen);
    navOverlay?.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navOverlay?.addEventListener('click', () => {
    navLinks?.classList.remove('open');
    hamburger?.classList.remove('open');
    navOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  });
}

// ===== Quick View (products page) =====
function setupQuickView() {
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('[data-id]');
      const name = (card?.querySelector('.product-name') || card?.querySelector('h3'))?.textContent || '';
      showToast('Quick view: ' + name);
    });
  });
}

// ===== Account Tab Switcher =====
function switchTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tab + 'Panel')?.classList.add('active');
}

// ===== Newsletter / Form Buttons =====
function setupFormButtons() {
  // Newsletter subscribe buttons
  document.querySelectorAll('.newsletter-form button, .newsletter-form [type=submit]').forEach(btn => {
    if (btn.getAttribute('onclick')) return;
    btn.addEventListener('click', () => {
      const input = btn.closest('form, .newsletter-form')?.querySelector('input[type=email]');
      if (!input || !input.value.trim()) {
        showToast('Please enter your email address');
        return;
      }
      showToast('Thank you! You\'re subscribed ✓');
      input.value = '';
    });
  });

  // Contact form
  const contactSubmit = document.querySelector('.contact-form .submit-btn');
  if (contactSubmit && !contactSubmit.getAttribute('onclick')) {
    contactSubmit.addEventListener('click', () => {
      showToast('Message sent! We\'ll reply within 24 hours ✓');
    });
  }
}

// ===== Sort (products page) =====
function setupSortSelect() {
  const sortSelect = document.getElementById('sortFilter') || document.getElementById('sortSelect');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    const container = document.querySelector('.products-container, .product-grid, #productGrid, #newInGrid');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('[data-id]'));
    cards.sort((a, b) => {
      const pA = parseFloat(a.dataset.price), pB = parseFloat(b.dataset.price);
      const iA = parseInt(a.dataset.id), iB = parseInt(b.dataset.id);
      if (val === 'price-low' || val === 'low') return pA - pB;
      if (val === 'price-high' || val === 'high') return pB - pA;
      if (val === 'newest') return iB - iA;
      return iA - iB;
    });
    cards.forEach(c => container.appendChild(c));
  });
}

// ===== Sidebar checkboxes (products page) =====
function setupSidebarFilters() {
  document.querySelectorAll('.filter-check input[type=checkbox][data-filter]').forEach(cb => {
    cb.addEventListener('change', () => {
      const active = Array.from(document.querySelectorAll('.filter-check input[type=checkbox][data-filter]:checked'))
        .map(c => c.dataset.filter);

      document.querySelectorAll('[data-style]').forEach(card => {
        if (active.length === 0) {
          card.style.display = '';
        } else {
          card.style.display = active.includes(card.dataset.style) ? '' : 'none';
        }
      });
    });
  });

  document.querySelectorAll('.filter-check input[type=radio][data-max]').forEach(rb => {
    rb.addEventListener('change', (e) => {
      const max = parseFloat(e.target.dataset.max);
      document.querySelectorAll('[data-price]').forEach(card => {
        const price = parseFloat(card.dataset.price);
        if (card.style.display === 'none' && card.dataset._hiddenByStyle) return;
        card.style.display = price <= max ? '' : 'none';
      });
    });
  });
}

// ===== Inject global styles needed by shared.js =====
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .wishlist-active svg path { fill: #c9a96e !important; stroke: #c9a96e !important; }
    .wishlist-btn { cursor: pointer; transition: transform .2s; }
    .wishlist-btn:hover { transform: scale(1.15); }
    .card-wishlist.wishlist-active svg path { fill: #c9a96e; stroke: #c9a96e; }
  `;
  document.head.appendChild(style);
})();

// ===== INIT — runs on every page =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartDisplay();
  updateWishlistBadge();
  setupCartDrawer();
  setupMobileMenu();
  setupSearchBar();
  setupGenericCartButtons();
  setupGenericWishlistButtons();
  setupColorButtons();
  setupFilterPills();
  setupSortSelect();
  setupSidebarFilters();
  setupQuickView();
  setupFormButtons();

  // Wishlist page
  if (document.getElementById('wishlistGrid')) {
    renderWishlistPage();
  }
});