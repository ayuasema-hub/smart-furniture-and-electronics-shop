function buildProductCard(p, basePath) {
    if (!p || !Number.isFinite(Number(p.price)) || Number(p.price) <= 0) return null;
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
    image.loading = 'lazy';
    image.decoding = 'async';
    imageLink.appendChild(image);

    if (p.badge) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = p.badge;
        imageLink.appendChild(badge);
    }

    const info = document.createElement('div');
    info.className = 'product-info-top';
    const title = document.createElement('a');
    title.href = productUrl;
    title.className = 'product-title';
    title.textContent = p.name;
    title.title = p.name;
    title.style.whiteSpace = 'normal';
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = formatETB(p.price);
    info.append(title, price);

    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const priceMeta = document.createElement('div');
    if (Number.isFinite(Number(p.oldPrice)) && Number(p.oldPrice) > Number(p.price)) {
        const oldPrice = document.createElement('span');
        oldPrice.className = 'old-price';
        oldPrice.textContent = formatETB(p.oldPrice);
        priceMeta.appendChild(oldPrice);
    }

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'action-circle';
    addButton.title = `Add ${p.name} to cart`;
    addButton.setAttribute('aria-label', `Add ${p.name} to cart`);
    addButton.addEventListener('click', event => {
        addProductToCart(p.id, p.name, p.price, p.image);
    });
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-cart-shopping';
    icon.style.fontSize = '11px';
    addButton.appendChild(icon);
    meta.append(priceMeta, addButton);

    card.append(imageLink, info, meta);
    return card;
}

function renderFeatured(targetSelector, count) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    el.replaceChildren(...PRODUCTS.slice(0, count).map(p => buildProductCard(p)).filter(Boolean));
}

function renderProductCollection(targetSelector, predicate, count) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const products = PRODUCTS.filter(predicate).slice(0, count).map(product => buildProductCard(product)).filter(Boolean);
    el.replaceChildren(...products);
    if (!products.length) {
        const empty = document.createElement('p');
        empty.className = 'cart-empty-msg';
        empty.textContent = 'No products are available in this collection yet.';
        el.appendChild(empty);
    }
}

function renderShopGrid(targetSelector, filters) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const selected = filters || {};
    const categories = selected.categories || selected.category || [];
    const rooms = selected.rooms || selected.room || [];
    const priceRanges = selected.priceRanges || [];
    const ratings = selected.ratings || [];
    const department = selected.department || '';
    const search = (selected.search || '').toLowerCase().trim();
    const searchMatches = search ? new Set(searchProducts(search).map(product => product.id)) : null;

    let matches = PRODUCTS.filter(p =>
        (!categories.length || categories.includes(p.category)) &&
        (!rooms.length || rooms.includes(p.room)) &&
        (!priceRanges.length || priceRanges.some(range => p.price >= range.min && p.price <= range.max)) &&
        (!ratings.length || (Number.isFinite(Number(p.rating)) && Number(p.reviewCount) > 0 && ratings.some(rating => p.rating >= rating))) &&
        (!department || getProductDepartment(p) === department) &&
        (!selected.sale || (Number(p.oldPrice) > Number(p.price) && Number(p.price) > 0)) &&
        (!searchMatches || searchMatches.has(p.id))
    );
    if (selected.sort === 'price-low') matches.sort((a, b) => a.price - b.price);
    if (selected.sort === 'price-high') matches.sort((a, b) => b.price - a.price);
    if (selected.sort === 'newest') matches.sort((a, b) => Number(String(b.badge || '').toLowerCase() === 'new') - Number(String(a.badge || '').toLowerCase() === 'new'));
    const pageSize = 12;
    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    const currentPage = Math.min(Math.max(1, Number(selected.page) || 1), totalPages);
    const resultCount = document.querySelector('#shopResultCount');
    if (resultCount) resultCount.textContent = `${matches.length} products`;
    el.replaceChildren();
    if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'cart-empty-msg';
        empty.textContent = 'No products match your filters.';
        el.appendChild(empty);
    } else {
        matches.slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map(product => buildProductCard(product)).filter(Boolean)
            .forEach(card => el.appendChild(card));
    }
    renderShopPagination(currentPage, totalPages, selected);
}

function renderShopPagination(currentPage, totalPages, filters) {
    const pagination = document.querySelector('#shopPagination');
    if (!pagination) return;
    pagination.replaceChildren();
    if (totalPages <= 1) return;
    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'page-button';
        button.textContent = String(page);
        button.setAttribute('aria-label', `Page ${page}`);
        button.setAttribute('aria-current', page === currentPage ? 'page' : 'false');
        button.disabled = page === currentPage;
        button.addEventListener('click', () => renderShopGrid('#shopGrid', { ...filters, page }));
        pagination.appendChild(button);
    }
}

function renderRelated(targetSelector, excludeId, count) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const currentProduct = getProductById(excludeId);
    const sameCategory = currentProduct ? PRODUCTS.filter(p => p.id !== excludeId && p.category === currentProduct.category) : [];
    const related = [...sameCategory, ...PRODUCTS.filter(p => p.id !== excludeId && (!currentProduct || p.category !== currentProduct.category))]
        .slice(0, count).map(p => buildProductCard(p)).filter(Boolean);
    el.replaceChildren(...related);
}
