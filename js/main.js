// ==========================================
// SHARED E-COMMERCE JAVASCRIPT (main.js)
// ==========================================

function formatETB(n) {
    const value = Number(n);
    return (Number.isFinite(value) ? value : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ETB';
}

const defaultCart = [];

// Initialize localStorage cart if it doesn't exist yet
function getCart() {
    let stored;
    try { stored = JSON.parse(localStorage.getItem('furniture_cart') || '[]'); } catch (error) { stored = []; }
    if (!Array.isArray(stored)) stored = [];
    const cart = stored.map(item => {
        if (!item || typeof item !== 'object' || typeof PRODUCTS === 'undefined') return null;
        const product = getProductById(item.id) || PRODUCTS.find(candidate => candidate.name === item.name);
        if (!product || !Number.isFinite(Number(product.price)) || Number(product.price) <= 0) return null;
        const quantity = Math.floor(Number(item.qty));
        return { id: product.id, name: product.name, price: Number(product.price), qty: Number.isFinite(quantity) && quantity > 0 ? Math.min(quantity, 99) : 1, image: product.image };
    }).filter(Boolean);
    if (JSON.stringify(stored) !== JSON.stringify(cart)) {
        try { localStorage.setItem('furniture_cart', JSON.stringify(cart)); } catch (error) { /* storage may be unavailable */ }
    }
    return cart;
}

function saveCart(cart) {
    try { localStorage.setItem('furniture_cart', JSON.stringify(Array.isArray(cart) ? cart : [])); } catch (error) { /* storage may be unavailable */ }
    updateGlobalBadge();
}

// Update the red/gold notification count on the shopping bag icon across all pages
function updateGlobalBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // Find all badge elements on the current page
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.innerText = totalCount;
    });
}

// Universal function to add any product to the cart from Homepage or Shop catalog
function addProductToCart(productId, productName, productPrice, productImage, quantity) {
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    if (!product || !Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
        alert('This product is not available in the current catalogue.');
        return false;
    }
    const amount = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)));
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].qty = Math.min(99, cart[existingIndex].qty + amount);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            qty: amount,
            image: product.image
        });
    }

    saveCart(cart);
    alert(`"${product.name}" added to your cart.`);
    return true;
}

function siteLink(page) {
    return window.location.pathname.includes('/pages/') ? page : `pages/${page}`;
}

function createSiteLink(label, href) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    return link;
}

function renderSiteHeader() {
    const header = document.querySelector('.navbar');
    if (!header) return;

    const home = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    const nav = document.createElement('nav');
    nav.className = 'nav-links';
    nav.id = 'primary-navigation';
    nav.setAttribute('aria-label', 'Main navigation');

    const menus = [
        { label: 'Furniture', links: [['Sofas & seating', 'shop.html?category=sofa'], ['Beds & bedroom', 'shop.html?category=bed'], ['Dining', 'shop.html?category=dining'], ['Tables & desks', 'shop.html?category=table']] },
        { label: 'Electronics', links: [['Televisions', 'shop.html?category=tv'], ['Refrigerators', 'shop.html?category=fridge'], ['Washing machines', 'shop.html?category=washer']] },
        { label: 'Rooms', links: [['Living room', 'shop.html?room=living'], ['Bedroom', 'shop.html?room=bedroom'], ['Dining room', 'shop.html?room=dining'], ['Home office', 'shop.html?room=office'], ['Outdoor', 'shop.html?room=outdoor']] },
        { label: 'Styles', links: [['All furniture', 'shop.html?department=furniture'], ['Browse the collection', 'shop.html']] }
    ];

    menus.forEach(menu => {
        const item = document.createElement('div');
        item.className = 'nav-menu-item';
        const toggle = document.createElement('button');
        toggle.className = 'nav-menu-toggle';
        toggle.type = 'button';
        toggle.textContent = menu.label;
        toggle.setAttribute('aria-expanded', 'false');
        const panel = document.createElement('div');
        panel.className = 'mega-menu';
        panel.hidden = true;
        menu.links.forEach(([label, target]) => panel.appendChild(createSiteLink(label, siteLink(target))));
        toggle.addEventListener('click', () => {
            const opening = panel.hidden;
            nav.querySelectorAll('.mega-menu').forEach(menuPanel => { menuPanel.hidden = true; });
            nav.querySelectorAll('.nav-menu-toggle').forEach(button => button.setAttribute('aria-expanded', 'false'));
            panel.hidden = !opening;
            toggle.setAttribute('aria-expanded', String(opening));
        });
        item.append(toggle, panel);
        nav.appendChild(item);
    });

    nav.appendChild(createSiteLink('Sale', siteLink('shop.html?sale=1')));
    const services = document.createElement('div');
    services.className = 'nav-menu-item';
    const servicesToggle = document.createElement('button');
    servicesToggle.className = 'nav-menu-toggle';
    servicesToggle.type = 'button';
    servicesToggle.textContent = 'Services';
    servicesToggle.setAttribute('aria-expanded', 'false');
    const servicesPanel = document.createElement('div');
    servicesPanel.className = 'mega-menu';
    servicesPanel.hidden = true;
    [['Delivery information', 'delivery.html'], ['Returns & warranty', 'returns.html'], ['Frequently asked questions', 'faq.html']]
        .forEach(([label, page]) => servicesPanel.appendChild(createSiteLink(label, siteLink(page))));
    servicesToggle.addEventListener('click', () => {
        const opening = servicesPanel.hidden;
        nav.querySelectorAll('.mega-menu').forEach(menuPanel => { menuPanel.hidden = true; });
        nav.querySelectorAll('.nav-menu-toggle').forEach(button => button.setAttribute('aria-expanded', 'false'));
        servicesPanel.hidden = !opening;
        servicesToggle.setAttribute('aria-expanded', String(opening));
    });
    services.append(servicesToggle, servicesPanel);
    nav.appendChild(services);

    const container = document.createElement('div');
    container.className = 'container nav-container';
    const brand = document.createElement('a');
    brand.href = home;
    brand.className = 'brand-logo';
    brand.setAttribute('aria-label', 'Furniture Roomstore home');
    brand.innerHTML = '<span class="logo-circle" aria-hidden="true"><i class="fa-solid fa-couch"></i></span><span class="brand-text"><span class="brand-name">Furniture &amp; Appliances</span><span>Roomstore</span></span>';

    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-nav-toggle';
    mobileToggle.type = 'button';
    mobileToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', nav.id);
    mobileToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

    const searchForm = document.createElement('form');
    searchForm.className = 'header-search';
    searchForm.setAttribute('role', 'search');
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.name = 'q';
    searchInput.placeholder = 'Search products';
    searchInput.setAttribute('aria-label', 'Search products');
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-expanded', 'false');
    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions';
    suggestions.setAttribute('role', 'listbox');
    suggestions.hidden = true;
    const searchButton = document.createElement('button');
    searchButton.type = 'submit';
    searchButton.setAttribute('aria-label', 'Submit product search');
    searchButton.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
    searchForm.append(searchInput, searchButton, suggestions);

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (query) window.location.href = `${siteLink('search.html')}?q=${encodeURIComponent(query)}`;
    });
    searchInput.addEventListener('input', () => renderSearchSuggestions(searchInput, suggestions));
    searchForm.addEventListener('keydown', event => {
        const options = [...suggestions.querySelectorAll('.search-suggestion')];
        const activeIndex = options.indexOf(document.activeElement);
        if (event.key === 'Escape') {
            suggestions.hidden = true;
            searchInput.setAttribute('aria-expanded', 'false');
            searchInput.focus();
        } else if (event.key === 'ArrowDown' && options.length) {
            event.preventDefault();
            options[Math.min(activeIndex + 1, options.length - 1)].focus();
        } else if (event.key === 'ArrowUp' && options.length) {
            event.preventDefault();
            if (activeIndex <= 0) searchInput.focus();
            else options[activeIndex - 1].focus();
        }
    });
    document.addEventListener('click', event => {
        if (!searchForm.contains(event.target)) {
            suggestions.hidden = true;
            searchInput.setAttribute('aria-expanded', 'false');
        }
    });

    const actions = document.createElement('div');
    actions.className = 'nav-actions';
    const account = createSiteLink('Account', siteLink('login.html'));
    account.className = 'account-link';
    const cart = createSiteLink('', siteLink('cart.html'));
    cart.className = 'nav-icon cart-link';
    cart.setAttribute('aria-label', 'Shopping cart');
    cart.innerHTML = '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><span class="cart-badge" aria-live="polite">0</span>';
    actions.append(account, cart);

    container.append(brand, mobileToggle, searchForm, nav, actions);
    header.replaceChildren(container);
    mobileToggle.addEventListener('click', () => {
        const opening = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', opening);
        mobileToggle.setAttribute('aria-expanded', String(opening));
        mobileToggle.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu');
        mobileToggle.innerHTML = `<i class="fa-solid ${opening ? 'fa-xmark' : 'fa-bars'}" aria-hidden="true"></i>`;
    });
    header.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            nav.querySelectorAll('.mega-menu').forEach(panel => { panel.hidden = true; });
            nav.querySelectorAll('.nav-menu-toggle').forEach(button => button.setAttribute('aria-expanded', 'false'));
        }
    });
}

function renderSearchSuggestions(input, panel) {
    panel.replaceChildren();
    const query = input.value.trim().toLowerCase();
    if (!query || typeof PRODUCTS === 'undefined') {
        panel.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        return;
    }
    const matches = searchProducts(query).slice(0, 5);
    matches.forEach(product => {
        const option = document.createElement('a');
        option.className = 'search-suggestion';
        option.setAttribute('role', 'option');
        option.href = `${siteLink('product.html')}?id=${encodeURIComponent(product.id)}`;
        const image = document.createElement('img');
        image.src = product.image;
        image.alt = '';
        image.loading = 'lazy';
        const label = document.createElement('span');
        label.textContent = product.name;
        option.append(image, label);
        panel.appendChild(option);
    });
    if (!matches.length) {
        const empty = document.createElement('p');
        empty.className = 'search-no-results';
        empty.textContent = 'No matching products. Press Enter to view search results.';
        panel.appendChild(empty);
    }
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
}

function renderSiteFooter() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    const home = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    const shop = siteLink('shop.html');
    footer.innerHTML = `<div class="container footer-grid site-footer-grid">
        <div class="footer-brand"><a href="${home}" class="footer-brand-name">Furniture Roomstore</a><p>Furniture and electronics for the home.</p></div>
        <div><h2>Shop</h2><ul><li><a href="${shop}?department=furniture">Furniture</a></li><li><a href="${shop}?department=electronics">Electronics</a></li><li><a href="${shop}?sale=1">Sale</a></li><li><a href="${shop}?sort=newest">New arrivals</a></li></ul></div>
        <div><h2>Company</h2><ul><li><a href="${siteLink('about.html')}">About</a></li><li><a href="${siteLink('contact.html')}">Contact</a></li></ul></div>
        <div><h2>Services</h2><ul><li><a href="${siteLink('delivery.html')}">Delivery</a></li><li><a href="${siteLink('returns.html')}">Returns &amp; warranty</a></li><li><a href="${siteLink('faq.html')}">FAQ</a></li><li><a href="${siteLink('contact.html')}">Contact support</a></li></ul></div>
        <div><h2>Account &amp; legal</h2><ul><li><a href="${siteLink('login.html')}">My account</a></li><li><a href="${siteLink('cart.html')}">Cart</a></li><li><a href="${siteLink('privacy.html')}">Privacy template</a></li><li><a href="${siteLink('terms.html')}">Terms template</a></li></ul></div>
    </div>`;
}

// Run badge update automatically as soon as any page loads
document.addEventListener('DOMContentLoaded', () => {
    renderSiteHeader();
    renderSiteFooter();
    updateGlobalBadge();
});