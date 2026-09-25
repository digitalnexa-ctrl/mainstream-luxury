const KEY='MAINSTREAM_ADMIN_DATA_V1';
const blank={products:[],orders:[],customers:[],reviews:[],homepage:{announcement:'FREE EXPRESS SHIPPING ACROSS INDIA ON ALL ORDERS',heroTitle:'WEAR YOUR STATEMENT.',heroSubtitle:'THE NEW DROP / AUTUMN-WINTER 2026',heroButton:'SHOP NEW DROP'},settings:{brand:'MAINSTREAM',email:'',whatsapp:''}};
let data=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(blank);
const app=document.getElementById('app'),title=document.getElementById('title');
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN');
const clean=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[x]));

document.querySelectorAll('.nav').forEach(x=>x.onclick=()=>openPage(x.dataset.page));
menu.onclick=()=>sidebar.classList.toggle('open');

function openPage(p){
 document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===p));
 title.textContent=p==='homepage'?'Homepage':p[0].toUpperCase()+p.slice(1);
 ({overview,products,orders,customers,reviews,homepage,settings})[p]();
 window.scrollTo(0,0);
}
function overview(){
 app.innerHTML=`<div class="cards">${[['PRODUCTS',data.products.length],['ORDERS',data.orders.length],['CUSTOMERS',data.customers.length],['REVIEWS',data.reviews.length]].map(x=>`<div class="card"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('')}</div>
 <div class="panel"><div class="panel-head"><h2>Quick Control</h2></div><div class="quick">
 <button onclick="openProduct()"><b>＋ Add Product</b><small>Create your first T-shirt or hoodie.</small></button>
 <button onclick="openPage('homepage')"><b>⌁ Homepage Control</b><small>Edit hero and announcement content.</small></button>
 <button onclick="openPage('settings')"><b>⚙ Store Settings</b><small>Manage brand contact information.</small></button></div></div>`;
}
function products(){
 app.innerHTML=`<div class="panel"><div class="panel-head"><h2>Product Inventory</h2><button class="add" onclick="openProduct()">＋ ADD PRODUCT</button></div>
 ${data.products.length?`<div class="table-wrap"><table class="table"><thead><tr><th>PRODUCT</th><th>PRICE</th><th>CATEGORY</th><th>STOCK</th><th>ACTIONS</th></tr></thead><tbody>${data.products.map(p=>`<tr><td>${p.front?`<img class="thumb" src="${clean(p.front)}">`:''}<br>${clean(p.name)}</td><td>${money(p.price)} ${p.oldPrice?`<br><del style="color:#666">${money(p.oldPrice)}</del>`:''}</td><td><span class="pill">${clean(p.category)}</span></td><td>${p.stock}</td><td><button class="edit" onclick="editProduct(${p.id})">EDIT</button> <button class="delete" onclick="removeProduct(${p.id})">DELETE</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No products yet.<br>Add your first MAINSTREAM product.</div>'}</div>`;
}
function listPage(label,arr,empty){
 app.innerHTML=`<div class="panel"><div class="panel-head"><h2>${label}</h2></div>${arr.length?`<div class="table-wrap"><table class="table"><tbody>${arr.map(x=>`<tr><td>${clean(JSON.stringify(x))}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">${empty}</div>`}</div>`;
}
function orders(){listPage('Orders',data.orders,'No orders yet.')}
function customers(){listPage('Customers',data.customers,'No customers yet.')}
function reviews(){listPage('Reviews',data.reviews,'No reviews yet.')}
function homepage(){
 app.innerHTML=`<div class="panel"><div class="panel-head"><h2>Homepage Content</h2><button class="save" onclick="saveHome()">SAVE</button></div><div class="setting">
 <label>Announcement<input id="announcement" value="${clean(data.homepage.announcement)}"></label>
 <label>Hero subtitle<input id="heroSubtitle" value="${clean(data.homepage.heroSubtitle)}"></label>
 <label>Hero title<input id="heroTitle" value="${clean(data.homepage.heroTitle)}"></label>
 <label>Hero button<input id="heroButton" value="${clean(data.homepage.heroButton)}"></label>
 </div><p class="notice">This is the new dashboard control layer. Live website/database synchronization is the next connection step.</p></div>`;
}
function settings(){
 app.innerHTML=`<div class="panel"><div class="panel-head"><h2>Store Settings</h2><button class="save" onclick="saveSettings()">SAVE</button></div><div class="setting">
 <label>Brand<input id="brand" value="${clean(data.settings.brand)}"></label>
 <label>Email<input id="email" value="${clean(data.settings.email)}"></label>
 <label>WhatsApp<input id="whatsapp" value="${clean(data.settings.whatsapp)}"></label>
 </div></div>`;
}
function openProduct(p=null){
 document.getElementById('productModal').classList.add('show');
 modalTitle.textContent=p?'Edit Product':'Add Product';
 editId.value=p?.id||'';name.value=p?.name||'';price.value=p?.price||'';oldPrice.value=p?.oldPrice||'';category.value=p?.category||'Printed T-Shirts';stock.value=p?.stock||0;front.value=p?.front||'';back.value=p?.back||'';gallery.value=p?.gallery?.join(', ')||'';sizes.value=p?.sizes?.join(', ')||'S, M, L, XL';newDrop.checked=!!p?.newDrop;
}
function editProduct(id){openProduct(data.products.find(p=>p.id===id))}
function closeProduct(){productModal.classList.remove('show')}
productForm.onsubmit=e=>{
 e.preventDefault();
 const id=Number(editId.value)||Date.now();
 const p={id,name:name.value.trim(),price:Number(price.value),oldPrice:Number(oldPrice.value)||null,category:category.value,stock:Number(stock.value)||0,front:front.value.trim(),back:back.value.trim(),gallery:gallery.value.split(',').map(x=>x.trim()).filter(Boolean),sizes:sizes.value.split(',').map(x=>x.trim()).filter(Boolean),newDrop:newDrop.checked};
 const i=data.products.findIndex(x=>x.id===id);
 if(i>=0)data.products[i]=p;else data.products.push(p);
 save();closeProduct();products();
};
function removeProduct(id){if(confirm('Delete this product?')){data.products=data.products.filter(p=>p.id!==id);save();products()}}
function saveHome(){data.homepage={announcement:announcement.value,heroSubtitle:heroSubtitle.value,heroTitle:heroTitle.value,heroButton:heroButton.value};save();alert('Homepage settings saved')}
function saveSettings(){data.settings={brand:brand.value,email:email.value,whatsapp:whatsapp.value};save();alert('Settings saved')}
openPage('overview');
// MOBILE SIDEBAR FIX
document.querySelectorAll('.nav').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 800) {
      sidebar.classList.remove('open');
    }
  });
});

document.addEventListener('click', (event) => {
  if (window.innerWidth <= 800 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(event.target) &&
      !menu.contains(event.target)) {
    sidebar.classList.remove('open');
  }
});
