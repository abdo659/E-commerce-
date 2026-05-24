const params = new URLSearchParams(location.search);
const success = params.get("success");
const provider = params.get("provider");
const sessionId = params.get("session_id");
const orderId = params.get("orderId");
const text = document.getElementById("paymentResultText");

const savedCart = sessionStorage.getItem("lastCheckoutCart");

async function confirmStripePayment() {
  if (provider !== "stripe" || success !== "true" || !sessionId || !orderId) {
    return;
  }

  try {
    const result = await window.shopApi.request("/payments/stripe/confirm-session", {
      method: "POST",
      body: JSON.stringify({ sessionId, orderId })
    });

    if (result.paymentStatus === "paid") {
      text.textContent = "Your card payment was completed successfully.";
      localStorage.removeItem("cart");
      sessionStorage.removeItem("lastCheckoutCart");
      return;
    }

    text.textContent = "Your payment was not completed yet.";
  } catch (error) {
    text.textContent = error.message;
  }
}

if (success === "false") {
  text.textContent = "Payment was cancelled. You can return to checkout and try again.";
  if (savedCart) {
    localStorage.setItem("cart", savedCart);
  }
} else if (success === "true") {
  text.textContent = "Checking payment status...";
  confirmStripePayment();
}
