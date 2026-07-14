/* =========================================================
   CARRITO DE COMPRAS - ViaGO.pe
   Basado en localStorage (no requiere backend).
   Incluir este script en TODAS las páginas, antes de </body>.
========================================================= */

const CART_KEY = 'viago_cart';
const WHATSAPP_NUMBER = '942169773'; // mismo número que ya usas en el sitio

/* ---------- Utilidades de datos ---------- */

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

// item = { id, nombre, precio, cantidad, imagen }
function addToCart(item) {
    const cart = getCart();
    const existente = cart.find(p => p.id === item.id);

    if (existente) {
        existente.cantidad += item.cantidad || 1;
    } else {
        cart.push({ ...item, cantidad: item.cantidad || 1 });
    }

    saveCart(cart);
    showCartToast(`"${item.nombre}" se agregó al carrito`);
}

function removeFromCart(id) {
    const cart = getCart().filter(p => p.id !== id);
    saveCart(cart);
}

function updateQuantity(id, cantidad) {
    const cart = getCart();
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.cantidad = cantidad;
    if (item.cantidad <= 0) {
        return removeFromCart(id);
    }
    saveCart(cart);
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}

function getCartTotal() {
    return getCart().reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

function getCartCount() {
    return getCart().reduce((total, item) => total + item.cantidad, 0);
}

/* ---------- Interfaz: contador en el navbar ---------- */

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

/* ---------- Aviso flotante al agregar un producto ---------- */

function showCartToast(mensaje) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${mensaje}`;
    toast.classList.add('show');

    clearTimeout(window._cartToastTimeout);
    window._cartToastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

/* ---------- Enviar el pedido por WhatsApp ---------- */

function buildWhatsAppMessage() {
    const cart = getCart();
    if (cart.length === 0) return null;

    let mensaje = 'Hola ViaGO 👋, quiero reservar los siguientes planes:%0A%0A';
    cart.forEach(item => {
        mensaje += `• ${item.nombre} x${item.cantidad} — S/ ${(item.precio * item.cantidad).toFixed(2)}%0A`;
    });
    mensaje += `%0ATotal: S/ ${getCartTotal().toFixed(2)}`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`;
}

function sendCartToWhatsApp() {
    const url = buildWhatsAppMessage();
    if (!url) {
        showCartToast('Tu carrito está vacío');
        return;
    }
    window.open(url, '_blank');
}

/* ---------- Inicialización automática ---------- */

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Cualquier botón con atributo data-add-to-cart agrega ese plan al carrito
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart({
                id: btn.dataset.id,
                nombre: btn.dataset.nombre,
                precio: parseFloat(btn.dataset.precio),
                imagen: btn.dataset.imagen || ''
            });
        });
    });
});
