// ==========================================
// SHARED E-COMMERCE JAVASCRIPT (main.js)
// ==========================================

function formatETB(n) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ETB';
}

const defaultCart = [];

// Initialize localStorage cart if it doesn't exist yet
function getCart() {
    let cart = localStorage.getItem('furniture_cart');
    if (!cart) {
        cart = JSON.stringify(defaultCart);
        localStorage.setItem('furniture_cart', cart);
        return JSON.parse(cart);
    }
    const parsed = JSON.parse(cart);
    let migrated = false;
    parsed.forEach(item => {
        if (!item.id && typeof PRODUCTS !== 'undefined') {
            const match = PRODUCTS.find(product => product.name === item.name);
            if (match) {
                item.id = match.id;
                migrated = true;
            }
        }
    });
    if (migrated) localStorage.setItem('furniture_cart', JSON.stringify(parsed));
    return parsed;
}

function saveCart(cart) {
    localStorage.setItem('furniture_cart', JSON.stringify(cart));
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
function addProductToCart(productId, productName, productPrice, productImage) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            qty: 1,
            image: productImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"
        });
    }

    saveCart(cart);
    alert(`"${productName}" has been successfully added to your cart!`);
}

// Run badge update automatically as soon as any page loads
document.addEventListener('DOMContentLoaded', () => {
    updateGlobalBadge();
});