// ══════════════════════════════════════════════
//  DATA LAYER — localStorage persistence
// ══════════════════════════════════════════════
const STORE_KEY = 'jkstore_data';

const defaultItems = [
  { id:1,  name:'Rice (5kg)',        cat:'Grains', price:310, stock:43, unit:'kg',     soldTotal:176 },
  { id:2,  name:'Toor Dal (1kg)',    cat:'Grains', price:145, stock:28, unit:'kg',     soldTotal:101 },
  { id:3,  name:'Sunflower Oil (1L)',cat:'Oils',   price:185, stock:9,  unit:'L',      soldTotal:81  },
  { id:4,  name:'Sugar (1kg)',       cat:'Grains', price:50,  stock:20, unit:'kg',     soldTotal:121 },
  { id:5,  name:'Tea Powder (250g)', cat:'Other',  price:95,  stock:17, unit:'packet', soldTotal:99  },
  { id:6,  name:'Parle-G Biscuits', cat:'Snacks',  price:10,  stock:25, unit:'pcs',   soldTotal:256 },
  { id:7,  name:'Atta (5kg)',        cat:'Grains', price:290, stock:22, unit:'kg',     soldTotal:101 },
  { id:8,  name:'Salt (1kg)',        cat:'Other',  price:25,  stock:61, unit:'kg',     soldTotal:44  },
  { id:9,  name:'Mustard Oil (1L)',  cat:'Oils',   price:175, stock:14, unit:'L',      soldTotal:63  },
  { id:10, name:'Chilli Powder',     cat:'Spices', price:80,  stock:32, unit:'packet', soldTotal:48  },
];

const defaultLog = [
  { type:'add',    text:'Opening stock entered for 10 items', time:'2026-05-01 09:00' },
  { type:'remove', text:'Sale: Rice (5kg) × 12 — ₹3,720',    time:'2026-05-01 10:30' },
  { type:'remove', text:'Sale: Parle-G Biscuits × 30 — ₹300', time:'2026-05-02 11:00' },
  { type:'add',    text:'Restocked: Sunflower Oil (1L) +24 units', time:'2026-05-03 09:15' },
  { type:'alert',  text:'Low stock alert: Tea Powder (250g) — 17 units', time:'2026-05-10 08:00' },
  { type:'alert',  text:'Critical stock: Sunflower Oil (1L) — 9 units', time:'2026-05-13 08:00' },
];

const defaultSales = [];

function loadData() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) return JSON.parse(raw);
  return { items: defaultItems, log: defaultLog, sales: defaultSales, nextId: 11 };
}

function saveData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(DB));
}

let DB = loadData();
let currentCat = 'All';
let searchTerm  = '';
const LOW_THRESH      = 20;
const CRITICAL_THRESH = 10;

// ══════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════
const pageTitles = {
  dashboard: '📊 Dashboard',
  inventory:  '📦 Inventory',
  'add-sale': '🧾 Record Sale',
  restock:    '🔄 Restock Items',
  log:        '📋 Activity Log',
  reports:    '📈 Sales Report',
  settings:   '⚙️ Settings',
};

function navigate(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('topbar-title').textContent = pageTitles[page];
  renderPage(page);
}

function renderPage(page) {
  if (page === 'dashboard')  renderDashboard();
  if (page === 'inventory')  renderInventory();
  if (page === 'add-sale')   renderSaleForm();
  if (page === 'restock')    renderRestock();
  if (page === 'log')        renderLog();
  if (page === 'reports')    renderReports();
}

// ══════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════
function renderDashboard() {
  const items = DB.items;
  const critical = items.filter(i => i.stock <= CRITICAL_THRESH);
  const low      = items.filter(i => i.stock > CRITICAL_THRESH && i.stock <= LOW_THRESH);

  // Today's sales
  const today = new Date().toISOString().slice(0,10);
  const todaySales = DB.sales.filter(s => s.date === today);
  const todayRev   = todaySales.reduce((a,s) => a + s.total, 0);
  const todayUnits = todaySales.reduce((a,s) => a + s.qty, 0);

  document.getElementById('kpi-total').textContent    = items.length;
  document.getElementById('kpi-critical').textContent = critical.length;
  document.getElementById('kpi-low').textContent      = low.length;
  document.getElementById('kpi-sales').textContent    = '₹' + todayRev.toLocaleString('en-IN');
  document.getElementById('kpi-sales-units').textContent = todayUnits + ' units sold';

  // Alerts
  const alertList = document.getElementById('alert-list');
  if (critical.length === 0 && low.length === 0) {
    alertList.innerHTML = `<div class="alert green"><div class="alert-dot"></div>All items are well-stocked. No action needed today. 🎉</div>`;
  } else {
    alertList.innerHTML =
      critical.map(i => `<div class="alert red"><div class="alert-dot"></div><strong>${i.name}</strong> — Only ${i.stock} units left. Restock IMMEDIATELY.</div>`).join('') +
      low.map(i => `<div class="alert amber"><div class="alert-dot"></div><strong>${i.name}</strong> — ${i.stock} units remaining. Consider restocking soon.</div>`).join('');
  }

  // Stock bars
  const sorted = [...items].sort((a,b) => a.stock - b.stock).slice(0, 8);
  const maxStock = Math.max(...sorted.map(i => i.stock), 1);
  document.getElementById('stock-bars').innerHTML = sorted.map(i => {
    const pct  = Math.round((i.stock / maxStock) * 100);
    const col  = i.stock <= CRITICAL_THRESH ? '#EF4444' : i.stock <= LOW_THRESH ? '#F59E0B' : '#22C55E';
    return `<div class="bar-row">
      <div class="bar-name">${i.name}</div>
      <div class="bar-track"><div class="bar-fill2" style="width:${pct}%;background:${col}"></div></div>
      <div class="bar-num">${i.stock}</div>
    </div>`;
  }).join('');

  // Top sellers
  const topSellers = [...items].sort((a,b) => b.soldTotal - a.soldTotal).slice(0,6);
  const maxSold    = Math.max(...topSellers.map(i => i.soldTotal), 1);
  document.getElementById('top-sellers').innerHTML = topSellers.map(i => {
    const pct = Math.round((i.soldTotal / maxSold) * 100);
    return `<div class="bar-row">
      <div class="bar-name">${i.name}</div>
      <div class="bar-track"><div class="bar-fill2" style="width:${pct}%;background:#60A5FA"></div></div>
      <div class="bar-num">${i.soldTotal}</div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════
//  INVENTORY TABLE
// ══════════════════════════════════════════════
function renderInventory(cat, search) {
  if (cat    !== undefined) currentCat  = cat;
  if (search !== undefined) searchTerm  = search.toLowerCase();

  let items = DB.items;
  if (currentCat !== 'All') items = items.filter(i => i.cat === currentCat);
  if (searchTerm)            items = items.filter(i => i.name.toLowerCase().includes(searchTerm));

  const body = document.getElementById('inv-table-body');
  if (items.length === 0) {
    body.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-icon">📭</div><div class="empty-title">No items found</div>Try a different category or search term.</div></td></tr>`;
    return;
  }
  body.innerHTML = items.map(i => {
    const statusClass = i.stock <= CRITICAL_THRESH ? 'red' : i.stock <= LOW_THRESH ? 'amber' : 'green';
    const statusLabel = i.stock <= CRITICAL_THRESH ? '🔴 Critical' : i.stock <= LOW_THRESH ? '🟡 Low' : '🟢 OK';
    const pct = Math.min(Math.round((i.stock / 80) * 100), 100);
    const barCol = i.stock <= CRITICAL_THRESH ? '#EF4444' : i.stock <= LOW_THRESH ? '#F59E0B' : '#22C55E';
    return `<tr>
      <td><strong>${i.name}</strong></td>
      <td><span class="badge blue">${i.cat}</span></td>
      <td>₹${i.price}</td>
      <td>
        <div class="stock-bar-wrap">
          <div class="stock-bar-bg"><div class="stock-bar-fill" style="width:${pct}%;background:${barCol}"></div></div>
          <span style="font-size:12px;font-weight:600">${i.stock} ${i.unit}</span>
        </div>
      </td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
      <td>
        <button class="btn" style="padding:5px 10px;font-size:12px" onclick="openEditItem(${i.id})">Edit</button>
      </td>
    </tr>`;
  }).join('');
}

function filterCat(cat, el) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderInventory(cat);
}

function searchInventory(val) {
  renderInventory(undefined, val);
}

// ══════════════════════════════════════════════
//  SALE FORM
// ══════════════════════════════════════════════
function renderSaleForm() {
  const sel = document.getElementById('sale-item');
  sel.innerHTML = '<option value="">— Choose an item —</option>' +
    DB.items.map(i => `<option value="${i.id}">${i.name} (${i.stock} in stock)</option>`).join('');
  document.getElementById('sale-date').value = new Date().toISOString().slice(0,10);
  document.getElementById('sale-total').value = '';
  document.getElementById('sale-qty').value = 1;
  document.getElementById('sale-info').style.display = 'none';
}

function updateSaleInfo() {
  const id = parseInt(document.getElementById('sale-item').value);
  const item = DB.items.find(i => i.id === id);
  if (!item) { document.getElementById('sale-info').style.display = 'none'; return; }
  document.getElementById('sale-info').style.display = 'block';
  document.getElementById('sale-stock-val').textContent = item.stock;
  document.getElementById('sale-price-val').textContent = item.price;
  calcSaleTotal();
}

function calcSaleTotal() {
  const id  = parseInt(document.getElementById('sale-item').value);
  const qty = parseInt(document.getElementById('sale-qty').value) || 0;
  const item = DB.items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('sale-total').value = '₹' + (item.price * qty).toLocaleString('en-IN');
}

function recordSale() {
  const id   = parseInt(document.getElementById('sale-item').value);
  const qty  = parseInt(document.getElementById('sale-qty').value) || 0;
  const date = document.getElementById('sale-date').value;
  const note = document.getElementById('sale-note').value;
  const item = DB.items.find(i => i.id === id);
  if (!item) return showToast('⚠️ Please select an item');
  if (qty <= 0) return showToast('⚠️ Enter a valid quantity');
  if (qty > item.stock) return showToast(`⚠️ Only ${item.stock} units in stock`);

  item.stock -= qty;
  item.soldTotal += qty;
  const total = item.price * qty;
  DB.sales.push({ itemId: id, itemName: item.name, qty, total, date, note });
  DB.log.unshift({ type:'remove', text:`Sale: ${item.name} × ${qty} — ₹${total.toLocaleString('en-IN')}${note ? ' (' + note + ')' : ''}`, time: new Date().toLocaleString('en-IN') });
  saveData();
  showToast(`✅ Sale recorded — ₹${total.toLocaleString('en-IN')}`);
  renderSaleForm();
}

// ══════════════════════════════════════════════
//  RESTOCK
// ══════════════════════════════════════════════
function renderRestock() {
  const needRestock = DB.items.filter(i => i.stock <= LOW_THRESH).sort((a,b) => a.stock - b.stock);
  const tbody = document.getElementById('restock-table');
  if (needRestock.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">🎉</div><div class="empty-title">All stocked up!</div>No items need restocking right now.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = needRestock.map(i => {
    const sc = i.stock <= CRITICAL_THRESH ? 'red' : 'amber';
    const sl = i.stock <= CRITICAL_THRESH ? '🔴 Critical' : '🟡 Low';
    return `<tr>
      <td><strong>${i.name}</strong><br><span style="font-size:11px;color:var(--muted)">${i.cat}</span></td>
      <td><strong>${i.stock}</strong> ${i.unit}</td>
      <td><span class="badge ${sc}">${sl}</span></td>
      <td><input type="number" class="form-input" id="rst-${i.id}" min="1" placeholder="Qty" style="width:90px"></td>
      <td><button class="btn btn-primary" style="padding:6px 12px;font-size:12px" onclick="doRestock(${i.id})">Restock</button></td>
    </tr>`;
  }).join('');
}

function doRestock(id) {
  const qty  = parseInt(document.getElementById('rst-' + id).value) || 0;
  const item = DB.items.find(i => i.id === id);
  if (!item || qty <= 0) return showToast('⚠️ Enter a valid quantity');
  item.stock += qty;
  DB.log.unshift({ type:'add', text:`Restocked: ${item.name} +${qty} units (stock now: ${item.stock})`, time: new Date().toLocaleString('en-IN') });
  saveData();
  showToast(`✅ ${item.name} restocked — ${item.stock} units now`);
  renderRestock();
}

// ══════════════════════════════════════════════
//  LOG
// ══════════════════════════════════════════════
function renderLog() {
  const list = document.getElementById('log-list');
  if (DB.log.length === 0) { list.innerHTML = '<div class="empty"><div class="empty-title">No activity yet</div></div>'; return; }
  list.innerHTML = DB.log.slice(0,30).map(l => `
    <div class="log-entry">
      <div class="log-dot-wrap"><div class="log-dot ${l.type}"></div></div>
      <div><div class="log-text">${l.text}</div><div class="log-time">${l.time}</div></div>
    </div>`).join('');
}

// ══════════════════════════════════════════════
//  REPORTS
// ══════════════════════════════════════════════
function renderReports() {
  const totalRev   = DB.sales.reduce((a,s) => a + s.total, 0);
  const totalUnits = DB.sales.reduce((a,s) => a + s.qty, 0);
  document.getElementById('rep-revenue').textContent = '₹' + totalRev.toLocaleString('en-IN');
  document.getElementById('rep-units').textContent   = totalUnits.toLocaleString('en-IN');
  document.getElementById('rep-txns').textContent    = DB.sales.length;

  const topSellers = [...DB.items].sort((a,b) => b.soldTotal - a.soldTotal);
  const maxSold    = Math.max(...topSellers.map(i => i.soldTotal), 1);
  document.getElementById('report-bars').innerHTML = topSellers.map(i => {
    const pct = Math.round((i.soldTotal / maxSold) * 100);
    return `<div class="bar-row">
      <div class="bar-name">${i.name}</div>
      <div class="bar-track"><div class="bar-fill2" style="width:${pct}%;background:#4F8EF7"></div></div>
      <div class="bar-num">${i.soldTotal}</div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════
//  ADD / EDIT / DELETE ITEM
// ══════════════════════════════════════════════
function openAddItem() {
  document.getElementById('new-name').value  = '';
  document.getElementById('new-price').value = '';
  document.getElementById('new-stock').value = '';
  document.getElementById('modal-add').classList.add('show');
}

function addItem() {
  const name  = document.getElementById('new-name').value.trim();
  const cat   = document.getElementById('new-cat').value;
  const price = parseFloat(document.getElementById('new-price').value) || 0;
  const stock = parseInt(document.getElementById('new-stock').value)   || 0;
  const unit  = document.getElementById('new-unit').value;
  if (!name) return showToast('⚠️ Enter an item name');
  DB.items.push({ id: DB.nextId++, name, cat, price, stock, unit, soldTotal: 0 });
  DB.log.unshift({ type:'add', text:`New item added: ${name} (${stock} ${unit} @ ₹${price})`, time: new Date().toLocaleString('en-IN') });
  saveData();
  closeModal();
  showToast(`✅ ${name} added to inventory`);
  renderPage('dashboard');
}

function openEditItem(id) {
  const item = DB.items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('edit-id').value    = id;
  document.getElementById('edit-name').value  = item.name;
  document.getElementById('edit-price').value = item.price;
  document.getElementById('edit-stock').value = item.stock;
  document.getElementById('edit-cat').value   = item.cat;
  document.getElementById('edit-unit').value  = item.unit;
  document.getElementById('modal-edit').classList.add('show');
}

function saveEdit() {
  const id   = parseInt(document.getElementById('edit-id').value);
  const item = DB.items.find(i => i.id === id);
  if (!item) return;
  item.name  = document.getElementById('edit-name').value.trim() || item.name;
  item.price = parseFloat(document.getElementById('edit-price').value) || item.price;
  item.stock = parseInt(document.getElementById('edit-stock').value);
  item.cat   = document.getElementById('edit-cat').value;
  item.unit  = document.getElementById('edit-unit').value;
  DB.log.unshift({ type:'add', text:`Edited: ${item.name} — stock: ${item.stock}, price: ₹${item.price}`, time: new Date().toLocaleString('en-IN') });
  saveData();
  closeModal('modal-edit');
  showToast(`✅ ${item.name} updated`);
  renderInventory();
}

function deleteItem() {
  const id   = parseInt(document.getElementById('edit-id').value);
  const item = DB.items.find(i => i.id === id);
  if (!item) return;
  if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
  DB.items = DB.items.filter(i => i.id !== id);
  DB.log.unshift({ type:'alert', text:`Deleted item: ${item.name}`, time: new Date().toLocaleString('en-IN') });
  saveData();
  closeModal('modal-edit');
  showToast(`🗑️ ${item.name} deleted`);
  renderInventory();
}

// ══════════════════════════════════════════════
//  MODAL & TOAST HELPERS
// ══════════════════════════════════════════════
function closeModal(id) {
  document.getElementById(id || 'modal-add').classList.remove('show');
}
document.querySelectorAll('.modal-backdrop').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
});

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ══════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════
renderDashboard();