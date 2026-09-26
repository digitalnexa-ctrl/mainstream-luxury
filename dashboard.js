const db=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let products=[],orders=[],editingId=null;
const $=id=>document.getElementById(id);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function cat(c){return String(c||"").toLowerCase()}
async function loadAll(){
  const [{data:p,error:pe},{data:o,error:oe}]=await Promise.all([
    db.from("products").select("*").order("created_at",{ascending:false}),
    db.from("orders").select("*").order("created_at",{ascending:false})
  ]);
  if(pe)console.warn(pe); if(oe)console.warn(oe);
  products=p||[];orders=o||[];renderAll();
}
function renderAll(){
  $("statProducts").textContent=products.filter(p=>p.is_active).length;
  $("statOrders").textContent=orders.length;
  $("statRevenue").textContent=money(orders.filter(o=>o.payment_status==="paid"||o.order_status==="delivered").reduce((s,o)=>s+Number(o.total||0),0));
  $("statLow").textContent=products.filter(p=>Number(p.stock||0)<=10).length;
  $("connectionStatus").textContent="CONNECTED";
  renderProducts();renderOrders();renderRecent();
}
function renderRecent(){
 $("recentProducts").innerHTML=products.slice(0,5).map(p=>`<div class="product-mini"><img src="${esc(p.image1||p.image_url||"")}"><span>${esc(p.name)}<small>${money(p.price)}</small></span><b>${p.stock??0}</b></div>`).join("")||"<p class='muted'>No products yet.</p>";
 $("recentOrders").innerHTML=orders.slice(0,6).map(o=>`<div class="order-mini"><span>#${String(o.id||"").slice(0,8)}<br><small>${esc(o.customer_name||o.email||"Customer")}</small></span><b>${money(o.total)}</b></div>`).join("")||"<p class='muted'>No orders yet.</p>";
}
function renderProducts(){
 const q=($("productSearch")?.value||"").toLowerCase(),f=$("productFilter")?.value||"all";
 const list=products.filter(p=>(!q||`${p.name} ${p.category}`.toLowerCase().includes(q))&&(f==="all"||cat(p.category)===f));
 $("productsTable").innerHTML=`<div class="table"><div class="tr head"><span>IMG</span><span>PRODUCT</span><span>PRICE</span><span>CATEGORY</span><span>STOCK</span><span>STATUS</span><span>ACTIONS</span></div>${list.map(p=>`<div class="tr"><img src="${esc(p.image1||p.image_url||"")}"><b>${esc(p.name)}</b><span>${money(p.price)}</span><span>${esc(p.category)}</span><span>${p.stock??0}</span><span><i class="badge ${p.is_active?"green":"yellow"}">${p.is_active?"ACTIVE":"HIDDEN"}</i></span><div class="actions"><button class="tiny" data-edit="${p.id}">EDIT</button><button class="tiny danger" data-delete="${p.id}">DELETE</button></div></div>`).join("")||"<p class='muted'>No products found.</p></div>"}`;
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEdit(b.dataset.edit));
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteProduct(b.dataset.delete));
}
function renderOrders(){
 const q=($("orderSearch")?.value||"").toLowerCase(),f=$("orderFilter")?.value||"all";
 const list=orders.filter(o=>(!q||`${o.id} ${o.customer_name} ${o.email} ${o.phone}`.toLowerCase().includes(q))&&(f==="all"||o.order_status===f));
 $("ordersTable").innerHTML=`<div class="table"><div class="tr head"><span>ID</span><span>CUSTOMER</span><span>TOTAL</span><span>PAYMENT</span><span>DATE</span><span>STATUS</span><span>ACTION</span></div>${list.map(o=>`<div class="tr"><span>#${String(o.id).slice(0,8)}</span><span><b>${esc(o.customer_name||"Customer")}</b><br><small>${esc(o.phone||o.email||"")}</small></span><span>${money(o.total)}</span><span>${esc(o.payment_status||"pending")}</span><span>${o.created_at?new Date(o.created_at).toLocaleDateString("en-IN"):"-"}</span><span><i class="badge">${esc(o.order_status||"new")}</i></span><select class="tiny" data-status="${o.id}"><option value="new">new</option><option value="processing">processing</option><option value="shipped">shipped</option><option value="delivered">delivered</option><option value="cancelled">cancelled</option></select></div>`).join("")||"<p class='muted'>No orders found.</p></div>"}`;
 document.querySelectorAll("[data-status]").forEach(s=>{s.value=orders.find(o=>o.id===s.dataset.status)?.order_status||"new";s.onchange=()=>updateOrder(s.dataset.status,s.value)});
}
async function updateOrder(id,status){const {error}=await db.from("orders").update({order_status:status}).eq("id",id);if(error)alert(error.message);else loadAll()}
function openModal(){editingId=null;$("modalTitle").textContent="Add Product";$("productForm").reset();$("pActive").checked=true;$("productModal").classList.add("open")}
function openEdit(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;editingId=p.id;$("modalTitle").textContent="Edit Product";$("pName").value=p.name||"";$("pPrice").value=p.price||0;$("pOld").value=p.old_price||"";$("pCategory").value=cat(p.category)||"printed";$("pStock").value=p.stock||0;$("pImage").value=p.image1||p.image_url||"";$("pDescription").value=p.description||"";$("pActive").checked=!!p.is_active;$("pNew").checked=!!p.is_new;$("pBest").checked=!!p.is_best_seller;$("productModal").classList.add("open")}
async function saveProduct(e){e.preventDefault();$("formMsg").textContent="Saving...";const payload={name:$("pName").value.trim(),brand:"MAINSTREAM",price:Number($("pPrice").value||0),old_price:Number($("pOld").value||0)||null,category:$("pCategory").value,stock:Number($("pStock").value||0),image1:$("pImage").value.trim(),description:$("pDescription").value.trim(),is_active:$("pActive").checked,is_new:$("pNew").checked,is_best_seller:$("pBest").checked};const res=editingId?await db.from("products").update(payload).eq("id",editingId):await db.from("products").insert(payload);if(res.error){$("formMsg").textContent=res.error.message;return}$("formMsg").textContent="Saved.";setTimeout(()=>{$("productModal").classList.remove("open");loadAll()},400)}
async function deleteProduct(id){if(!confirm("Delete this product?"))return;const {error}=await db.from("products").delete().eq("id",id);if(error)alert(error.message);else loadAll()}
function showPage(name){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));$("page-"+name).classList.add("active-page");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===name))}
async function boot(){
 const {data:{session}}=await db.auth.getSession();
 if(!session){$("dashboardApp").classList.add("hidden");$("loginScreen").style.display="grid";return}
 $("loginScreen").style.display="none";$("dashboardApp").classList.remove("hidden");$("adminEmail").textContent=session.user.email||"ADMIN";loadAll();
}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>showPage(n.dataset.page));
document.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>showPage(b.dataset.goto));
$("quickAdd").onclick=$("addProduct").onclick=openModal;$("modalClose").onclick=()=>$("productModal").classList.remove("open");$("productForm").onsubmit=saveProduct;
$("productSearch").oninput=renderProducts;$("productFilter").onchange=renderProducts;$("orderSearch").oninput=renderOrders;$("orderFilter").onchange=renderOrders;$("refreshOrders").onclick=loadAll;
$("logout").onclick=async()=>{await db.auth.signOut();location.reload()};
$("loginBtn").onclick=async()=>{const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});$("loginMsg").textContent=error?error.message:"";if(!error)boot()};
$("mobileMenu").onclick=()=>document.querySelector(".sidebar").style.display="flex";
boot();