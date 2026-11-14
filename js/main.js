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
        badge.textContent = totalCount;
        const cartLink = badge.closest('.cart-link');
        if (cartLink) cartLink.setAttribute('aria-label', `Shopping cart, ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`);
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

    const markCurrentPage = link => {
        const currentUrl = new URL(window.location.href);
        const linkUrl = new URL(link.href, currentUrl);
        const samePath = linkUrl.pathname.toLowerCase() === currentUrl.pathname.toLowerCase();
        const filterParamsMatch = !linkUrl.pathname.toLowerCase().endsWith('/shop.html') || (
            [...linkUrl.searchParams.entries()].every(([key, value]) => currentUrl.searchParams.getAll(key).includes(value)) &&
            (linkUrl.searchParams.size > 0 || currentUrl.searchParams.size === 0)
        );
        const hashMatches = !linkUrl.hash || linkUrl.hash === currentUrl.hash;
        if (samePath && filterParamsMatch && hashMatches) link.setAttribute('aria-current', 'page');
        return link;
    };

    const closeMenus = (exceptItem = null) => {
        nav.querySelectorAll('.nav-menu-item').forEach(item => {
            if (item === exceptItem) return;
            const button = item.querySelector('.nav-menu-toggle');
            const panel = item.querySelector('.mega-menu');
            if (button && panel) {
                panel.hidden = true;
                button.setAttribute('aria-expanded', 'false');
            }
        });
    };

    nav.appendChild(markCurrentPage(createSiteLink('Home', home)));

    const menus = [
        { id: 'furniture-menu', label: 'Furniture', links: [['All furniture', 'shop.html?department=furniture'], ['Sofas & seating', 'shop.html?category=sofa'], ['Beds & bedroom furniture', 'shop.html?category=bed'], ['Dining furniture', 'shop.html?category=dining'], ['Tables & desks', 'shop.html?category=table'], ['Chairs', 'shop.html?category=chair']] },
        { id: 'electronics-menu', label: 'Electronics', links: [['All electronics', 'shop.html?department=electronics'], ['Televisions', 'shop.html?category=tv'], ['Refrigerators', 'shop.html?category=fridge'], ['Washing machines', 'shop.html?category=washer']] },
        { id: 'rooms-menu', label: 'Shop by Room', links: [['Living room', 'shop.html?room=living'], ['Bedroom', 'shop.html?room=bedroom'], ['Dining room', 'shop.html?room=dining'], ['Home office', 'shop.html?room=office'], ['Outdoor', 'shop.html?room=outdoor']] },
        { id: 'services-menu', label: 'Services', links: [['Delivery information', 'delivery.html'], ['Product assistance', 'contact.html#product-assistance'], ['Order assistance', 'contact.html#order-assistance'], ['Returns & warranty', 'returns.html'], ['Frequently asked questions', 'faq.html']] }
    ];

    menus.forEach(({ id, label, links }) => {
        const item = document.createElement('div');
        item.className = 'nav-menu-item';
        const toggle = document.createElement('button');
        toggle.className = 'nav-menu-toggle';
        toggle.type = 'button';
        toggle.textContent = label;
        toggle.id = `${id}-toggle`;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', id);
        const panel = document.createElement('div');
        panel.className = 'mega-menu';
        panel.id = id;
        panel.setAttribute('aria-label', `${label} links`);
        panel.hidden = true;
        links.forEach(([linkLabel, target]) => {
            const href = target === 'home-room-discovery' ? `${home}#shop-by-room` : siteLink(target);
            panel.appendChild(markCurrentPage(createSiteLink(linkLabel, href)));
        });
        if (panel.querySelector('[aria-current="page"]')) toggle.classList.add('is-current');
        toggle.addEventListener('click', () => {
            const opening = panel.hidden;
            closeMenus(item);
            panel.hidden = !opening;
            toggle.setAttribute('aria-expanded', String(opening));
        });
        item.addEventListener('focusout', event => {
            if (!item.contains(event.relatedTarget)) {
                panel.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        item.append(toggle, panel);
        nav.appendChild(item);
    });

    nav.appendChild(markCurrentPage(createSiteLink('Contact', siteLink('contact.html'))));

    const container = document.createElement('div');
    container.className = 'container nav-container';
    const brand = document.createElement('a');
    brand.href = home;
    brand.className = 'brand-logo';
    brand.setAttribute('aria-label', 'Top Furniture home');
    brand.innerHTML = '<span class="logo-circle" aria-hidden="true"><i class="fa-solid fa-couch"></i></span><span class="brand-text"><span class="brand-name">Top Furniture</span></span>';

    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-nav-toggle';
    mobileToggle.type = 'button';
    mobileToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', nav.id);
    mobileToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

    const searchToggle = document.createElement('button');
    searchToggle.className = 'header-search-toggle';
    searchToggle.type = 'button';
    searchToggle.setAttribute('aria-label', 'Open product search');
    searchToggle.setAttribute('aria-expanded', 'false');
    searchToggle.setAttribute('aria-controls', 'header-search-form');
    searchToggle.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';

    const searchForm = document.createElement('form');
    searchForm.className = 'header-search';
    searchForm.id = 'header-search-form';
    searchForm.hidden = true;
    searchForm.setAttribute('role', 'search');
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.name = 'q';
    searchInput.placeholder = 'Search products';
    searchInput.setAttribute('aria-label', 'Search products');
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.setAttribute('aria-controls', 'header-search-suggestions');
    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions';
    suggestions.id = 'header-search-suggestions';
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
        if (event.key === 'ArrowDown' && options.length) {
            event.preventDefault();
            options[Math.min(activeIndex + 1, options.length - 1)].focus();
        } else if (event.key === 'ArrowUp' && options.length) {
            event.preventDefault();
            if (activeIndex <= 0) searchInput.focus();
            else options[activeIndex - 1].focus();
        }
    });
    const actions = document.createElement('div');
    actions.className = 'nav-actions';
    const account = markCurrentPage(createSiteLink('Account', siteLink('login.html')));
    account.className = 'account-link';
    account.setAttribute('aria-label', 'Account access (demonstration)');
    account.title = 'Account access (demonstration)';
    const cart = markCurrentPage(createSiteLink('', siteLink('cart.html')));
    cart.className = 'nav-icon cart-link';
    cart.setAttribute('aria-label', 'Shopping cart');
    cart.innerHTML = '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><span class="cart-badge" aria-live="polite">0</span>';
    actions.append(searchToggle, account, cart);

    container.append(brand, mobileToggle, nav, actions, searchForm);
    header.replaceChildren(container);

    const setMobileNav = (open, restoreFocus = false) => {
        nav.classList.toggle('is-open', open);
        mobileToggle.setAttribute('aria-expanded', String(open));
        mobileToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        mobileToggle.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}" aria-hidden="true"></i>`;
        if (!open) closeMenus();
        if (restoreFocus) mobileToggle.focus();
    };
    const closeSearch = (restoreFocus = false) => {
        searchForm.hidden = true;
        suggestions.hidden = true;
        searchInput.setAttribute('aria-expanded', 'false');
        searchToggle.setAttribute('aria-expanded', 'false');
        searchToggle.setAttribute('aria-label', 'Open product search');
        if (restoreFocus) searchToggle.focus();
    };

    mobileToggle.addEventListener('click', () => {
        setMobileNav(!nav.classList.contains('is-open'));
    });
    searchToggle.addEventListener('click', () => {
        if (!searchForm.hidden) {
            closeSearch();
            return;
        }
        searchForm.hidden = false;
        searchToggle.setAttribute('aria-expanded', 'true');
        searchToggle.setAttribute('aria-label', 'Close product search');
        searchInput.focus();
    });
    nav.addEventListener('click', event => {
        if (event.target.closest('a') && nav.classList.contains('is-open')) setMobileNav(false);
    });
    header.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            if (!searchForm.hidden) {
                closeSearch(true);
                return;
            }
            const openToggle = nav.querySelector('.nav-menu-toggle[aria-expanded="true"]');
            if (openToggle) {
                closeMenus();
                openToggle.focus();
            } else if (nav.classList.contains('is-open')) {
                setMobileNav(false, true);
            }
        }
    });
    document.addEventListener('click', event => {
        if (!nav.contains(event.target)) closeMenus();
        if (!header.contains(event.target) && nav.classList.contains('is-open')) setMobileNav(false);
        if (!searchForm.contains(event.target) && event.target !== searchToggle && !searchToggle.contains(event.target) && !searchForm.hidden) closeSearch();
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
        const empty = document.createElement('div');
        empty.className = 'search-no-results';
        empty.setAttribute('role', 'option');
        empty.setAttribute('aria-disabled', 'true');
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
    footer.innerHTML = `<div class="container footer-grid site-footer-grid">
        <div class="footer-brand"><a href="${home}" class="footer-brand-name">Top Furniture</a><p>Furniture and home electronics for everyday living.</p></div>
        <div><h2>Shop</h2><ul><li><a href="${siteLink('shop.html')}">All products</a></li><li><a href="${siteLink('furniture.html')}">Furniture</a></li><li><a href="${siteLink('electronics.html')}">Electronics</a></li><li><a href="${siteLink('shop.html?sale=1')}">Promotions</a></li></ul></div>
        <div><h2>Customer support</h2><ul><li><a href="${siteLink('delivery.html')}">Delivery</a></li><li><a href="${siteLink('contact.html#order-assistance')}">Order assistance</a></li><li><a href="${siteLink('returns.html')}">Returns &amp; warranty</a></li><li><a href="${siteLink('faq.html')}">Frequently asked questions</a></li></ul></div>
        <div><h2>Company &amp; contact</h2><ul><li><a href="${siteLink('about.html')}">About</a></li><li><a href="${siteLink('contact.html')}">Contact</a></li><li><a href="${siteLink('privacy.html')}">Privacy</a></li><li><a href="${siteLink('terms.html')}">Terms</a></li></ul><p class="footer-contact-note">Business contact channels are awaiting confirmation.</p></div>
    </div>`;
}

// Run badge update automatically as soon as any page loads
document.addEventListener('DOMContentLoaded', () => {
    renderSiteHeader();
    renderSiteFooter();
    updateGlobalBadge();
});
