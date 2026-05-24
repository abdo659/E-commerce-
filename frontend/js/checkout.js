document.addEventListener("DOMContentLoaded", () => {
  const user = window.auth.currentUser();
  const items = window.cart.getCart();
  const totals = window.cart.totals();
  const summary = document.getElementById("checkoutSummary");
  const message = document.getElementById("checkoutMessage");

  if (!user) {
    message.textContent = "Please login before checkout.";
  }

  if (!items.length) {
    summary.innerHTML = `<h2>Your cart is empty</h2><a class="primary-btn" href="shop.html">Shop Now</a>`;
    return;
  }

  summary.innerHTML = `
    <h2>Order Summary</h2>
    ${items.map(item => `<div class="summary-line"><span>${item.quantity} x ${item.name}</span><span>${window.shopApi.money(item.price * item.quantity)}</span></div>`).join("")}
    <div class="summary-line"><span>Shipping</span><span>${totals.shippingFee ? window.shopApi.money(totals.shippingFee) : "Free"}</span></div>
    <div class="summary-line summary-total"><span>Total</span><span>${window.shopApi.money(totals.total)}</span></div>
  `;

  document.getElementById("checkoutForm").addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "";
    if (!window.auth.currentUser()) {
      location.href = "login.html";
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      const order = await window.shopApi.request("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map(item => ({ product: item._id, quantity: item.quantity })),
          shipping: {
            fullName: form.get("fullName"),
            phone: form.get("phone"),
            city: form.get("city"),
            address: form.get("address")
          }
        })
      });

      const payment = await window.shopApi.request("/payments/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ orderId: order._id })
      });

      sessionStorage.setItem("lastCheckoutCart", JSON.stringify(items));
      location.href = payment.paymentUrl;
    } catch (error) {
      message.textContent = error.message;
    }
  });
});
