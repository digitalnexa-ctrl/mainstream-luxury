// --- SUPABASE PRODUCT DATA ---

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

let products = [];

// Existing MAINSTREAM products
const localProducts = [
    {
        id: 1,
        name: "SIGNATURE OVERSIZED TEE",
        brand: "MAINSTREAM",
        price: 1499,
        oldPrice: 1999,
        discount: 25,
        image1: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        image2: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        isNew: true,
        category: "oversized",
        colors: ["Midnight Black"],
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        name: "HEAVYWEIGHT 'ROOTS' HOODIE",
        brand: "MAINSTREAM",
        price: 2999,
        oldPrice: 3499,
        discount: 14,
        image1: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
        image2: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=800&q=80",
        isNew: true,
        category: "hoodies",
        colors: ["Charcoal Grey"],
        sizes: ["M", "L", "XL"]
    },
    {
        id: 3,
        name: "URBAN NOMAD GRAPHIC TEE",
        brand: "MAINSTREAM",
        price: 1299,
        oldPrice: null,
        discount: null,
        image1: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
        image2: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
        isNew: true,
        category: "printed",
        colors: ["Vintage White"],
        sizes: ["S", "M", "L"]
    },
    {
        id: 4,
        name: "ACID WASH STATEMENT TEE",
        brand: "MAINSTREAM",
        price: 1699,
        oldPrice: null,
        discount: null,
        image1: "https://images.unsplash.com/photo-1617220828111-eb2499dcb6cb?auto=format&fit=crop&w=800&q=80",
        image2: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
        isNew: false,
        category: "oversized",
        colors: ["Washed Grey"],
        sizes: ["M", "L", "XL"]
    },
    {
        id: 5,
        name: "ESSENTIAL DROP-SHOULDER TEE",
        brand: "MAINSTREAM",
        price: 1199,
        oldPrice: 1499,
        discount: 20,
        image1: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80",
        image2: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        isNew: false,
        category: "printed",
        colors: ["Pitch Black"],
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 6,
        name: "CULTURE PULLOVER HOODIE",
        brand: "MAINSTREAM",
        price: 3199,
        oldPrice: null,
        discount: null,
        image1: "https://images.unsplash.com/photo-1511511450040-677116ff389e?auto=format&fit=crop&w=800&q=80",
        image2: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
        isNew: false,
        category: "hoodies",
        colors: ["Washed Olive"],
        sizes: ["M", "L"]
    }
];

async function loadProducts() {

    const { data, error } = await db
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase products error:", error);

        products = [...localProducts];
        startStorefront();

        return;
    }

    const supabaseProducts = (data || []).map(p => ({
        id: `db-${p.id}`,
        dbId: p.id,
        name: p.name,
        brand: p.brand || "MAINSTREAM",
        price: Number(p.price || 0),
        oldPrice: p.old_price ? Number(p.old_price) : null,
        discount: p.discount ? Number(p.discount) : null,
        image1: p.image1 || "",
        image2: p.image2 || p.image1 || "",
        gallery: p.gallery || [],
        isNew: !!p.is_new,
        category: p.category || "printed",
        description: p.description || "",
        colors: p.colors || ["Black"],
        sizes: p.sizes || ["S", "M", "L", "XL"],
        stock: Number(p.stock || 0)
    }));

    // Keep your existing products + add dashboard products
    products = [...localProducts, ...supabaseProducts];

    startStorefront();
}

function startStorefront() {

    renderProductGrid(
        'new-drop-grid',
        products.filter(p => p.isNew).slice(0, 4)
    );

    renderProductCarousel(
        'best-sellers-track',
        products
    );

    renderProductCarousel(
        'hoodies-track',
        products.filter(p => p.category === 'hoodies')
    );

    renderProductGrid(
        'printed-tees-grid',
        products.filter(
            p => p.category === 'printed' ||
                 p.category === 'oversized'
        )
    );

    initHeroCarousel();
    initScrollReveal();
}

loadProducts();

// --- STATE ---
let cart = [];
let wishlist = [];
let currentSize = null;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    renderProductGrid('new-drop-grid', products.slice(0, 4));
    renderProductCarousel('best-sellers-track', products);
    renderProductCarousel('hoodies-track', products.filter(p => p.category === 'hoodies'));
    renderProductGrid('printed-tees-grid', products.filter(p => p.category === 'printed' || p.category === 'oversized'));
    
    initHeroCarousel();
    initScrollReveal();
});

// --- RENDERERS ---
function renderProductCard(p) {
    const isWished = wishlist.includes(p.id);
    const wishIconFill = isWished ? 'fill="var(--danger)" stroke="var(--danger)"' : 'fill="none" stroke="currentColor"';
    const priceHtml = p.oldPrice 
        ? `₹${p.price} <span class="old-price">₹${p.oldPrice}</span>` 
        : `₹${p.price}`;
        
    return `
        <div class="product-card reveal">
            <div class="product-image-wrap" onclick="openProduct(${p.id})">
                ${p.isNew ? `<div class="badge-new">NEW DROP</div>` : ''}
                ${p.discount ? `<div class="badge-discount">${p.discount}% OFF</div>` : ''}
                <img src="${p.image1}" alt="${p.name}" onmouseover="this.src='${p.image2}'" onmouseout="this.src='${p.image1}'">
            </div>
            <button class="wishlist-btn-card ${isWished ? 'active' : ''}" onclick="toggleWishlistItem(${p.id}, this)">
                <svg width="16" height="16" viewBox="0 0 24 24" ${wishIconFill} stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <div class="product-info" onclick="openProduct(${p.id})">
                <span class="product-brand">${p.brand}</span>
                <h3 class="product-title">${p.name}</h3>
                <div class="product-price-row">${priceHtml}</div>
            </div>
            <button class="quick-add" onclick="addToCart(${p.id}, '${p.sizes[0]}')">ADD TO CART</button>
        </div>
    `;
}

function renderProductGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if(container) container.innerHTML = items.map(renderProductCard).join('');
}

function renderProductCarousel(containerId, items) {
    const container = document.getElementById(containerId);
    if(container) container.innerHTML = items.map(renderProductCard).join('');
}

// --- HERO CAROUSEL ---
function initHeroCarousel() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('hero-dots');
    let currentSlide = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if(i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = n;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    setInterval(() => {
        goToSlide((currentSlide + 1) % slides.length);
    }, 5000); // 5s autoplay
}

// --- INTERSECTION OBSERVER (ANIMATIONS) ---
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    // Make all reveal elements visible immediately.
    // This prevents the homepage from becoming blank if
    // IntersectionObserver doesn't trigger correctly.
    reveals.forEach(el => {
        el.classList.add('active');
    });
}

// --- WISHLIST ---
function toggleWishlistItem(id, btnElement) {
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
        btnElement.classList.remove('active');
        btnElement.querySelector('svg').setAttribute('fill', 'none');
        btnElement.querySelector('svg').setAttribute('stroke', 'currentColor');
    } else {
        wishlist.push(id);
        btnElement.classList.add('active');
        btnElement.querySelector('svg').setAttribute('fill', 'var(--danger)');
        btnElement.querySelector('svg').setAttribute('stroke', 'var(--danger)');
    }
    updateCounts();
}

function updateCounts() {
    document.getElementById('wishlist-count').innerText = wishlist.length;
    
    const cartTotalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-count').innerText = cartTotalQty;
    document.getElementById('cart-drawer-count').innerText = cartTotalQty;
}

// --- CART ---
function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId && item.size === size);
    
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, size, qty: 1 });
    }
    
    updateCounts();
    renderCartDrawer();
    toggleCart(); // open drawer
}

function renderCartDrawer() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart">Your cart is empty.</div>`;
        document.getElementById('cart-subtotal').innerText = '₹0';
        return;
    }

    let subtotal = 0;
    container.innerHTML = cart.map((item, index) => {
        subtotal += item.price * item.qty;
        return `
            <div class="cart-item">
                <img src="${item.image1}" alt="${item.name}">
                <div class="cart-item-info">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-variant">Size: ${item.size} | Col: ${item.colors[0]}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                    </div>
                    <div class="qty-selector">
                        <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
    }).join('');

    document.getElementById('cart-subtotal').innerText = `₹${subtotal}`;
}

function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCounts();
    renderCartDrawer();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCounts();
    renderCartDrawer();
}

// --- BUY NOW (Bypass Cart) ---
function buyNow(productId, size) {
    if(!size) { alert("Please select a size"); return; }
    const product = products.find(p => p.id === productId);
    alert(`Proceeding to direct checkout for:\n${product.name}\nSize: ${size}\nAmount: ₹${product.price}`);
}

// --- DRAWERS ---
function closeAllDrawers() {
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('cart-drawer').classList.remove('active');
    document.getElementById('menu-drawer').classList.remove('active');
    document.getElementById('search-modal').classList.remove('active');
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');
    const isActive = drawer.classList.contains('active');
    
    closeAllDrawers();
    if (!isActive) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        renderCartDrawer();
    }
}

function toggleMenu() {
    const drawer = document.getElementById('menu-drawer');
    const overlay = document.getElementById('overlay');
    const isActive = drawer.classList.contains('active');
    
    closeAllDrawers();
    if (!isActive) {
        drawer.classList.add('active');
        overlay.classList.add('active');
    }
}

function toggleSearch() {
    const modal = document.getElementById('search-modal');
    const overlay = document.getElementById('overlay');
    const isActive = modal.classList.contains('active');
    
    closeAllDrawers();
    if (!isActive) {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.getElementById('search-input').focus();
    }
}

// --- SEARCH ---
function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const results = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No products found.</p>';
        return;
    }

    resultsContainer.innerHTML = results.map(p => `
        <div class="cart-item" onclick="openProduct(${p.id}); toggleSearch();" style="cursor:pointer;">
            <img src="${p.image1}" alt="${p.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${p.name}</div>
                <div class="cart-item-price">₹${p.price}</div>
            </div>
        </div>
    `).join('');
}


// --- VIEW ROUTING (HOME vs PDP) ---
function showHome() {
    document.getElementById('main-view').classList.remove('hidden');
    document.getElementById('product-view').classList.add('hidden');
    window.scrollTo(0, 0);
}

function openProduct(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;
    
    currentSize = product.sizes[0]; // Default selection
    
    document.getElementById('main-view').classList.add('hidden');
    const pdp = document.getElementById('product-view');
    pdp.classList.remove('hidden');
    window.scrollTo(0, 0);
    
    const priceHtml = product.oldPrice 
        ? `₹${product.price} <span class="old-price">₹${product.oldPrice}</span> <span style="color:var(--danger); font-size:1rem; font-weight:600;">(${product.discount}% OFF)</span>` 
        : `₹${product.price}`;

    pdp.querySelector('.pdp-container').innerHTML = `
        <div class="pdp-gallery">
            <img src="${product.image1}" alt="${product.name}">
            <img src="${product.image2}" alt="${product.name}">
        </div>
        <div class="pdp-info">
            <div class="pdp-brand">${product.brand}</div>
            <h1 class="pdp-title">${product.name}</h1>
            <div class="pdp-price">${priceHtml}</div>
            
            <p class="pdp-description">Engineered for the street. Premium heavyweight cotton construct with signature oversized dropped shoulders. Limited batch production guaranteeing exclusivity.</p>
            
            <div class="pdp-divider"></div>
            
            <div class="pdp-section-title">
                <span>SELECT SIZE</span>
                <span class="size-guide-link">Size Guide</span>
            </div>
            <div class="size-grid">
                ${product.sizes.map(s => `
                    <button class="size-btn ${s === currentSize ? 'selected' : ''}" onclick="selectSize(this, '${s}')">${s}</button>
                `).join('')}
            </div>
            
            <div class="pdp-actions">
                <button class="btn btn-primary w-100" onclick="addToCart(${product.id}, currentSize)">ADD TO CART</button>
                <button class="btn btn-buy-now w-100" onclick="buyNow(${product.id}, currentSize)">BUY IT NOW</button>
            </div>
            
            <div class="pdp-specs">
                <div class="spec-item" onclick="alert('460 GSM Heavyweight Cotton\\nOversized Fit\\nScreen Printed Graphics')">
                    <span>SPECIFICATIONS</span> <span>+</span>
                </div>
                <div class="spec-item" onclick="alert('Free Express Shipping across India.\\nDelivered in 3-5 business days.')">
                    <span>SHIPPING & RETURNS</span> <span>+</span>
                </div>
            </div>
        </div>
    `;
}

function selectSize(btn, size) {
    currentSize = size;
    const btns = btn.parentElement.querySelectorAll('.size-btn');
    btns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}
// --- LUXURY PRELOADER LOGIC ---
window.addEventListener('load', () => {
    // Wait an extra 500ms so the user sees the logo animation, then fade it out
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if(preloader) {
            preloader.classList.add('preloader-hidden');
            // Remove from DOM after fade transition completes
            setTimeout(() => preloader.remove(), 800);
        }
    }, 500);
});
