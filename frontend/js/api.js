(function () {
  const API_URL = window.API_URL || "http://localhost:5000/api";

  function getToken() {
    return localStorage.getItem("token");
  }

  async function request(path, options = {}) {
    const token = getToken();
    const response = await fetch(API_URL + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data && data.message ? data.message : "Request failed.");
    }
    return data;
  }

  function money(value) {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function categoryId(product) {
    if (!product.category) return "";
    return product.category._id || product.category;
  }

  function filterProducts(sourceProducts, params = {}) {
    const search = (params.search || "").toLowerCase();
    const category = params.category || "";
    const sort = params.sort || "newest";

    const products = sourceProducts.filter(product => {
      const haystack = `${product.name} ${product.brand} ${product.description}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesCategory = !category || categoryId(product) === category;
      return matchesSearch && matchesCategory;
    });

    products.sort((a, b) => {
      if (sort === "priceLow") return a.price - b.price;
      if (sort === "priceHigh") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return products;
  }

  async function getProducts(params = {}) {
    try {
      const products = await request("/products");
      return filterProducts(products, params);
    } catch {
      return filterProducts(window.demoProducts, params);
    }
  }

  async function getProduct(id) {
    try {
      return await request(`/products/${id}`);
    } catch {
      return window.demoProducts.find(product => product._id === id);
    }
  }

  async function getCategories() {
    try {
      const products = await request("/products");
      return [...new Set(products.map(categoryId).filter(Boolean))]
        .map(name => ({ _id: name, name }));
    } catch {
      return window.demoCategories;
    }
  }

  window.shopApi = { request, money, getProducts, getProduct, getCategories };
})();
