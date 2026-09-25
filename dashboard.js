const db = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const app = document.getElementById('app');
const title = document.getElementById('title');
const sidebar = document.getElementById('sidebar');
const menu = document.getElementById('menu');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');

let productsCache = [];
let currentPage = 'overview';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const clean = s => String(s ?? '').replace(/[&<>"']/g, x => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[x]));

function arr(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '').split(',').map(x => x.trim()).filter(Boolean);
}

async function getProducts() {
  const { data, error } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    alert('Could not load products: ' + error.message);
    return [];
  }

  productsCache = data || [];
  return productsCache;
}

async function getCount(table) {
  const { count, error } = await db
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error(table, error);
    return 0;
  }
  return count || 0;
}

document.querySelectorAll('.nav').forEach(item => {
  item.addEventListener('click', () => openPage(item.dataset.page));
});

menu.addEventListener('click', e => {
  e.stopPropagation();
  sidebar.classList.toggle('open');
});

document.addEventListener('click', event => {
  if (window.innerWidth <= 800 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(event.target) &&
      !menu.contains(event.target)) {
    sidebar.classList.remove('open');
  }
});

async function openPage(page) {
  currentPage = page;

  document.querySelectorAll('.nav').forEach(x => {
    x.classList.toggle('active', x.dataset.page === page);
  });

  if (window.innerWidth <= 800) sidebar.classList.remove('open');

  title.textContent = page === 'homepage'
    ? 'Homepage'
    : page[0].toUpperCase() + page.slice(1);

  if (page === 'overview') await overview();
  if (page === 'products') await products();
  if (page === 'orders') await orders();
  if (page === 'customers') await customers();
  if (page === 'reviews') await reviews();
  if (page === 'homepage') await homepage();
  if (page === 'settings') await settings();

  window.scrollTo(0, 0);
}

async function overview() {
  const [p, o, c, r] = await Promise.all([
    getCount('products'),
    getCount('orders'),
    getCount('customers'),
    getCount('reviews')
  ]);

  app.innerHTML = `
    <div class="cards">
      <div class="card"><small>PRODUCTS</small><strong>${p}</strong></div>
      <div class="card"><small>ORDERS</small><strong>${o}</strong></div>
      <div class="card"><small>CUSTOMERS</small><strong>${c}</strong></div>
      <div class="card"><small>REVIEWS</small><strong>${r}</strong></div>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>Quick Control</h2></div>
      <div class="quick">
        <button onclick="openProduct()">
          <b>＋ Add Product</b>
          <small>Create a new T-shirt or hoodie.</small>
        </button>
        <button onclick="openPage('homepage')">
          <b>⌁ Homepage Control</b>
          <small>Edit hero and announcement content.</small>
        </button>
        <button onclick="openPage('settings')">
          <b>⚙ Store Settings</b>
          <small>Manage brand contact information.</small>
        </button>
      </div>
    </div>`;
}

async function products() {
  const list = await getProducts();

  app.innerHTML = `
  <div class="panel">
    <div class="panel-head">
      <h2>Product Inventory</h2>
      <button class="add" onclick="openProduct()">＋ ADD PRODUCT</button>
    </div>

    ${list.length ? `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>PRODUCT</th><th>PRICE</th><th>CATEGORY</th><th>STOCK</th><th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(p => `
          <tr>
            <td>
              ${p.image1 ? `<img class="thumb" src="${clean(p.image1)}" alt="">` : ''}
              <br>${clean(p.name)}
              ${p.is_new ? '<span class="pill">NEW</span>' : ''}
            </td>
            <td>
              ${money(p.price)}
              ${p.old_price ? `<br><del style="color:#666">${money(p.old_price)}</del>` : ''}
            </td>
            <td><span class="pill">${clean(p.category)}</span></td>
            <td>${Number(p.stock || 0)}</td>
            <td>
              <button class="edit" onclick="editProduct(${p.id})">EDIT</button>
              <button class="delete" onclick="removeProduct(${p.id})">DELETE</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `
    <div class="empty">
      No products yet.<br>Add your first MAINSTREAM product.
    </div>`}
  </div>`;
}

async function listPage(table, label, empty) {
  const { data, error } = await db.from(table).select('*').order('created_at', { ascending: false });

  if (error) {
    app.innerHTML = `<div class="panel"><div class="empty">Could not load ${label}.<br>${clean(error.message)}</div></div>`;
    return;
  }

  app.innerHTML = `
  <div class="panel">
    <div class="panel-head"><h2>${label}</h2></div>
    ${data?.length ? `
      <div class="table-wrap">
        <table class="table">
          <tbody>
            ${data.map(x => `<tr><td><pre style="white-space:pre-wrap">${clean(JSON.stringify(x, null, 2))}</pre></td></tr>`).join('')}
          </tbody>
        </table>
      </div>` :
      `<div class="empty">${empty}</div>`}
  </div>`;
}

async function orders() {
  await listPage('orders', 'Orders', 'No orders yet.');
}

async function customers() {
  await listPage('customers', 'Customers', 'No customers yet.');
}

async function reviews() {
  await listPage('reviews', 'Reviews', 'No reviews yet.');
}

async function homepage() {
  const { data, error } = await db
    .from('homepage_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  const h = data || {
    announcement: 'FREE EXPRESS SHIPPING ACROSS INDIA ON ALL ORDERS',
    hero_title: 'WEAR YOUR STATEMENT.',
    hero_subtitle: 'THE NEW DROP / AUTUMN-WINTER 2026',
    hero_image: ''
  };

  app.innerHTML = `
  <div class="panel">
    <div class="panel-head">
      <h2>Homepage Content</h2>
      <button class="save" onclick="saveHome()">SAVE</button>
    </div>

    <div class="setting">
      <label>Announcement
        <input id="announcement" value="${clean(h.announcement)}">
      </label>

      <label>Hero title
        <input id="heroTitle" value="${clean(h.hero_title)}">
      </label>

      <label>Hero subtitle
        <input id="heroSubtitle" value="${clean(h.hero_subtitle)}">
      </label>

      <label>Hero image URL
        <input id="heroImage" value="${clean(h.hero_image || '')}">
      </label>
    </div>

    ${error ? `<p class="notice">Could not load saved homepage settings. ${clean(error.message)}</p>` : ''}
  </div>`;
}

async function settings() {
  app.innerHTML = `
  <div class="panel">
    <div class="panel-head"><h2>Store Settings</h2></div>
    <div class="setting">
      <p class="notice">
        MAINSTREAM is connected to Supabase.
        Store contact/authentication settings can be added in the next step.
      </p>
    </div>
  </div>`;
}

function openProduct(product = null) {
  productModal.classList.add('show');
  document.getElementById('modalTitle').textContent = product ? 'Edit Product' : 'Add Product';

  document.getElementById('editId').value = product?.id || '';
  document.getElementById('name').value = product?.name || '';
  document.getElementById('price').value = product?.price ?? '';
  document.getElementById('oldPrice').value = product?.old_price ?? '';
  document.getElementById('category').value = product?.category || 'Printed T-Shirts';
  document.getElementById('stock').value = product?.stock ?? 0;
  document.getElementById('description').value = product?.description || '';
  document.getElementById('front').value = product?.image1 || '';
  document.getElementById('back').value = product?.image2 || '';
  document.getElementById('gallery').value = (product?.gallery || []).join(', ');
  document.getElementById('colors').value = (product?.colors || []).join(', ');
  document.getElementById('sizes').value = (product?.sizes || ['S','M','L','XL']).join(', ');
  document.getElementById('newDrop').checked = !!product?.is_new;
}

async function editProduct(id) {
  const product = productsCache.find(p => Number(p.id) === Number(id));
  if (product) openProduct(product);
}

function closeProduct() {
  productModal.classList.remove('show');
}

productForm.addEventListener('submit', async e => {
  e.preventDefault();

  const id = document.getElementById('editId').value;

  const product = {
    name: document.getElementById('name').value.trim(),
    brand: 'MAINSTREAM',
    price: Number(document.getElementById('price').value || 0),
    old_price: Number(document.getElementById('oldPrice').value || 0) || null,
    category: document.getElementById('category').value,
    stock: Number(document.getElementById('stock').value || 0),
    description: document.getElementById('description').value.trim(),
    image1: document.getElementById('front').value.trim(),
    image2: document.getElementById('back').value.trim(),
    gallery: arr(document.getElementById('gallery').value),
    colors: arr(document.getElementById('colors').value),
    sizes: arr(document.getElementById('sizes').value),
    is_new: document.getElementById('newDrop').checked,
    is_active: true
  };

  let result;

  if (id) {
    result = await db
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
  } else {
    result = await db
      .from('products')
      .insert(product)
      .select()
      .single();
  }

  if (result.error) {
    console.error(result.error);
    alert('Could not save product: ' + result.error.message);
    return;
  }

  closeProduct();
  await products();
});

async function removeProduct(id) {
  if (!confirm('Delete this product permanently?')) return;

  const { error } = await db
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Could not delete product: ' + error.message);
    return;
  }

  await products();
}

async function saveHome() {
  const payload = {
    id: 1,
    announcement: document.getElementById('announcement').value,
    hero_title: document.getElementById('heroTitle').value,
    hero_subtitle: document.getElementById('heroSubtitle').value,
    hero_image: document.getElementById('heroImage').value,
    updated_at: new Date().toISOString()
  };

  const { error } = await db
    .from('homepage_settings')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    alert('Could not save homepage: ' + error.message);
    return;
  }

  alert('Homepage settings saved to Supabase.');
}

openPage('overview');
