document.getElementById("registerForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = document.getElementById("registerMessage");
  message.textContent = "";
  try {
    await window.auth.register(form.get("name"), form.get("email"), form.get("password"));
    location.href = "shop.html";
  } catch (error) {
    message.textContent = error.message;
  }
});
