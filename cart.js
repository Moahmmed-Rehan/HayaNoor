/* Haya & Noor - Shopping Cart System */
/* This handles adding items, showing cart, and checkout */

// ===== Cart State =====
let cart = [];

// ===== Get Elements =====
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const cartBadge = document.getElementById('cartBadge');

// ===== Load Cart from LocalStorage =====
function loadCart() {
  const saved = localStorage.getItem('hayaCart');
  if (saved) {
    cart = JSON.parse(saved);
    updateCartDisplay();
  }
}

// ===== Save Cart to LocalStorage =====
function saveCart() {
  localStorage.setItem('hayaCart', JSON.stringify(cart));
}

// ===== Add Item to Cart =====
function addToCart(product) {
  // Check if item already in cart
  const existing = cart.find(item => 
    item.id === product.id && item.color === product.color
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: product.color,
      qty: 1
    });
  }

  saveCart();
  updateCartDisplay();
  showCart();
  showToast(product.name + ' added to cart');
}

// ===== Remove Item from Cart =====
function removeFromCart(id, color) {
  cart = cart.filter(item => !(item.id === id && item.color === color));
  saveCart();
  updateCartDisplay();
}

// ===== Update Quantity =====
function updateQty(id, color, change) {
  const item = cart.find(item => item.id === id && item.color === color);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    removeFromCart(id, color);
  } else {
    saveCart();
    updateCartDisplay();
  }
}

// ===== Calculate Total =====
function getTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// ===== Update Cart Display =====
function updateCartDisplay() {
  // Update badge
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = totalQty;
  cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';

  // Update count in drawer
  if (cartCount) {
    cartCount.textContent = '(' + totalQty + ')';
  }

  // Show empty or items
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    if (cartTotal) cartTotal.textContent = '£0.00';
    return;
  }

  // Render items
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-color">Color: ${item.color}</p>
        <p class="cart-item-price">£${item.price.toFixed(2)}</p>
        <div class="qty-controls">
          <button onclick="updateQty(${item.id}, '${item.color}', -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, '${item.color}', 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.color}')">×</button>
    </div>
  `).join('');

  // Update total
  if (cartTotal) {
    cartTotal.textContent = '£' + getTotal().toFixed(2);
  }
}

// ===== Show/Hide Cart =====
function showCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function hideCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== Toast Notification =====
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== Setup Event Listeners =====
function setupCartEvents() {
  // Cart toggle button
  document.getElementById('cartToggle')?.addEventListener('click', () => {
    showCart();
  });

  // Close button
  document.getElementById('cartClose')?.addEventListener('click', () => {
    hideCart();
  });

  // Overlay click
  cartOverlay?.addEventListener('click', () => {
    hideCart();
  });

  // Continue shopping
  document.getElementById('continueShopping')?.addEventListener('click', () => {
    hideCart();
  });

  // Checkout button
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    showToast('Proceeding to checkout...');
    // window.location.href = 'checkout.html';
  });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  setupCartEvents();
});

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.showCart = showCart;