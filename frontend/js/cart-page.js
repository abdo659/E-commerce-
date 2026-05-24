function renderCartPage() {
  const items = window.cart.getCart();
  const itemsContainer = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  const totals = window.cart.totals();

  if (!items.length) {
    itemsContainer.innerHTML = `<h2>Your cart is empty</h2><p>Start shopping to add electronics to your cart.</p><a class="primary-btn" href="shop.html">Shop Now</a>`;
    summary.innerHTML = `<h2>Order Summary</h2><p>No items yet.</p>`;
    return;
  }

  itemsContainer.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>${window.shopApi.money(item.price)}</p>
        <button class="link-button" data-remove="${item._id}" style="color:#b42318;">Remove</button>
      </div>
      <div class="qty">
        <button data-minus="${item._id}">-</button>
        <strong>${item.quantity}</strong>
        <button data-plus="${item._id}">+</button>
      </div>
    </div>
  `).join("");

  summary.innerHTML = `
    <h2>Order Summary</h2>
    <div class="summary-line"><span>Subtotal</span><span>${window.shopApi.money(totals.subtotal)}</span></div>
    <div class="summary-line"><span>Shipping</span><span>${totals.shippingFee ? window.shopApi.money(totals.shippingFee) : "Free"}</span></div>
    <div class="summary-line summary-total"><span>Total</span><span>${window.shopApi.money(totals.total)}</span></div>
    <a class="primary-btn" href="checkout.html" style="width:100%;margin-top:18px;">Checkout</a>
  `;

  itemsContainer.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    window.cart.removeFromCart(button.dataset.remove);
    renderCartPage();
  }));
  itemsContainer.querySelectorAll("[data-minus]").forEach(button => button.addEventListener("click", () => {
    const item = window.cart.getCart().find(item => item._id === button.dataset.minus);
    window.cart.updateQuantity(button.dataset.minus, item.quantity - 1);
    renderCartPage();
  }));
  itemsContainer.querySelectorAll("[data-plus]").forEach(button => button.addEventListener("click", () => {
    const item = window.cart.getCart().find(item => item._id === button.dataset.plus);
    window.cart.updateQuantity(button.dataset.plus, item.quantity + 1);
    renderCartPage();
  }));
}

document.addEventListener("DOMContentLoaded", renderCartPage);
