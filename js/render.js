function buildProductCard(p, basePath) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = p.id;
    card.dataset.category = p.category;
    card.dataset.room = p.room;

    const prefix = basePath !== undefined
        ? basePath
        : (window.location.pathname.includes('/pages/') ? '' : 'pages/');
    const productUrl = `${prefix}product.html?id=${encodeURIComponent(p.id)}`;
    const imageLink = document.createElement('a');
    imageLink.href = productUrl;
    imageLink.className = 'product-img-wrap';
    const image = document.createElement('img');
    image.src = p.image;
    image.alt = p.name;
    imageLink.appendChild(image);

    const info = document.createElement('div');
    info.className = 'product-info-top';
    const title = document.createElement('a');
    title.href = productUrl;
    title.className = 'product-title';
    title.textContent = p.name;
    title.title = p.name;
    title.style.whiteSpace = 'nowrap';
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';
    title.style.maxWidth = '100%';
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = formatETB(p.price);
    price.style.whiteSpace = 'nowrap';
    price.style.fontSize = '14px';
    price.style.fontWeight = '700';
    info.append(title, price);

    const stars = document.createElement('div');
    stars.className = 'product-stars';
    const fullStars = Math.floor(p.rating);
    const hasHalf = (p.rating - fullStars) >= 0.25;
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        if (i < fullStars) {
            star.className = 'fa-solid fa-star';
        } else if (hasHalf && i === fullStars) {
            star.className = 'fa-solid fa-star-half-stroke';
        } else {
            star.className = 'fa-regular fa-star';
        }
        stars.appendChild(star);
    }

    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const priceMeta = document.createElement('div');
    const rating = document.createElement('span');
    rating.className = 'badge-dark';
    rating.textContent = `${p.rating.toFixed(1)} rating`;
    const oldPrice = document.createElement('span');
    oldPrice.className = 'old-price';
    oldPrice.textContent = formatETB(p.oldPrice);
    priceMeta.append(rating, oldPrice);
    if (p.badge) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = p.badge;
        priceMeta.appendChild(badge);
    }

    const addButton = document.createElement('a');
    addButton.href = '#';
    addButton.className = 'action-circle';
    addButton.title = 'Add to Cart';
    addButton.addEventListener('click', event => {
        event.preventDefault();
        addProductToCart(p.id, p.name, p.price, p.image);
    });
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-cart-shopping';
    icon.style.fontSize = '11px';
    addButton.appendChild(icon);
    meta.append(priceMeta, addButton);

    card.append(imageLink, info, stars, meta);
    return card;
}

function renderFeatured(targetSelector, count) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    el.replaceChildren(...PRODUCTS.slice(0, count).map(p => buildProductCard(p)));
}

function renderShopGrid(targetSelector, filters) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const selected = filters || {};
    const categories = selected.categories || selected.category || [];
    const rooms = selected.rooms || selected.room || [];
    const priceRanges = selected.priceRanges || [];
    const ratings = selected.ratings || [];
    const search = (selected.search || '').toLowerCase().trim();

    const matches = PRODUCTS.filter(p =>
        (!categories.length || categories.includes(p.category)) &&
        (!rooms.length || rooms.includes(p.room)) &&
        (!priceRanges.length || priceRanges.some(range => p.price >= range.min && p.price <= range.max)) &&
        (!ratings.length || ratings.some(rating => p.rating >= rating)) &&
        (!search || `${p.name} ${p.description}`.toLowerCase().includes(search))
    );
    if (selected.sort === 'price-low') matches.sort((a, b) => a.price - b.price);
    if (selected.sort === 'price-high') matches.sort((a, b) => b.price - a.price);
    if (selected.sort === 'rating') matches.sort((a, b) => b.rating - a.rating);
    el.replaceChildren();
    if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'cart-empty-msg';
        empty.textContent = 'No products match your filters.';
        el.appendChild(empty);
        return;
    }
    matches.forEach(product => el.appendChild(buildProductCard(product)));
}

function renderRelated(targetSelector, excludeId, count) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    el.replaceChildren(...PRODUCTS.filter(p => p.id !== excludeId).slice(0, count).map(p => buildProductCard(p)));
}
