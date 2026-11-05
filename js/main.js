// ==========================================
// SHARED E-COMMERCE JAVASCRIPT (main.js)
// ==========================================

// Default initial cart items if local storage is empty
const defaultCart = [
    { name: "Mondino armchair", price: 24.50, qty: 1, image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=400&q=80" },
    { name: "Elenora bed", price: 94.00, qty: 1, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80" },
    { name: "Furnase armchair", price: 24.00, qty: 1, image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80" }
];

// Initialize localStorage cart if it doesn't exist yet
function getCart() {
    let cart = localStorage.getItem('furniture_cart');
    if (!cart) {
        cart = JSON.stringify(defaultCart);
        localStorage.setItem('furniture_cart', cart);
    }
    return JSON.parse(cart);
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
function addProductToCart(productName, productPrice, productImage) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.name === productName);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
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