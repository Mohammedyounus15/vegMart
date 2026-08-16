// ==========================================
// 1. SUPABASE CLIENT & STATE
// ==========================================
let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} catch (e) {
  console.warn("Supabase credentials missing or invalid in config.js");
}

let catalog = [];
let cart = {};
let currentTab = 'shop';
let activeCategory = 'All';

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ==========================================
// 3. APP INITIALIZATION & SPLASH
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    splash.classList.add('hide');

    const user = localStorage.getItem('vegmart_user');
    if (user) {
      document.getElementById('mainView').style.display = 'block';
      loadAll();
    } else {
      document.getElementById('authView').style.display = 'flex';
    }
  }, 2000);
});

// Authentication Login
document.getElementById('loginBtn').addEventListener('click', () => {
  const name = document.getElementById('loginName').value.trim();
  const phone = document.getElementById('loginPhone').value.trim();
  const addr = document.getElementById('loginAddr').value.trim();

  if (!name || !phone || !addr) {
    showToast('Please complete all details to continue!');
    return;
  }

  localStorage.setItem('vegmart_user', JSON.stringify({ name, phone, address: addr }));
  document.getElementById('authView').style.display = 'none';
  document.getElementById('mainView').style.display = 'block';
  loadAll();
});

// Profile Header Button
document.getElementById('topProfileBtn').addEventListener('click', () => {
  currentTab = 'profile';
  document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.remove('active'));
  render();
});

// Bottom Navigation Switching
document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    currentTab = btn.dataset.tab;
    document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
});

// Search Input Listener
document.getElementById('searchInput').addEventListener('input', () => {
  if (currentTab === 'shop') renderShop();
});

// ==========================================
// 4. DATA LOADING
// ==========================================
async function loadAll() {
  const user = JSON.parse(localStorage.getItem('vegmart_user') || '{}');
  if (user.address) {
    document.getElementById('headerAddrDisplay').textContent = `Deliver to: ${user.address}`;
  }
  if (user.name) {
    document.getElementById('profileAvatarChar').textContent = user.name.charAt(0).toUpperCase();
  }

  try {
    if (supabaseClient) {
      const { data: veg } = await supabaseClient.from('vegetables').select('*').order('name');
      catalog = veg || [];
    }
    render();
  } catch (e) {
    showToast('Connecting to store...');
    render();
  }
}

// ==========================================
// 5. VIEW RENDERING
// ==========================================
function render() {
  if (currentTab === 'shop') renderShop();
  else if (currentTab === 'categories') renderCategories();
  else if (currentTab === 'profile') renderProfile();
}

function renderShop() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let items = activeCategory === 'All' ? catalog : catalog.filter(v => v.category === activeCategory);
  if (search) {
    items = items.filter(v => v.name.toLowerCase().includes(search));
  }

  const container = document.getElementById('appContent');
  if (items.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--muted); font-size:13px;">No items found.</div>`;
    return;
  }

  let html = `<div class="product-grid">`;
  items.forEach(v => {
    const qty = cart[v.id] || 0;
    html += `
      <div class="product-card">
        <div>
          <div class="product-emoji">${v.emoji || '🥗'}</div>
          <div class="product-title">${v.name}</div>
          <div class="product-unit">${v.unit}</div>
        </div>
        <div>
          <div class="product-price">${fmt(v.price)}</div>
          <button class="add-btn-sm" data-add="${v.id}">${qty > 0 ? `ADD (${qty})` : 'ADD'}</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.add;
      cart[id] = (cart[id] || 0) + 1;
      renderShop();
      updateCartFab();
      showToast('Added to cart');
    });
  });

  updateCartFab();
}

function renderCategories() {
  const container = document.getElementById('appContent');
  const cats = [...new Set(catalog.map(v => v.category))];

  let html = `
    <h2 style="font-size:18px; font-weight:800; margin-bottom:14px;">Browse Categories</h2>
    <div class="category-grid">
      <div class="category-card" data-select-cat="All">
        <div class="category-card-icon">🧺</div>
        <div>All Items</div>
      </div>
  `;

  cats.forEach(c => {
    let icon = '🥗';
    if (c.toLowerCase().includes('leaf')) icon = '🥬';
    else if (c.toLowerCase().includes('fruit')) icon = '🍎';

    html += `
      <div class="category-card" data-select-cat="${c}">
        <div class="category-card-icon">${icon}</div>
        <div>${c}</div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll('[data-select-cat]').forEach(card => {
    card.addEventListener('click', () => {
      activeCategory = card.dataset.selectCat;
      currentTab = 'shop';
      document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === 'shop'));
      render();
    });
  });
}

function renderProfile() {
  const user = JSON.parse(localStorage.getItem('vegmart_user') || '{}');
  const container = document.getElementById('appContent');

  container.innerHTML = `
    <div class="profile-menu-card">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:4px;">${user.name || 'Customer'}</h3>
      <div style="color:var(--muted); font-size:13px; margin-bottom:16px;">📱 ${user.phone || ''}</div>
      
      <div style="display:flex; flex-direction:column;">
        <button class="profile-option-btn" id="btnMyOrders">
          <span>📦 Your Previous Orders</span>
          <span>➔</span>
        </button>
        <button class="profile-option-btn" id="btnEditPhone">
          <span>📱 Change Mobile Number</span>
          <span>➔</span>
        </button>
        <button class="profile-option-btn" id="btnEditAddr">
          <span>📍 Change Delivery Address</span>
          <span>➔</span>
        </button>
        <button class="profile-option-btn" id="btnComplaint">
          <span>🚨 Raise a Complaint</span>
          <span>➔</span>
        </button>
        <button class="profile-option-btn" id="btnLogout" style="color:var(--danger); margin-bottom:0;">
          <span>🚪 Log Out</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  `;

  document.getElementById('btnMyOrders').addEventListener('click', renderMyOrders);

  document.getElementById('btnEditAddr').addEventListener('click', () => {
    const val = prompt('Update delivery address:', user.address || '');
    if (val) {
      user.address = val;
      localStorage.setItem('vegmart_user', JSON.stringify(user));
      document.getElementById('headerAddrDisplay').textContent = `Deliver to: ${val}`;
      renderProfile();
    }
  });

  document.getElementById('btnEditPhone').addEventListener('click', () => {
    const val = prompt('Update phone number:', user.phone || '');
    if (val) {
      user.phone = val;
      localStorage.setItem('vegmart_user', JSON.stringify(user));
      renderProfile();
    }
  });

  document.getElementById('btnComplaint').addEventListener('click', () => {
    const complaint = prompt('Please describe the issue with your order/delivery:');
    if (complaint) {
      showToast('Complaint registered! Our support team will contact you.');
    }
  });

  document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('Log out of VegMart?')) {
      localStorage.removeItem('vegmart_user');
      location.reload();
    }
  });
}

function renderMyOrders() {
  const myOrders = JSON.parse(localStorage.getItem('vegmart_my_orders') || '[]');
  const container = document.getElementById('appContent');

  if (myOrders.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--muted); font-size:13px;">No previous orders found.</div>`;
    return;
  }

  let html = `<h2 style="font-size:18px; font-weight:800; margin-bottom:14px;">Your Past Orders</h2>`;
  myOrders.forEach(o => {
    html += `
      <div class="order-card-refined">
        <div class="order-card-header">
          <span>Order #${o.id}</span>
          <span class="status-badge-green">${o.status || 'Order Placed'}</span>
        </div>
        <div style="color:var(--muted); font-size:12px; margin-bottom:10px;">${new Date(o.date).toLocaleString()}</div>
        <div style="margin-bottom:10px;">
          ${o.items.map(i => `<div>• ${i.name} (${i.qty})</div>`).join('')}
        </div>
        <div style="font-weight:800; font-size:14px; border-top:1px dashed var(--line); padding-top:8px;">Total: ${fmt(o.total)}</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// ==========================================
// 6. CART & CHECKOUT
// ==========================================
function updateCartFab() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const fab = document.getElementById('cartFab');
  fab.style.display = (currentTab === 'shop' && count > 0) ? 'flex' : 'none';
  document.getElementById('cartCount').textContent = count;
}

document.getElementById('cartFab').addEventListener('click', () => {
  renderDrawer();
  document.getElementById('overlay').classList.add('show');
  document.getElementById('cartDrawer').classList.add('show');
});

document.getElementById('closeDrawer').addEventListener('click', () => {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('cartDrawer').classList.remove('show');
});

function renderDrawer() {
  let total = 0;
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  const body = document.getElementById('drawerBody');
  const foot = document.getElementById('drawerFoot');

  if (ids.length === 0) {
    body.innerHTML = `<div style="text-align:center; padding:30px; color:var(--muted); font-size:13px;">Cart is empty.</div>`;
    foot.innerHTML = '';
    return;
  }

  let html = '';
  ids.forEach(id => {
    const v = catalog.find(x => x.id === id);
    if (v) {
      total += v.price * cart[id];
      html += `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;">
          <div>${v.name} x${cart[id]}</div>
          <div style="font-weight:800;">${fmt(v.price * cart[id])}</div>
        </div>
      `;
    }
  });
  body.innerHTML = html;
  foot.innerHTML = `
    <div style="display:flex; justify-content:space-between; font-weight:800; margin-bottom:12px; font-size:14px;">
      <span>Total</span>
      <span>${fmt(total)}</span>
    </div>
    <button class="btn btn-primary" id="checkoutBtn">Confirm & Place Order</button>
  `;
  document.getElementById('checkoutBtn').addEventListener('click', placeOrder);
}

async function placeOrder() {
  const user = JSON.parse(localStorage.getItem('vegmart_user') || '{}');
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  const items = ids.map(id => ({ id, name: catalog.find(x => x.id === id).name, qty: cart[id] }));
  const total = ids.reduce((sum, id) => sum + catalog.find(x => x.id === id).price * cart[id], 0);

  const order = {
    id: 'ORD' + Date.now().toString().slice(-8),
    items,
    total,
    customer_name: user.name,
    phone: user.phone,
    address: user.address,
    slot: '10 Mins Delivery',
    status: 'new'
  };

  if (supabaseClient) {
    await supabaseClient.from('orders').insert(order);
  }

  const myOrders = JSON.parse(localStorage.getItem('vegmart_my_orders') || '[]');
  myOrders.unshift({
    id: order.id,
    date: new Date().toISOString(),
    items: order.items,
    total: order.total,
    status: 'Order Placed'
  });
  localStorage.setItem('vegmart_my_orders', JSON.stringify(myOrders));

  cart = {};
  showToast('Order Placed Successfully!');
  document.getElementById('closeDrawer').click();
  renderShop();
}
