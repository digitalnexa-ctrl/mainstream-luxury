/* =========================================================
   MAINSTREAM — STOREFRONT SCRIPT
   Supabase is the single product source
========================================================= */

let products = [];
let cart = JSON.parse(localStorage.getItem("mainstream_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("mainstream_wishlist") || "[]");

let selectedSize = "M";
let currentFilter = "all";
let db = null;


/* =========================================================
   SUPABASE
========================================================= */

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


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(value) {
    return Number(value || 0).toLocaleString("en-IN");
}

function getProductImage(product) {
    return (
        product.image1 ||
        product.image2 ||
        (Array.isArray(product.gallery)
            ? product.gallery[0]
            : "") ||
        ""
    );
}

function normalizeCategory(category) {
    const value = String(category || "printed").toLowerCase();

    if (value.includes("hood")) {
        return "hoodies";
    }

    if (value.includes("over")) {
        return "oversized";
    }

    if (
        value.includes("print") ||
        value.includes("graphic") ||
        value.includes("tee")
    ) {
        return "printed";
    }

    return value;
}


/* =========================================================
   LOAD PRODUCTS FROM SUPABASE
========================================================= */

async function loadProducts() {

    if (!db) {
        console.error("Supabase is not available.");
        products = [];
        renderAll();
        return;
    }

    try {

        const { data, error } = await db
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Product loading error:", error);
            products = [];
        } else {

            products = (data || []).map(product => ({

                id: "db-" + product.id,

                dbId: product.id,

                name:
                    product.name ||
                    "MAINSTREAM PRODUCT",

                brand:
                    product.brand ||
                    "MAINSTREAM",

                price:
                    Number(product.price || 0),

                oldPrice:
                    Number(product.old_price || 0),

                discount:
                    Number(product.discount || 0),

                image1:
                    product.image1 || "",

                image2:
                    product.image2 || "",

                gallery:
                    Array.isArray(product.gallery)
                        ? product.gallery
                        : [],

                category:
                    normalizeCategory(product.category),

                description:
                    product.description ||
                    "Premium MAINSTREAM streetwear.",

                colors:
                    Array.isArray(product.colors)
                        ? product.colors
                        : [],

                sizes:
                    Array.isArray(product.sizes) &&
                    product.sizes.length
                        ? product.sizes
                        : ["S", "M", "L", "XL"],

                stock:
                    Number(product.stock || 0),

                isNew:
                    Boolean(product.is_new)

            }));
        }

    } catch (error) {

        console.error(
            "Unexpected product loading error:",
            error
        );

        products = [];
    }

    renderAll();
}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderNewDrop();

    renderBestSellers();

    renderHoodies();

    renderDiscovery();

    updateCartCount();

    updateWishlistCount();
}


/* =========================================================
   PRODUCT CARD
========================================================= */

function renderProductCard(product) {

    const wished =
        wishlist.includes(product.id);

    const front =
        getProductImage(product);

    const back =
        product.image2 ||
        front;

    return `

        <article class="product-card reveal">

            <div
                class="product-image-wrap"
                onclick="openProduct('${escapeHTML(product.id)}')"
            >

                <img
                    class="product-image product-front"
                    src="${escapeHTML(front)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >

                <img
                    class="product-image product-back"
                    src="${escapeHTML(back)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >

                ${
                    product.isNew
                        ? `<span class="product-badge">NEW</span>`
                        : ""
                }

                <button
                    class="wishlist-btn ${wished ? "active" : ""}"
                    onclick="
                        event.stopPropagation();
                        toggleWishlistItem('${escapeHTML(product.id)}')
                    "
                    aria-label="Wishlist"
                >
                    ${wished ? "♥️" : "♡"}
                </button>

            </div>

            <div class="product-info">

                <p class="product-brand">
                    ${escapeHTML(product.brand)}
                </p>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <div class="product-price">

                    <strong>
                        ₹${formatPrice(product.price)}
                    </strong>

                    ${
                        product.oldPrice
                            ? `
                                <del>
                                    ₹${formatPrice(product.oldPrice)}
                                </del>
                              `
                            : ""
                    }

                </div>

                <div class="product-buttons">

                    <button
                        class="product-btn"
                        onclick="
                            openProduct('${escapeHTML(product.id)}')
                        "
                    >
                        VIEW PRODUCT
                    </button>

                    <button
                        class="product-btn product-btn-dark"
                        onclick="
                            addToCart('${escapeHTML(product.id)}')
                        "
                    >
                        ADD TO CART
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   NEW DROP
========================================================= */

function renderNewDrop() {

    const container =
        document.getElementById("new-drop-grid");

    if (!container) return;

    const items =
        products
            .filter(product => product.isNew)
            .slice(0, 4);

    container.innerHTML =
        items.length
            ? items.map(renderProductCard).join("")
            : `
                <p class="empty-message">
                    NEW DROP COMING SOON.
                </p>
              `;
}


/* =========================================================
   BEST SELLERS
========================================================= */

function renderBestSellers() {

    const container =
        document.getElementById("best-sellers-track");

    if (!container) return;

    const items =
        products.slice(0, 4);

    container.innerHTML =
        items.length
            ? items.map(renderProductCard).join("")
            : `
                <p class="empty-message">
                    NO PRODUCTS AVAILABLE.
                </p>
              `;
}


/* =========================================================
   HOODIES
========================================================= */

function renderHoodies() {

    const container =
        document.getElementById("hoodies-track");

    if (!container) return;

    const items =
        products
            .filter(product =>
                product.category === "hoodies"
            )
            .slice(0, 4);

    container.innerHTML =
        items.length
            ? items.map(renderProductCard).join("")
            : `
                <p class="empty-message">
                    NO HOODIES AVAILABLE.
                </p>
              `;
}


/* =========================================================
   PRODUCT DISCOVERY
========================================================= */

function renderDiscovery() {

    const section =
        document.getElementById("product-discovery");

    if (!section) return;

    let items = products;

    if (currentFilter !== "all") {

        items =
            products.filter(product =>
                product.category === currentFilter
            );
    }

    const grid =
        section.querySelector(".products-grid") ||
        section.querySelector(".product-grid") ||
        section;

    grid.innerHTML =
        items.length
            ? items.map(renderProductCard).join("")
            : `
                <p class="empty-message">
                    NO PRODUCTS AVAILABLE.
                </p>
              `;
}


/* =========================================================
   CATEGORY
========================================================= */

function shopCategory(category) {

    currentFilter =
        category || "all";

    renderDiscovery();

    const section =
        document.getElementById("product-discovery");

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

    scrollToSection("product-discovery");
}


function scrollToSection(id) {

    const element =
        document.getElementById(id);

    if (element) {

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    closeMobileMenu();
}


/* =========================================================
   PRODUCT DETAIL
========================================================= */

function openProduct(id) {

    const product =
        products.find(
            item =>
                String(item.id) === String(id)
        );

    if (!product) return;

    const view =
        document.getElementById("product-view");

    if (!view) return;

    const gallery = [
        getProductImage(product),
        product.image2,
        ...(product.gallery || [])
    ].filter(Boolean);

    view.innerHTML = `

        <div class="product-detail">

            <button
                class="product-back-btn"
                onclick="showHome()"
            >
                ← BACK TO SHOP
            </button>

            <div class="product-detail-grid">

                <div class="product-detail-gallery">

                    <div class="product-main-image">

                        <img
                            id="mainProductImage"
                            src="${escapeHTML(gallery[0] || "")}"
                            alt="${escapeHTML(product.name)}"
                        >

                    </div>

                    <div class="product-thumbnails">

                        ${gallery.map(image => `

                            <button
                                onclick="
                                    changeProductImage(
                                        '${escapeHTML(image)}'
                                    )
                                "
                            >

                                <img
                                    src="${escapeHTML(image)}"
                                    alt=""
                                >

                            </button>

                        `).join("")}

                    </div>

                </div>


                <div class="product-detail-info">

                    <p class="product-brand">
                        ${escapeHTML(product.brand)}
                    </p>

                    <h1>
                        ${escapeHTML(product.name)}
                    </h1>

                    <div class="detail-price">

                        <strong>
                            ₹${formatPrice(product.price)}
                        </strong>

                        ${
                            product.oldPrice
                                ? `
                                    <del>
                                        ₹${formatPrice(
                                            product.oldPrice
                                        )}
                                    </del>
                                  `
                                : ""
                        }

                    </div>

                    <p class="product-description">
                        ${escapeHTML(product.description)}
                    </p>


                    ${
                        product.colors.length
                            ? `
                                <div class="detail-option">

                                    <h4>COLOUR</h4>

                                    <div class="color-options">

                                        ${product.colors.map(
                                            color => `
                                                <button
                                                    class="color-option"
                                                >
                                                    ${escapeHTML(color)}
                                                </button>
                                            `
                                        ).join("")}

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
                                    class="
                                        size-option
                                        ${
                                            size === selectedSize
                                                ? "selected"
                                                : ""
                                        }
                                    "
                                    onclick="
                                        selectSize(
                                            '${escapeHTML(size)}'
                                        )
                                    "
                                >
                                    ${escapeHTML(size)}
                                </button>

                            `).join("")}

                        </div>

                    </div>


                    <button
                        class="detail-add-btn"
                        onclick="
                            addToCart('${escapeHTML(product.id)}')
                        "
                    >
                        ADD TO CART
                    </button>


                    <button
                        class="detail-buy-btn"
                        onclick="
                            buyNow('${escapeHTML(product.id)}')
                        "
                    >
                        BUY NOW
                    </button>


                    <div class="product-meta">

                        <p>
                            ✓ Premium Indian Streetwear
                        </p>

                        <p>
                            ✓ Secure Checkout
                        </p>

                        <p>
                            ✓ Express Shipping Across India
                        </p>

                    </div>

                </div>

            </div>

        </div>
    `;


    const mainView =
        document.getElementById("main-view");

    if (mainView) {
        mainView.style.display = "none";
    }

    view.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function changeProductImage(image) {

    const main =
        document.getElementById("mainProductImage");

    if (main) {
        main.src = image;
    }
}


function selectSize(size) {

    selectedSize = size;

    document
        .querySelectorAll(".size-option")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.textContent.trim() === size
            );
        });
}


function showHome() {

    const view =
        document.getElementById("product-view");

    const mainView =
        document.getElementById("main-view");

    if (view) {
        view.style.display = "none";
    }

    if (mainView) {
        mainView.style.display = "";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    renderAll();
}


/* =========================================================
   CART
========================================================= */

function addToCart(id) {

    const product =
        products.find(
            item =>
                String(item.id) === String(id)
        );

    if (!product) return;

    const existing =
        cart.find(
            item =>
                String(item.id) === String(id) &&
                item.size === selectedSize
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

    openCart();
}


function removeFromCart(id, size) {

    cart =
        cart.filter(item =>
            !(
                String(item.id) === String(id) &&
                (!size || item.size === size)
            )
        );

    localStorage.setItem(
        "mainstream_cart",
        JSON.stringify(cart)
    );

    updateCartCount();

    openCart();
}


function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

    document
        .querySelectorAll("#cartCount")
        .forEach(element => {
            element.textContent = count;
        });
}


function openCart() {

    let drawer =
        document.getElementById("mainstream-cart");

    if (!drawer) {

        drawer =
            document.createElement("div");

        drawer.id =
            "mainstream-cart";

        drawer.className =
            "mainstream-cart";

        document.body.appendChild(drawer);
    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );


    drawer.innerHTML = `

        <div
            class="cart-overlay"
            onclick="closeCart()"
        ></div>

        <div class="cart-panel">

            <button
                class="cart-close"
                onclick="closeCart()"
            >
                ×
            </button>

            <h2>
                YOUR CART
            </h2>


            <div class="cart-items">

                ${
                    cart.length
                        ? cart.map(item => `

                            <div class="cart-item">

                                <img
                                    src="${escapeHTML(item.image)}"
                                    alt=""
                                >

                                <div>

                                    <h4>
                                        ${escapeHTML(item.name)}
                                    </h4>

                                    <p>
                                        Size:
                                        ${escapeHTML(item.size)}
                                    </p>

                                    <p>
                                        Qty:
                                        ${item.quantity}
                                    </p>

                                    <strong>
                                        ₹${formatPrice(
                                            item.price *
                                            item.quantity
                                        )}
                                    </strong>

                                    <button
                                        onclick="
                                            removeFromCart(
                                                '${escapeHTML(item.id)}',
                                                '${escapeHTML(item.size)}'
                                            )
                                        "
                                    >
                                        REMOVE
                                    </button>

                                </div>

                            </div>

                        `).join("")

                        : `
                            <p class="empty-message">
                                YOUR CART IS EMPTY.
                            </p>
                          `
                }

            </div>


            <div class="cart-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    ₹${formatPrice(total)}
                </strong>

            </div>


            ${
                cart.length
                    ? `
                        <button
                            class="checkout-btn"
                            onclick="checkout()"
                        >
                            CHECKOUT
                        </button>
                      `
                    : ""
            }

        </div>
    `;
}


function closeCart() {

    const drawer =
        document.getElementById("mainstream-cart");

    if (drawer) {
        drawer.remove();
    }
}


function checkout() {

    if (!cart.length) {
        alert("Your cart is empty.");
        return;
    }

    alert(
        "Checkout is ready to be connected to your payment gateway."
    );
}


/* =========================================================
   WISHLIST
========================================================= */

function toggleWishlistItem(id) {

    const index =
        wishlist.indexOf(id);

    if (index >= 0) {

        wishlist.splice(index, 1);

    } else {

        wishlist.push(id);
    }

    localStorage.setItem(
        "mainstream_wishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

    renderAll();
}


function updateWishlistCount() {

    const count =
        wishlist.length;

    document
        .querySelectorAll("#wishlist-count")
        .forEach(element => {
            element.textContent = count;
        });
}


function toggleWishlist() {

    const items =
        products.filter(product =>
            wishlist.includes(product.id)
        );

    if (!items.length) {

        alert("Your wishlist is empty.");

        return;
    }

    const section =
        document.getElementById(
            "product-discovery"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });
    }

    const grid =
        section?.querySelector(".products-grid") ||
        section?.querySelector(".product-grid");

    if (grid) {
        grid.innerHTML =
            items.map(renderProductCard).join("");
    }
}


/* =========================================================
   BUY NOW
========================================================= */

function buyNow(id) {

    const product =
        products.find(
            item =>
                String(item.id) === String(id)
        );

    if (!product) return;

    cart = [{
        id: product.id,
        name: product.name,
        price: product.price,
        image: getProductImage(product),
        size: selectedSize,
        quantity: 1
    }];

    localStorage.setItem(
        "mainstream_cart",
        JSON.stringify(cart)
    );

    updateCartCount();

    openCart();
}


/* =========================================================
   SEARCH
========================================================= */

function searchProducts() {

    const query =
        prompt("Search MAINSTREAM products:");

    if (!query) return;

    const search =
        query.toLowerCase().trim();

    const matches =
        products.filter(product =>
            `${product.name} ${product.category} ${product.description}`
                .toLowerCase()
                .includes(search)
        );

    const section =
        document.getElementById(
            "product-discovery"
        );

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth"
    });

    const grid =
        section.querySelector(".products-grid") ||
        section.querySelector(".product-grid") ||
        section;

    grid.innerHTML =
        matches.length
            ? matches.map(renderProductCard).join("")
            : `
                <p class="empty-message">
                    NO PRODUCTS FOUND.
                </p>
              `;
}


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMenu() {

    const menu =
        document.getElementById("menu-drawer");

    if (!menu) return;

    menu.classList.toggle("active");
}


function closeMobileMenu() {

    const menu =
        document.getElementById("menu-drawer");

    if (menu) {
        menu.classList.remove("active");
    }
}


/* =========================================================
   HERO CAROUSEL
========================================================= */

function initHeroCarousel() {

    const track =
        document.getElementById("hero-track");

    if (!track) return;

    const slides =
        Array.from(
            track.querySelectorAll(".slide")
        );

    if (slides.length < 2) return;

    let current = 0;

    function showSlide(index) {

        current = index;

        slides.forEach(
            (slide, i) => {

                slide.classList.toggle(
                    "active",
                    i === current
                );
            }
        );
    }

    showSlide(0);

    setInterval(() => {

        showSlide(
            (current + 1) %
            slides.length
        );

    }, 5000);
}


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

    document
        .querySelectorAll(
            'a[href="#printed"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    shopCategory(
                        "printed"
                    );
                }
            );
        });


    document
        .querySelectorAll(
            'a[href="#oversized"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    shopCategory(
                        "oversized"
                    );
                }
            );
        });


    document
        .querySelectorAll(
            'a[href="#hoodies"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    scrollToSection(
                        "hoodies"
                    );
                }
            );
        });


    document
        .querySelectorAll(
            'a[href="#best-sellers"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    scrollToSection(
                        "best-sellers"
                    );
                }
            );
        });


    document
        .querySelectorAll(
            'a[href="#new-drop"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    scrollToSection(
                        "new-drop"
                    );
                }
            );
        });


    document
        .querySelectorAll(
            'a[href="#graphic"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    shopCategory(
                        "printed"
                    );
                }
            );
        });
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCartCount();

        updateWishlistCount();

        initHeroCarousel();

        initNavigation();

        loadProducts();
    }
);
