const products=[
{name:"JAALI PERFORATED OVERSIZED HOODIE",price:7490,old:8990,color:"Onyx Black",img:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85"},
{name:"VARANASI RELIEF HEAVYWEIGHT TEE",price:3890,old:4490,color:"Pitch Black",img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85"},
{name:"MUKHYADHARA STATEMENT PULLOVER",price:7990,old:9490,color:"Washed Onyx",img:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85"},
{name:"CHANDERI GEOMETRIC HEAVY TEE",price:3990,old:4690,color:"Charcoal Melange",img:"https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1000&q=85"},
{name:"JAIPUR ARCHIVE ZIP HOODIE",price:6990,old:8290,color:"Obsidian",img:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=85"},
{name:"KALA GHODA STRUCTURED TEE",price:3490,old:4190,color:"Graphite",img:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85"},
{name:"MUGHAL GRID OVERSIZED TEE",price:4290,old:4990,color:"Stone Black",img:"https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85"},
{name:"DECCAN HEAVYWEIGHT HOODIE",price:7290,old:8690,color:"Night Grey",img:"https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85"}
];
let cart=JSON.parse(localStorage.getItem("mainstream-cart")||"[]"), wishes=JSON.parse(localStorage.getItem("mainstream-wishes")||"[]");
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem("mainstream-cart",JSON.stringify(cart));localStorage.setItem("mainstream-wishes",JSON.stringify(wishes));updateCount()}
function updateCount(){$("#cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0)}
function renderProducts(){
 $("#products").innerHTML=products.map((p,i)=>`<article class="card"><img class="card-img" src="${p.img}" alt="${p.name}"><div class="card-body"><div class="card-top"><span>NEW DROP</span><button class="wish" data-i="${i}" style="background:none;border:0;color:white;font-size:24px;cursor:pointer">${wishes.includes(i)?"♥":"♡"}</button></div><h3>${p.name}</h3><div class="price">₹${p.price.toLocaleString("en-IN")} <span class="old">₹${p.old.toLocaleString("en-IN")}</span></div><div class="swatches"><span class="swatch"></span><span class="swatch"></span><span class="swatch"></span></div><p class="mono" style="margin-bottom:8px">SIZE</p><div class="sizes">${["XS","S","M","L","XL","XXL"].map((s,j)=>`<button class="size ${j===2?"active":""}">${s}</button>`).join("")}</div><button class="add" data-i="${i}">ADD TO CART →</button></div></article>`).join("");
 $$(".add").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;const found=cart.find(x=>x.i===i);found?found.qty++:cart.push({i,qty:1});save();openCart()});
 $$(".wish").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;wishes.includes(i)?wishes=wishes.filter(x=>x!==i):wishes.push(i);save();renderProducts()});
 $$(".size").forEach(b=>b.onclick=()=>{b.parentElement.querySelectorAll(".size").forEach(x=>x.classList.remove("active"));b.classList.add("active")});
}
function renderReviews(){$("#reviewList").innerHTML=[
["JAALI PERFORATED OVERSIZED HOODIE","The drape and weight feel substantial, with a strong Indian identity.","Kabir Singhania","Mumbai, IN"],
["VARANASI RELIEF HEAVYWEIGHT TEE","The tonal relief is understated and the fabric feels structured after repeated wear.","Aarav Mehta","Bengaluru, IN"],
["MUKHYADHARA STATEMENT PULLOVER","The typography is restrained and the heavyweight construction feels premium.","Devansh Kulkarni","New Delhi, IN"],
["CHANDERI GEOMETRIC HEAVY TEE","The micro-grid detail is brilliant. The fabric feels cool yet structured.","Rohan Deshmukh","Hyderabad, IN"]
].map(r=>`<article class="review"><div class="stars">★★★★★</div><h4>${r[0]}</h4><q>${r[1]}</q><hr><b>${r[2]}</b><div class="buyer">✓ Verified Buyer · ${r[3]}</div></article>`).join("")}
function openCart(){renderCart();$("#drawer").classList.add("open");$("#overlay").classList.add("show")}
function closeCart(){$("#drawer").classList.remove("open");$("#overlay").classList.remove("show")}
function renderCart(){const body=$("#drawerBody");if(!cart.length){body.innerHTML='<div class="empty">YOUR BAG IS EMPTY.</div>';return}body.innerHTML=cart.map((x,k)=>{const p=products[x.i];return `<div class="cart-row"><img src="${p.img}"><div style="flex:1"><b>${p.name}</b><p>₹${p.price.toLocaleString("en-IN")}</p><button onclick="changeQty(${k},-1)">−</button> ${x.qty} <button onclick="changeQty(${k},1)">+</button> <button onclick="removeItem(${k})">REMOVE</button></div></div>`}).join("")+`<h3>TOTAL ₹${cart.reduce((a,x)=>a+products[x.i].price*x.qty,0).toLocaleString("en-IN")}</h3><button class="btn light" style="width:100%" onclick="alert('Checkout connected here when you add your payment provider.')">PROCEED TO CHECKOUT</button>`}
function changeQty(k,d){cart[k].qty+=d;if(cart[k].qty<=0)cart.splice(k,1);save();renderCart()}function removeItem(k){cart.splice(k,1);save();renderCart()}
$("#cartBtn").onclick=openCart;$("#closeDrawer").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#searchBtn").onclick=()=>{const q=prompt("Search MAINSTREAM products");if(!q)return;const i=products.findIndex(p=>p.name.toLowerCase().includes(q.toLowerCase()));i>=0?document.querySelectorAll(".card")[i].scrollIntoView({behavior:"smooth"}):alert("No matching product found.")};
$("#wishBtn").onclick=()=>alert(`${wishes.length} item(s) saved to wishlist.`);
$("#subscribeForm").onsubmit=e=>{e.preventDefault();alert("You're in. Welcome to the MAINSTREAM inner circle.");e.target.reset()};
renderProducts();renderReviews();updateCount();