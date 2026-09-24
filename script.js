/* =========================================
   MAINSTREAM — WEBSITE JAVASCRIPT
   ========================================= */

let cart = JSON.parse(localStorage.getItem("mainstreamCart")) || [];
let wishlist = JSON.parse(localStorage.getItem("mainstreamWishlist")) || [];


/* ================================
   CART
================================ */

function saveCart() {
    localStorage.setItem("mainstreamCart", JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    const existing = cart.find(
        item => item.id === product.id && item.size === product.size
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();

    showNotification("ADDED TO CART");
}

function removeFromCart(id, size) {
    cart = cart.filter(
        item => !(item.id === id && item.size === size)
    );

    saveCart();

    if (typeof renderCart === "function") {
        renderCart();
    }
}

function changeQuantity(id, size, amount) {

    const item = cart.find(
        product => product.id === id && product.size === size
    );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(id, size);
        return;
    }

    saveCart();

    if (typeof renderCart === "function") {
        renderCart();
    }
}

function updateCartCount() {

    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    document.querySelectorAll("#cartCount").forEach(el => {
        el.textContent = count;
    });
}


/* ================================
   WISHLIST
================================ */

function toggleWishlist(product) {

    const exists = wishlist.some(
        item => item.id === product.id
    );

    if (exists) {

        wishlist = wishlist.filter(
            item => item.id !== product.id
        );

        showNotification("REMOVED FROM WISHLIST");

    } else {

        wishlist.push(product);

        showNotification("ADDED TO WISHLIST");
    }

    localStorage.setItem(
        "mainstreamWishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistButtons();
}

function updateWishlistButtons() {

    document.querySelectorAll("[data-wishlist]").forEach(button => {

        const id = button.dataset.wishlist;

        const active = wishlist.some(
            item => String(item.id) === String(id)
        );

        button.classList.toggle("active", active);

        button.innerHTML = active ? "♥" : "♡";
    });
}


/* ================================
   SEARCH
================================ */

function searchProducts() {

    const search = prompt(
        "SEARCH MAINSTREAM"
    );

    if (!search) return;

    const query = search.toLowerCase().trim();

    window.location.href =
        `shop.html?search=${encodeURIComponent(query)}`;
}


/* ================================
   OPEN CART
================================ */

function openCart() {
    window.location.href = "cart.html";
}


/* ================================
   PRODUCT PAGE
================================ */

function selectSize(button) {

    const parent = button.parentElement;

    parent.querySelectorAll(".size-option")
        .forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");

    const sizeInput =
        document.querySelector("#selectedSize");

    if (sizeInput) {
        sizeInput.value = button.dataset.size;
    }
}

function selectColor(button) {

    const parent = button.parentElement;

    parent.querySelectorAll(".color-option")
        .forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");

    const colorInput =
        document.querySelector("#selectedColor");

    if (colorInput) {
        colorInput.value = button.dataset.color;
    }
}


/* ================================
   BUY NOW
================================ */

function buyNow(product) {

    const size =
        document.querySelector(
            ".size-option.selected"
        );

    const color =
        document.querySelector(
            ".color-option.selected"
        );

    if (!size) {
        showNotification("SELECT A SIZE");
        return;
    }

    const selectedProduct = {
        ...product,
        size: size.dataset.size,
        color: color
            ? color.dataset.color
            : "Default",
        quantity: 1
    };

    localStorage.setItem(
        "mainstreamBuyNow",
        JSON.stringify(selectedProduct)
    );

    window.location.href = "cart.html";
}


/* ================================
   NOTIFICATION
================================ */

function showNotification(message) {

    let notification =
        document.querySelector(".mainstream-notification");

    if (!notification) {

        notification =
            document.createElement("div");

        notification.className =
            "mainstream-notification";

        document.body.appendChild(notification);
    }

    notification.textContent = message;

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 2200);
}


/* ================================
   SCROLL ANIMATION
================================ */

function initializeAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal, .product-card, .manifesto-card, .section-title"
        );

    if (!elements.length) return;

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }
                });

            },
            {
                threshold: 0.12
            }
        );

    elements.forEach(element => {
        observer.observe(element);
    });
}


/* ================================
   HEADER SCROLL EFFECT
================================ */

function initializeHeader() {

    const header =
        document.querySelector(".site-header");

    if (!header) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    });
}


/* ================================
   MOBILE MENU
================================ */

function toggleMenu() {

    const menu =
        document.querySelector(".mobile-menu");

    if (!menu) return;

    menu.classList.toggle("open");

    document.body.classList.toggle(
        "menu-open"
    );
}


/* ================================
   FAQ
================================ */

function initializeFAQ() {

    document.querySelectorAll(".faq-question")
        .forEach(question => {

            question.addEventListener(
                "click",
                () => {

                    const item =
                        question.parentElement;

                    item.classList.toggle(
                        "open"
                    );

                }
            );

        });
}


/* ================================
   PRODUCT IMAGE HOVER / PARALLAX
================================ */

function initializeProductImages() {

    document.querySelectorAll(
        ".product-image"
    ).forEach(image => {

        image.addEventListener(
            "mousemove",
            event => {

                const rect =
                    image.getBoundingClientRect();

                const x =
                    (event.clientX - rect.left)
                    / rect.width;

                const y =
                    (event.clientY - rect.top)
                    / rect.height;

                image.style.transform =
                    `scale(1.04) translate(${(x - .5) * 8}px, ${(y - .5) * 8}px)`;
            }
        );

        image.addEventListener(
            "mouseleave",
            () => {
                image.style.transform =
                    "scale(1)";
            }
        );

    });
}


/* ================================
   NEWSLETTER
================================ */

function subscribeNewsletter() {

    const input =
        document.querySelector(
            "#newsletterEmail"
        );

    if (!input) return;

    const email =
        input.value.trim();

    if (!email) {
        showNotification("ENTER YOUR EMAIL");
        return;
    }

    if (!email.includes("@")) {
        showNotification("ENTER A VALID EMAIL");
        return;
    }

    localStorage.setItem(
        "mainstreamSubscriber",
        email
    );

    input.value = "";

    showNotification(
        "WELCOME TO THE INNER CIRCLE"
    );
}


/* ================================
   SMOOTH SCROLL
================================ */

document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                'a[href^="#"]'
            );

        if (!link) return;

        const target =
            document.querySelector(
                link.getAttribute("href")
            );

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth"
        });

    }
);


/* ================================
   INITIALIZE
================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCartCount();
        updateWishlistButtons();

        initializeAnimations();
        initializeHeader();
        initializeFAQ();
        initializeProductImages();

    }
);
