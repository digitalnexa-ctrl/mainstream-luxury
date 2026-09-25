/* =========================================================
   MAINSTREAM — STOREFRONT SCRIPT
   Supabase + Local Products
========================================================= */

let products = [];
let cart = JSON.parse(localStorage.getItem("mainstream_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("mainstream_wishlist") || "[]");
let selectedSize = "M";
let currentFilter = "all";

/* ---------------------------------------------------------
   LOCAL FALLBACK PRODUCTS
--------------------------------------------------------- */

const localProducts = [
    {
        id: "local-1",
        name: "SIGNATURE OVERSIZED TEE",
        brand: "MAINSTREAM",
        price: 1499,
        oldPrice: 1999,
        image1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900",
        image2: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900",
        gallery: [],
        category: "oversized",
        description: "A premium oversized silhouette designed for everyday streetwear.",
        colors: ["Black", "White"],
        sizes: ["S", "M", "L", "XL"],
        stock: 20,
        isNew: true
    },
    {
        id: "local-2",
        name: "HEAVYWEIGHT ROOTS HOODIE",
        brand: "MAINSTREAM",
        price: 2999,
        oldPrice: 3499,
        image1: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900",
        image2: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900",
        gallery: [],
        category: "hoodies",
        description: "Heavyweight premium hoodie with a bold Indian-inspired identity.",
        colors: ["Black", "Grey"],
        sizes: ["S", "M", "L", "XL"],
        stock: 15,
        isNew: true
    },
    {
        id: "local-3",
        name: "URBAN NOMAD GRAPHIC TEE",
        brand: "MAINSTREAM",
        price: 1299,
        oldPrice: 0,
        image1: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900",
        image2: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=900",
        gallery: [],
        category: "printed",
        description: "Statement graphic tee inspired by modern Indian street culture.",
        colors: ["Black", "Cream"],
        sizes: ["S", "M", "L", "XL"],
        stock: 25,
        isNew: true
    },
    {
        id: "local-4",
        name: "ACID WASH STATEMENT TEE",
        brand: "MAINSTREAM",
        price: 1699,
        oldPrice: 0,
        image1: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=900",
        image2: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900",
        gallery: [],
        category: "printed",
        description: "Premium acid-wash tee with an expressive statement graphic.",
        colors: ["Black"],
        sizes: ["S", "M", "L", "XL"],
        stock: 18,
        isNew: false
    },
    {
        id: "local-5",
        name: "ESSENTIAL DROP-SHOULDER TEE",
        brand: "MAINSTREAM",
        price: 1199,
        oldPrice: 1499,
        image1: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900",
        image2: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=900",
        gallery: [],
        category: "oversized",
        description: "Clean drop-shoulder construction with a premium relaxed fit.",
        colors: ["White", "Black"],
        sizes: ["S", "M", "L", "XL"],
        stock: 30,
        isNew: false
    },
    {
        id: "local-6",
        name: "CULTURE PULLOVER HOODIE",
        brand: "MAINSTREAM",
        price: 3199,
        oldPrice: 0,
        image1: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=900",
        image2: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900",
        gallery: [],
        category: "hoodies",
        description: "Premium relaxed hoodie celebrating contemporary Indian culture.",
        colors: ["Black", "Brown"],
        sizes: ["S", "M", "L", "XL"],
        stock: 12,
        isNew: false
    }
];

/* ---------------------------------------------------------
   SUPABASE
--------------------------------------------------------- */

let db = null;

try {
    if (
        typeof supabase !== "undefined" &&
        typeof SUPABASE_URL !== "undefined" &&
        typeof SUPABASE_PUBLISHABLE_KEY !== "undefined"
    ) {
        db = supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );
    }
} catch (error) {
    console.error("Supabase initialization failed:", error);
}

/* ---------------------------------------------------------
   LOAD PRODUCTS
--------------------------------------------------------- */

async function loadProducts() {
    products = [...localProducts];

    if (db) {
        try {
            const { data, error } = await db
                .from("products")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (!error && data) {
                const supabaseProducts = data.map(p => ({
                    id: "db-" + p.id,
                    dbId: p.id,
                    name: p.name || "MAINSTREAM PRODUCT",
                    brand: p.brand || "MAINSTREAM",
                    price: Number(p.price || 0),
                    oldPrice: Number(p.old_price || 0),
                    discount: Number(p.discount || 0),
                    image1: p.image1 || "",
                    image2: p.image2 || "",
                    gallery: Array.isArray(p.gallery) ? p.gallery : [],
                    category: (p.category || "printed").toLowerCase(),
                    description: p.description || "Premium MAINSTREAM streetwear.",
                    colors: Array.isArray(p.colors) ? p.colors : [],
                    sizes: Array.isArray(p.sizes) && p.sizes.length
                        ? p.sizes
                        : ["S", "M", "L", "XL"],
                    stock: Number(p.stock || 0),
                    isNew: Boolean(p.is_new)
                }));

                products = [...supabaseProducts, ...localProducts];
            }
        } catch (error) {
            console.error("Product loading error:", error);
        }
    }

    renderAll();
}

/* ---------------------------------------------------------
   SAFE IMAGE
--------------------------------------------------------- */

function getProductImage(product) {
    return product.image1 ||
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900";
}

/* ---------------------------------------------------------
   RENDER EVERYTHING
--------------------------------------------------------- */

function renderAll() {
    renderNewDrop();
    renderBestSellers();
    renderHoodies();
    renderDiscovery();
    updateCartCount();
}

/* ---------------------------------------------------------
   PRODUCT CARD
--------------------------------------------------------- */

function renderProductCard(product) {
    const wished = wishlist.includes(product.id);
    const secondImage = product.image2 || getProductImage(product);

    return `
        <article class="product-card reveal">

            <div class="product-image-wrap"
                 onclick="openProduct('${product.id}')">

                <img
                    class="product-image product-front"
                    src="${getProductImage(product)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900'"
                >

                <img
                    class="product-image product-back"
                    src="${secondImage}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                    onerror="this.src='${getProductImage(product)}'"
                >

                ${product.isNew ? `<span class="product-badge">NEW</span>` : ""}

                <button
                    class="wishlist-btn ${wished ? "active" : ""}"
                    onclick="event.stopPropagation(); toggleWishlistItem('${product.id}')"
                    aria-label="Wishlist">
                    ${wished ? "♥️" : "♡"}
                </button>

            </div>

            <div class="product-info">

                <p class="product-brand">${escapeHTML(product.brand)}</p>

                <h3>${escapeHTML(product.name)}</h3>

                <div class="product-price">
                    <strong>₹${formatPrice(product.price)}</strong>
                    ${
                        product.oldPrice
                        ? `<del>₹${formatPrice(product.oldPrice)}</del>`
                        : ""
                    }
                </div>

                <div class="product-buttons">

                    <button
                        class="product-btn"
                        onclick="openProduct('${product.id}')">
                        VIEW PRODUCT
                    </button>

                    <button
                        class="product-btn product-btn-dark"
                        onclick="addToCart('${product.id}')">
                        ADD TO CART
                    </button>

                </div>

            </div>

        </article>
    `;
}

/* ---------------------------------------------------------
   SECTIONS
--------------------------------------------------------- */

function renderNewDrop() {
    const container = document.getElementById("new-drop-grid");
    if (!container) return;

    const items = products
        .filter(p => p.isNew)
        .slice(0, 4);

    container.innerHTML = items.length
        ? items.map(renderProductCard).join("")
        : `<p class="empty-message">NEW DROP COMING SOON.</p>`;
}

function renderBestSellers() {
    const container = document.getElementById("best-sellers-grid");
    if (!container) return;

    container.innerHTML = products
        .slice(0, 4)
        .map(renderProductCard)
        .join("");
}

function renderHoodies() {
    const container = document.getElementById("hoodies-grid");
    if (!container) return;

    const items = products
        .filter(p => p.category === "hoodies")
        .slice(0, 4);

    container.innerHTML = items.length
        ? items.map(renderProductCard).join("")
        : `<p class="empty-message">NO HOODIES AVAILABLE.</p>`;
}

function renderDiscovery() {
    const container = document.getElementById("product-discovery");
    if (!container) return;

    let items = products;

    if (currentFilter !== "all") {
        items = products.filter(p =>
            p.category === currentFilter
        );
    }

    const grid =
        container.querySelector(".products-grid") ||
        container.querySelector(".product-grid") ||
        container;

    if (grid) {
        grid.innerHTML = items.map(renderProductCard).join("");
    }
}

/* ---------------------------------------------------------
   CATEGORY SHOPPING
--------------------------------------------------------- */

function shopCategory(category) {
    currentFilter = category || "all";

    renderDiscovery();

    const section = document.getElementById("product-discovery");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    closeMobileMenu();
}

function showAllProducts() {
    currentFilter = "all";
    renderDiscovery();

    const section = document.getElementById("product-discovery");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}

/* ---------------------------------------------------------
   SCROLL HELPERS
--------------------------------------------------------- */

function scrollToSection(id) {
    const element = document.getElementById(id);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    closeMobileMenu();
}

/* ---------------------------------------------------------
   PRODUCT DETAIL
--------------------------------------------------------- */

function openProduct(id) {
    const product = products.find(
        p => String(p.id) === String(id)
    );

    if (!product) return;

    const view = document.getElementById("product-view");

    if (!view) {
        alert("Product page section not found.");
        return;
    }

    const gallery = [
        getProductImage(product),
        product.image2,
        ...(product.gallery || [])
    ].filter(Boolean);

    view.innerHTML = `
        <div class="product-detail">

            <button
                class="product-back-btn"
                onclick="showHome()">
                ← BACK TO SHOP
            </button>

            <div class="product-detail-grid">

                <div class="product-detail-gallery">

                    <div class="product-main-image">
                        <img
                            id="mainProductImage"
                            src="${gallery[0]}"
                            alt="${escapeHTML(product.name)}">
                    </div>

                    <div class="product-thumbnails">
                        ${gallery.map((img, index) => `
                            <button onclick="changeProductImage('${escapeAttribute(img)}')">
                                <img src="${img}" alt="">
                            </button>
                        `).join("")}
                    </div>

                </div>

                <div class="product-detail-info">

                    <p class="product-brand">
                        ${escapeHTML(product.brand)}
                    </p>

                    <h1>${escapeHTML(product.name)}</h1>

                    <div class="detail-price">
                        <strong>₹${formatPrice(product.price)}</strong>
                        ${
                            product.oldPrice
                            ? `<del>₹${formatPrice(product.oldPrice)}</del>`
                            : ""
                        }
                    </div>

                    <p class="product-description">
                        ${escapeHTML(product.description)}
                    </p>

                    ${
                        product.colors?.length
                        ? `
                        <div class="detail-option">
                            <h4>COLOUR</h4>
                            <div class="color-options">
                                ${product.colors.map(color => `
                                    <button class="color-option">
                                        ${escapeHTML(color)}
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                        `
                        : ""
                    }

                    <div class="detail-option">
                        <h4>SIZE</h4>

                        <div class="size-options">
                            ${product.sizes.map(size => `
                                <button
                                    class="size-option ${size === selectedSize ? "selected" : ""}"
                                    onclick="selectSize('${escapeAttribute(size)}')">
                                    ${escapeHTML(size)}
                                </button>
                            `).join("")}
                        </div>
                    </div>

                    <button
                        class="detail-add-btn"
                        onclick="addToCart('${product.id}')">
                        ADD TO CART
                    </button>

                    <button
                        class="detail-buy-btn"
                        onclick="buyNow('${product.id}')">
                        BUY NOW
                    </button>

                    <div class="product-meta">
                        <p>✓ Premium Indian Streetwear</p>
                        <p>✓ Secure Checkout</p>
                        <p>✓ Express Shipping Across India</p>
                    </div>

                </div>

            </div>

        </div>
    `;

    document.querySelectorAll("main > section").forEach(section => {
        section.style.display = "none";
    });

    view.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function changeProductImage(image) {
    const main = document.getElementById("mainProductImage");
    if (main) main.src = image;
}

function showHome() {
    const view = document.getElementById("product-view");

    if (view) {
        view.style.display = "none";
    }

    document.querySelectorAll("main > section").forEach(section => {
        section.style.display = "";
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    renderAll();
}

/* ---------------------------------------------------------
   CART
--------------------------------------------------------- */

function addToCart(id) {
    const product = products.find(
        p => String(p.id) === String(id)
    );

    if (!product) return;

    const existing = cart.find(
        item => String(item.id) === String(id)
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: getProductImage(product),
            size: selectedSize,
            quantity: 1
        });
    }

    localStorage.setItem(
        "mainstream_cart",
        JSON.stringify(cart)
    );

    updateCartCount();

    alert(`${product.name} added to cart.`);
}

function removeFromCart(id) {
    cart = cart.filter(
        item => String(item.id) !== String(id)
    );

    localStorage.setItem(
        "mainstream_cart",
        JSON.stringify(cart)
    );

    openCart();
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const elements = document.querySelectorAll("#cartCount");

    elements.forEach(el => {
        el.textContent = count;
    });
}

function openCart() {
    let drawer = document.getElementById("mainstream-cart");

    if (!drawer) {
        drawer = document.createElement("div");
        drawer.id = "mainstream-cart";
        drawer.className = "mainstream-cart";
        document.body.appendChild(drawer);
    }

    const total = cart.reduce(
        (sum, item) =>
            sum + Number(item.price) * Number(item.quantity),
        0
    );

    drawer.innerHTML = `
        <div class="cart-overlay" onclick="closeCart()"></div>

        <div class="cart-panel">

            <button class="cart-close" onclick="closeCart()">×</button>

            <h2>YOUR CART</h2>

            ${
                cart.length
                ? cart.map(item => `
                    <div class="cart-item">

                        <img src="${item.image}" alt="">

                        <div>
                            <h4>${escapeHTML(item.name)}</h4>
                            <p>Size: ${escapeHTML(item.size)}</p>
                            <p>Qty: ${item.quantity}</p>
                            <strong>
                                ₹${formatPrice(item.price * item.quantity)}
                            </strong>

                            <button
                                onclick="removeFromCart('${item.id}')">
                                REMOVE
                            </button>
                        </div>

                    </div>
                `).join("")
                : `<p class="empty-message">YOUR CART IS EMPTY.</p>`
            }

            <div class="cart-total">
                <span>TOTAL</sp
