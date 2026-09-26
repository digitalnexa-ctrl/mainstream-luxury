let db=null, products=[], cart=JSON.parse(localStorage.getItem("mainstream_cart")||"[]"), wishlist=JSON.parse(localStorage.getItem("mainstream_wishlist")||"[]"), currentFilter="all";

try{if(window.supabase&&SUPABASE_URL&&SUPABASE_PUBLISHABLE_KEY)db=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY)}catch(e){console.error(e)}

const demo=[
 {id:"demo-1",name:"MAINSTREAM Oversized Core Tee",brand:"MAINSTREAM",price:1299,category:"oversized",image1:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",image2:"",is_new:true,description:"Heavy premium oversized silhouette."},
 {id:"demo-2",name:"After Dark Graphic Tee",brand:"MAINSTREAM",price:1499,category:"printed",image1:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85",image2:"",is_new:true,description:"Statement graphic streetwear tee."},
 {id:"demo-3",name:"Heavyweight Pullover Hoodie",brand:"MAINSTREAM",price:2199,category:"hoodies",image1:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",image2:"",is_new:false,description:"Dense fleece heavyweight hoodie."},
 {id:"demo-4",name:"Monogram Printed Tee",brand:"MAINSTREAM",price:1399,category:"printed",image1:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",image2:"",is_new:true,description:"Minimal print, oversized fit."}
];

const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
function img(p){return p.image1||p.image_url||demo[0].image1}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

async function loadProducts(){
 if(!db){products=demo;render();return}
 const {data,error}=await db.from("products").select("*").eq("is_active",true).order("created_at",{ascending:false});
 if(error||!data?.length){products=demo}else{
   products=data.map(p=>({...p,id:String(p.id),image1:p.image1||p.image_url||"",category:normalize(p.category),is_new:!!p.is_new}))
 }
 render();
}
function normalize(c){c=String(c||"printed").toLowerCase();if(c.includes("hood"))return"hoodies";if(c.includes("over"))return"oversized";return"printed"}
function filtered(){return currentFilter==="all"?products:products.filter(p=>p.category===currentFilter)}
function render(){
 const list=filtered();
 document.getElementById("productGrid").innerHTML=list.map(card).join("");
 const featured=products.find(p=>p.is_new)||products[0];
 document.getElementById("featuredProduct").innerHTML=featured?`
 <div class="featured-image"><img src="${esc(img(featured))}" alt="${esc(featured.name)}"></div>
 <div class="featured-info"><p class="eyebrow">01 / FEATURED DROP</p><h3>${esc(featured.name)}</h3><div class="price">${money(featured.price)}</div><p>${esc(featured.description||"Premium MAINSTREAM streetwear.")}</p><button class="btn btn-light add" data-id="${esc(featured.id)}">ADD TO CART</button></div>`:"";
 bindAddButtons();
 updateCounts(); renderCart();
}
function card(p){
 const wished=wishlist.includes(String(p.id));
 return `<article class="product-card reveal visible"><div class="product-img"><img src="${esc(img(p))}" alt="${esc(p.name)}" loading="lazy">${p.is_new?'<span class="new-tag">NEW</span>':""}<button class="wish" data-wish="${esc(p.id)}">${wished?"♥":"♡"}</button></div><div class="product-info"><div class="brand">${esc(p.brand||"MAINSTREAM")}</div><h3>${esc(p.name)}</h3><div class="price">${money(p.price)} ${p.old_price?`<span class="old">${money(p.old_price)}</span>`:""}</div><button class="add" data-id="${esc(p.id)}">ADD TO CART</button></div></article>`
}
function bindAddButtons(){document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>add(b.dataset.id));document.querySelectorAll("[data-wish]").forEach(b=>b.onclick=()=>wish(b.dataset.wish))}
function add(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;const found=cart.find(x=>String(x.id)===String(id));if(found)found.qty++;else cart.push({id:p.id,name:p.name,price:Number(p.price||0),image:img(p),qty:1});localStorage.setItem("mainstream_cart",JSON.stringify(cart));updateCounts();renderCart();openCart()}
function remove(id){cart=cart.filter(x=>String(x.id)!==String(id));localStorage.setItem("mainstream_cart",JSON.stringify(cart));updateCounts();renderCart()}
function renderCart(){const box=document.getElementById("cartItems"),total=cart.reduce((s,x)=>s+x.price*x.qty,0);box.innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><img src="${esc(x.image)}"><div><h4>${esc(x.name)}</h4><p>Qty: ${x.qty}</p><p>${money(x.price*x.qty)}</p></div><button data-remove="${esc(x.id)}">REMOVE</button></div>`).join(""):`<div class="empty">YOUR CART IS EMPTY.</div>`;document.getElementById("cartTotal").textContent=money(total);document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>remove(b.dataset.remove))}
function openCart(){document.getElementById("cartDrawer").classList.add("active");document.getElementById("cartOverlay").classList.add("active")}
function closeCart(){document.getElementById("cartDrawer").classList.remove("active");document.getElementById("cartOverlay").classList.remove("active")}
function wish(id){id=String(id);wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];localStorage.setItem("mainstream_wishlist",JSON.stringify(wishlist));updateCounts();render()}
function updateCounts(){document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);document.getElementById("wishCount").textContent=wishlist.length}
function search(q){const r=products.filter(p=>`${p.name} ${p.category} ${p.description||""}`.toLowerCase().includes(q.toLowerCase()));document.getElementById("searchResults").innerHTML=r.map(card).join("")||"<p>NO PRODUCTS FOUND.</p>";bindAddButtons()}

document.addEventListener("DOMContentLoaded",()=>{
 setTimeout(()=>document.getElementById("preloader").style.opacity="0",700);
 setTimeout(()=>document.getElementById("preloader").remove(),1500);
 loadProducts();
 document.getElementById("cartBtn").onclick=openCart;document.getElementById("cartClose").onclick=closeCart;document.getElementById("cartOverlay").onclick=closeCart;
 document.getElementById("menuBtn").onclick=()=>document.getElementById("mobileMenu").classList.add("active");document.getElementById("menuClose").onclick=()=>document.getElementById("mobileMenu").classList.remove("active");
 document.querySelectorAll(".mobile-menu a").forEach(a=>a.onclick=()=>document.getElementById("mobileMenu").classList.remove("active"));
 document.getElementById("searchBtn").onclick=()=>{document.getElementById("searchModal").classList.add("active");document.getElementById("searchInput").focus()};
 document.getElementById("searchClose").onclick=()=>document.getElementById("searchModal").classList.remove("active");
 document.getElementById("searchInput").oninput=e=>search(e.target.value);
 document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentFilter=b.dataset.filter;render()});
 document.querySelectorAll("[data-category]").forEach(b=>b.onclick=()=>{currentFilter=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===currentFilter));document.getElementById("shop").scrollIntoView({behavior:"smooth"});render()});
 document.getElementById("newsletterForm").onsubmit=async e=>{e.preventDefault();alert("You're on the list.");e.target.reset()};
 document.getElementById("checkoutBtn").onclick=()=>alert("Checkout is ready for Supabase order/payment integration.");
 const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.12});document.querySelectorAll(".reveal").forEach(x=>io.observe(x));
});
