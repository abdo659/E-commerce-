(function () {
  function currentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }

  function saveSession(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.href = "index.html";
  }

  function updateHeader() {
    const user = currentUser();
    const area = document.querySelector("[data-auth-area]");
    if (!area) return;

    if (user) {
      area.innerHTML = `
        <button class="account-btn" data-logout>Logout</button>
      `;
      area.querySelector("[data-logout]").addEventListener("click", logout);
    } else {
      area.innerHTML = `
        <a class="account-btn" href="login.html">Login</a>
      `;
    }
  }

  async function login(email, password) {
    const data = await window.shopApi.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    saveSession(data);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await window.shopApi.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    saveSession(data);
    return data.user;
  }

  window.auth = { currentUser, login, register, logout, updateHeader };
  document.addEventListener("DOMContentLoaded", updateHeader);
})();
