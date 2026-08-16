let supabaseClient;
try{ supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY); }catch(e){ supabaseClient = null; }

let catalog = [];
let orders = [];
let settings = { owner_phone:'', owner_pin:'' };
let cart = {};
let currentTab = 'shop';
let activeCategory = 'All';
let adminUnlocked = false;
let failedPinAttempts = 0;
let dataLoaded = false;
let searchDebounce = null;
let placingOrder = false;

const TAGLINES = [
  "You want it, we've got it.",
  "Farm fresh, minus the wait.",
  "Veggies at the speed of hungry.",
  "Crisp, clean, delivered green.",
  "Your kitchen's shortcut to fresh.",
  "Fresh picks, zero drama.",
  "From the farm to your door, fast.",
  "Good veggies. Great hurry.",
  "Skip the market, not the freshness.",
  "Real vegetables, real quick.",
  "Nature's basket, delivered.",
  "Fresh doesn't wait. Neither do we.",
  "Your greens, greener and quicker.",
  "Order fresh. Live fresh.",
  "Local veggies, delivered with love."
];

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

function isValidPhone(p){ return /^[6-9]\d{9}$/.test(p.trim()); }

// SPLASH — random tagline every open, min 1.6s so it never feels laggy but never overstays
window.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('splashTagline').textContent = TAGLINES[Math.floor(Math.random()*TAGLINES.length)];

  const boot = ()=>{
    const splash = document.getElementById('splashScreen');
    splash.classList.add('hide');
    const user = localStorage.getItem('vegmart_user');
    const urlParams = new URLSearchParams(window.location.search);

    if(urlParams.get('admin') === 'true' || urlParams.get('admin') === '1'){
      currentTab = 'admin';
      document.getElementById('mainView').style.display = 'block';
      loadAll();
    } else if(user){
      document.getElementById('mainView').style.display = 'block';
      loadAll();
    } else {
      document.getElementById('authView').style.display = 'flex';
    }
  };
  setTimeout(boot, 1600);
});

// LOGIN
document.getElementById('loginBtn').addEventListener('click', ()=>{
  const name = document.getElementById('loginName').value.trim();
  const phone = document.getElementById('loginPhone').value.trim();
  const addr = document.getElementById('loginAddr').value.trim();

  let ok = true;
  const nameEl = document.getElementById('loginName');
  const phoneEl = document.getElementById('loginPhone');
  const addrEl = document.getElementById('loginAddr');
  [nameEl, phoneEl, addrEl].forEach(el=>el.classList.remove('field-error'));
  ['errName','errPhone','errAddr'].forEach(id=>document.getElementById(id).style.display='none');

  if(!name){ nameEl.classList.add('field-error'); document.getElementById('errName').style.display='block'; ok = false; }
  if(!isValidPhone(phone)){ phoneEl.classList.add('field-error'); document.getElementById('errPhone').style.display='block'; ok = false; }
  if(!addr){ addrEl.classList.add('field-error'); document.getElementById('errAddr').style.display='block'; ok = false; }
  if(!ok){ showToast('Please fix the highlighted fields'); return; }

  localStorage.setItem('vegmart_user', JSON.stringify({ name, phone, address: addr }));
  document.getElementById('authView').style.display = 'none';
  document.getElementById('mainView').style.display = 'block';
  loadAll();
});

document.getElementById('topProfileBtn').addEventListener('click', ()=>{
  currentTab = 'profile';
  document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.remove('active'));
  render();
});

document.getElementById('locationPill').addEventListener('click', ()=>{
  const user = JSON.parse(localStorage.getItem('vegmart_user') || '{}');
  const val = prompt('Update delivery address:', user.address || '');
  if(val && val.trim()){
    user.address = val.trim();
    localStorage.setItem('vegmart_user', JSON.stringify(user));
    document.getElementById('headerAddrDisplay').textContent = user.address;
    showToast('Delivery address updated');
  }
});

async function loadAll(){
  const user = JSON.parse(localStorage.getItem('vegmart_user') || '{}');
  if(user.address) document.getElementById('headerAddrDisplay').textContent = user.address;
  if(user.name) document.getElementById('profileAvatarChar').textContent = user.name.charAt(0).toUpperCase();

  renderSkeleton();

  try{
    const [{data:veg}, {data:ord}, {data:set}] = await Promise.all([
      supabaseClient.from('vegetables').select('*').order('name'),
      supabaseClient.from('orders').select('*').order('created_at', {ascending:false}),
      supabaseClient.from('settings').select('*').eq('id','main').single()
    ]);
    catalog = veg || [];
    orders = ord || [];
    settings = set || { owner_phone:'', owner_pin:'' };
    dataLoaded = true;
    render();
  }catch(e){
    showToast('Could not reach the store — check your connection');
    dataLoaded = true;
    render();
  }
}

function fmt(n){ return '₹' + Number(n).toLocaleString('en-IN'); }

document.querySelectorAll('.bottom-nav .nav-item').forEach(btn=>{
