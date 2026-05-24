(function () {
  function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  }

  function saveCart(items) {
    localStorage.setItem("cart", JSON.stringify(items));
    updateCartCount();
  }

  function addToCart(product, quantity = 1) {
    const items = getCart();
    const existing = items.find(item => item._id === product._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ ...product, quantity });
    }
    saveCart(items);
  }

  function updateQuantity(productId, quantity) {
    const nextQuantity = Math.max(1, Number(quantity));
    saveCart(getCart().map(item => item._id === productId ? { ...item, quantity: nextQuantity } : item));
  }

  function removeFromCart(productId) {
    saveCart(getCart().filter(item => item._id !== productId));
  }

  function clearCart() {
    saveCart([]);
  }

  function totals() {
    const items = getCart();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal === 0 || subtotal >= 30000 ? 0 : 120;
    return { subtotal, shippingFee, total: subtotal + shippingFee };
  }

  function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach(element => {
      element.textContent = count;
      element.style.display = count ? "grid" : "none";
    });
  }

  window.cart = { getCart, addToCart, updateQuantity, removeFromCart, clearCart, totals, updateCartCount };
  document.addEventListener("DOMContentLoaded", updateCartCount);
})();
