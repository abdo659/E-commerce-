document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = document.getElementById("loginMessage");
  message.textContent = "";
  try {
    await window.auth.login(form.get("email"), form.get("password"));
    location.href = "shop.html";
  } catch (error) {
    message.textContent = error.message;
  }
});
