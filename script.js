// ========== ДАННЫЕ ==========
const restaurantsData = [
    { id: 1, name: 'Пицца Хаус', address: 'ул. Центральная 1', work_hours: '09:00-22:00', image: '🍕' },
    { id: 2, name: 'Суши Тайм', address: 'ул. Молодежная 5', work_hours: '10:00-23:00', image: '🍣' },
    { id: 3, name: 'Додо Пицца', address: 'ул. Ленина 8', work_hours: '08:00-23:00', image: '🍕' },
    { id: 4, name: 'Бургер Кинг', address: 'ул. Мира 17', work_hours: '09:00-23:00', image: '🍔' },
    { id: 5, name: 'KFC', address: 'ул. Гагарина 21', work_hours: '09:00-22:00', image: '🍗' }
];

const dishesData = [
    { id: 1, restaurant_id: 1, name: 'Пицца Пепперони', description: 'Острая пицца', price: 650 },
    { id: 2, restaurant_id: 1, name: 'Маргарита', description: 'Классическая пицца', price: 550 },
    { id: 3, restaurant_id: 1, name: '4 Сыра', description: 'Сырная пицца', price: 790 },
    { id: 4, restaurant_id: 2, name: 'Филадельфия', description: 'Роллы с лососем', price: 750 },
    { id: 5, restaurant_id: 2, name: 'Калифорния', description: 'Роллы с крабом', price: 690 },
    { id: 6, restaurant_id: 3, name: 'Пицца Ветчина и грибы', description: 'Тонкое тесто', price: 720 },
    { id: 7, restaurant_id: 4, name: 'Чизбургер', description: 'Говядина и сыр', price: 280 },
    { id: 8, restaurant_id: 4, name: 'Воппер', description: 'Большой бургер', price: 420 },
    { id: 9, restaurant_id: 5, name: 'Баскет Дуэт', description: 'Курица', price: 499 },
    { id: 10, restaurant_id: 5, name: 'Твистер', description: 'Лаваш с курицей', price: 269 }
];

// ========== СОСТОЯНИЕ ==========
let currentUser = JSON.parse(localStorage.getItem('foodUser')) || null;
let cart = JSON.parse(localStorage.getItem('foodCart')) || [];
let orders = JSON.parse(localStorage.getItem('foodOrders')) || [];

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function saveState() {
    localStorage.setItem('foodUser', JSON.stringify(currentUser));
    localStorage.setItem('foodCart', JSON.stringify(cart));
    localStorage.setItem('foodOrders', JSON.stringify(orders));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// ========== НАВИГАЦИЯ ==========
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    if (page === 'cart') renderCart();
    if (page === 'orders') renderOrders();
    if (page === 'profile') renderProfile();
    if (page === 'main') renderRestaurants();
}

// ========== ГЛАВНАЯ ==========
function renderRestaurants(filter = '') {
    const container = document.getElementById('restaurantList');
    container.innerHTML = '';
    const filtered = restaurantsData.filter(r =>
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        r.address.toLowerCase().includes(filter.toLowerCase())
    );
    filtered.forEach(r => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card restaurant-card h-100 shadow-sm" onclick="openRestaurant(${r.id})">
                <div class="card-body text-center">
                    <div style="font-size: 3rem;">${r.image}</div>
                    <h5 class="card-title mt-2">${r.name}</h5>
                    <p class="card-text"><small class="text-muted">${r.address}</small><br>${r.work_hours}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

function filterRestaurants() {
    const val = document.getElementById('searchInput').value;
    renderRestaurants(val);
}

function openRestaurant(id) {
    const resto = restaurantsData.find(r => r.id === id);
    if (!resto) return;
    document.getElementById('restoName').textContent = resto.name + ' ' + resto.image;
    document.getElementById('restoAddress').textContent = resto.address + ' • ' + resto.work_hours;
    const dishContainer = document.getElementById('dishList');
    dishContainer.innerHTML = '';
    const dishes = dishesData.filter(d => d.restaurant_id === id);
    dishes.forEach(d => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card dish-card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${d.name}</h5>
                    <p class="card-text">${d.description}</p>
                    <p class="fw-bold text-danger">${d.price} ₽</p>
                    <button class="btn btn-danger-custom btn-sm" onclick="addToCart(${d.id}, '${d.name}', ${d.price})">В корзину</button>
                </div>
            </div>
        `;
        dishContainer.appendChild(col);
    });
    showPage('restaurant');
}

// ========== КОРЗИНА ==========
function addToCart(dishId, name, price) {
    const existing = cart.find(item => item.id === dishId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: dishId, name, price, quantity: 1 });
    }
    saveState();
    updateCartCount();
    alert(`'${name}' добавлен в корзину`);
}

function removeFromCart(dishId) {
    cart = cart.filter(item => item.id !== dishId);
    saveState();
    renderCart();
    updateCartCount();
}

function changeQuantity(dishId, delta) {
    const item = cart.find(i => i.id === dishId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(dishId);
    } else {
        saveState();
        renderCart();
        updateCartCount();
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('totalPrice');
    if (cart.length === 0) {
        container.innerHTML = '<p>Корзина пуста</p>';
        totalEl.textContent = '0 ₽';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item d-flex justify-content-between align-items-center">
                <div><strong>${item.name}</strong> (${item.price} ₽)</div>
                <div>
                    <button class="btn btn-outline-secondary btn-sm" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-outline-secondary btn-sm" onclick="changeQuantity(${item.id}, 1)">+</button>
                    <button class="btn btn-outline-danger btn-sm ms-2" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    totalEl.textContent = total + ' ₽';
}

function goToCheckout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    showPage('checkout');
}

// ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========
function submitOrder(e) {
    e.preventDefault();
    if (!currentUser) {
        alert('Пожалуйста, войдите в аккаунт');
        showPage('login');
        return;
    }
    const address = document.getElementById('addressInput').value.trim();
    if (!address) {
        alert('Введите адрес доставки');
        return;
    }
    const payment = document.getElementById('paymentSelect').value;
    const comment = document.getElementById('commentInput').value.trim();
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = {
        id: Date.now(),
        customer: currentUser.name,
        address: address,
        payment: payment,
        comment: comment,
        total: total,
        items: JSON.parse(JSON.stringify(cart)),
        status: 'В обработке',
        date: new Date().toLocaleString()
    };
    orders.unshift(order);
    cart = [];
    saveState();
    updateCartCount();
    alert('Заказ оформлен! Номер: ' + order.id);
    showPage('orders');
    renderOrders();
    document.getElementById('checkoutForm').reset();
}

// ========== ИСТОРИЯ ЗАКАЗОВ ==========
function renderOrders() {
    const container = document.getElementById('ordersList');
    if (orders.length === 0) {
        container.innerHTML = '<p>У вас пока нет заказов</p>';
        return;
    }
    let html = '';
    orders.forEach(o => {
        const statusClass = o.status === 'Доставлен' ? 'status-delivered' : (o.status === 'Отменён' ? 'status-cancelled' : 'status-pending');
        html += `
            <div class="card mb-3 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5>Заказ #${o.id}</h5>
                        <span class="order-status ${statusClass}">${o.status}</span>
                    </div>
                    <p><small>${o.date}</small></p>
                    <p>Сумма: <strong>${o.total} ₽</strong></p>
                    <p>Адрес: ${o.address}</p>
                    <p>Состав: ${o.items.map(i => i.name + ' x' + i.quantity).join(', ')}</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="repeatOrder(${o.id})">Повторить заказ</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function repeatOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    order.items.forEach(item => {
        addToCart(item.id, item.name, item.price);
    });
    showPage('cart');
}

// ========== ПРОФИЛЬ ==========
function renderProfile() {
    if (!currentUser) {
        document.getElementById('userName').textContent = 'Гость';
        document.getElementById('userEmail').textContent = 'не указан';
        document.getElementById('userBonus').textContent = '0';
        document.getElementById('addressList').innerHTML = '';
        return;
    }
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userBonus').textContent = currentUser.bonus || 0;
    const addrList = document.getElementById('addressList');
    addrList.innerHTML = '';
    (currentUser.addresses || []).forEach(addr => {
        const li = document.createElement('li');
        li.textContent = addr;
        addrList.appendChild(li);
    });
}

function addAddress() {
    if (!currentUser) {
        alert('Войдите в аккаунт');
        return;
    }
    const addr = prompt('Введите новый адрес:');
    if (addr) {
        if (!currentUser.addresses) currentUser.addresses = [];
        currentUser.addresses.push(addr);
        saveState();
        renderProfile();
    }
}

// ========== АВТОРИЗАЦИЯ ==========
function login(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('foodUsers')) || [];
    let user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        if (email === 'ivan@mail.ru' && password === '123') {
            user = { name: 'Иванов Иван', email: 'ivan@mail.ru', bonus: 150, addresses: ['ул. Ленина 10'] };
        } else {
            alert('Неверный email или пароль');
            return;
        }
    }
    currentUser = user;
    saveState();
    document.getElementById('authNav').innerHTML = `<span class="me-2">${user.name}</span> <button class="btn btn-outline-danger btn-sm" onclick="logout()">Выйти</button>`;
    showPage('main');
    renderRestaurants();
    updateCartCount();
}

function register(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    if (!name || !email || !password) {
        alert('Заполните все обязательные поля');
        return;
    }
    const users = JSON.parse(localStorage.getItem('foodUsers')) || [];
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    const newUser = { name, email, phone, password, bonus: 0, addresses: address ? [address] : [] };
    users.push(newUser);
    localStorage.setItem('foodUsers', JSON.stringify(users));
    currentUser = newUser;
    saveState();
    document.getElementById('authNav').innerHTML = `<span class="me-2">${name}</span> <button class="btn btn-outline-danger btn-sm" onclick="logout()">Выйти</button>`;
    showPage('main');
    renderRestaurants();
    updateCartCount();
    alert('Регистрация успешна!');
}

function showRegister() {
    showPage('register');
}

function logout() {
    if (confirm('Выйти из аккаунта?')) {
        currentUser = null;
        saveState();
        document.getElementById('authNav').innerHTML = `<a class="btn btn-danger btn-sm" href="#" onclick="showPage('login')">Войти</a>`;
        showPage('main');
        renderRestaurants();
        renderProfile();
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function init() {
    if (currentUser) {
        document.getElementById('authNav').innerHTML = `<span class="me-2">${currentUser.name}</span> <button class="btn btn-outline-danger btn-sm" onclick="logout()">Выйти</button>`;
    }
    renderRestaurants();
    updateCartCount();
    renderProfile();
    showPage('main');
}

document.addEventListener('DOMContentLoaded', init);