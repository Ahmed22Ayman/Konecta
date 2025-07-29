const DISCOUNT_THRESHOLD = 30;
const DISCOUNT_PERCENTAGE = 10;

const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartContent = document.getElementById('cartContent');
const cartFooter = document.getElementById('cartFooter');
const totalAmount = document.getElementById('totalAmount');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const orderModal = document.getElementById('orderModal');
const orderSummary = document.getElementById('orderSummary');
const modalTotalAmount = document.getElementById('modalTotalAmount');
const startNewOrderBtn = document.getElementById('startNewOrderBtn');
const printReceiptBtn = document.getElementById('printReceiptBtn');

let cart = [];

const products = [
    { 
        id: 1, 
        name: "Waffle with Berries", 
        category: "Waffle", 
        price: 6.50, 
        image: "./assets/images/image-waffle-desktop.jpg"
    },
    { 
        id: 2, 
        name: "Vanilla Bean Crème Brûlée", 
        category: "Crème Brûlée", 
        price: 7.00, 
        image: "./assets/images/image-creme-brulee-desktop.jpg"
    },
    { 
        id: 3, 
        name: "Macaron Mix of Five", 
        category: "Macaron", 
        price: 8.00, 
        image: "./assets/images/image-macaron-desktop.jpg"
    },
    { 
        id: 4, 
        name: "Classic Tiramisu", 
        category: "Tiramisu", 
        price: 5.50, 
        image: "./assets/images/image-tiramisu-desktop.jpg"
    },
    { 
        id: 5, 
        name: "Pistachio Baklava", 
        category: "Baklava", 
        price: 4.00, 
        image: "./assets/images/image-baklava-desktop.jpg"
    },
    { 
        id: 6, 
        name: "Lemon Meringue Pie", 
        category: "Pie", 
        price: 5.00, 
        image: "./assets/images/image-meringue-desktop.jpg"
    },
    { 
        id: 7, 
        name: "Red Velvet Cake", 
        category: "Cake", 
        price: 4.50, 
        image: "./assets/images/image-cake-desktop.jpg"
    },
    { 
        id: 8, 
        name: "Salted Caramel Brownie", 
        category: "Brownie", 
        price: 5.50, 
        image: "./assets/images/image-brownie-desktop.jpg"
    },
    { 
        id: 9, 
        name: "Vanilla Panna Cotta", 
        category: "Panna Cotta", 
        price: 6.50, 
        image: "./assets/images/image-panna-cotta-desktop.jpg"
    }
];

function init() {
    displayProducts();
    updateCart();
    
    confirmOrderBtn.addEventListener('click', handleConfirmOrder);
    startNewOrderBtn.addEventListener('click', handleStartNewOrder);
    printReceiptBtn.addEventListener('click', handlePrintReceipt);
    
    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            closeModal();
        }
    });
}

function displayProducts() {
    productsGrid.innerHTML = products.map(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        const isInCart = quantity > 0;
        
        return `
            <div class="product-card ${isInCart ? 'selected' : ''}" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" style="${isInCart ? 'display: none;' : ''}">
                    Add to Cart
                </button>
                
                <div class="quantity-controls ${isInCart ? 'active' : ''}" data-id="${product.id}">
                    <button class="quantity-btn" onclick="decrementQuantity(${product.id})">-</button>
                    <span class="quantity-display">${quantity}</span>
                    <button class="quantity-btn" onclick="incrementQuantity(${product.id})">+</button>
                </div>
                
                <div class="product-info">
                    <p class="product-category">${product.category}</p>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    displayProducts();
}

function incrementQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += 1;
        updateCart();
        displayProducts();
    }
}

function decrementQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
        } else {
            removeFromCart(productId);
            return;
        }
        updateCart();
        displayProducts();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    displayProducts();
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <p>Your added items will appear here</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartContent.innerHTML = `
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="cart-item-details">
                                <span class="cart-item-quantity">${item.quantity}x</span>
                                <span class="cart-item-price">@ $${item.price.toFixed(2)}</span>
                                <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">
                            <p>X</p>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        cartFooter.style.display = 'block';
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_PERCENTAGE / 100 : 0;
    const total = subtotal - discount;
    
    totalAmount.textContent = `$${total.toFixed(2)}`;
}

function handleConfirmOrder() {
    if (cart.length === 0) return;
    
    orderSummary.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-info">
                <h4 class="order-item-name">${item.name}</h4>
                <div class="order-item-details">
                    <span class="order-item-quantity">${item.quantity}x</span>
                    <span class="order-item-price">@ ${item.price.toFixed(2)}</span>
                </div>
            </div>
            <span class="order-item-total">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_PERCENTAGE / 100 : 0;
    const total = subtotal - discount;
    
    modalTotalAmount.textContent = `${total.toFixed(2)}`;
    
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleStartNewOrder() {
    cart = [];
    updateCart();
    displayProducts();
    closeModal();
}

function handlePrintReceipt() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_PERCENTAGE / 100 : 0;
    const total = subtotal - discount;
    
    const receiptContent = `
========================================
            DESSERTS RECEIPT
========================================
Date: ${new Date().toLocaleString()}

${cart.map(item => 
    `${item.name}\n${item.quantity}x @ ${item.price.toFixed(2)} = ${(item.price * item.quantity).toFixed(2)}`
).join('\n\n')}

----------------------------------------
Subtotal: ${subtotal.toFixed(2)}
${discount > 0 ? `Discount (10%): -${discount.toFixed(2)}\n` : ''}Total: ${total.toFixed(2)}
----------------------------------------

Thank you for your order!
Have a wonderful day!
========================================
    `;
    
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt</title>
            </head>
            <body>
                <pre>${receiptContent}</pre>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function closeModal() {
    orderModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', init);