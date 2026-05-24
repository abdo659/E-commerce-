document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const form = document.getElementById("filtersForm");
  const categorySelect = document.getElementById("categorySelect");
  const categories = await window.shopApi.getCategories();

  categorySelect.innerHTML += categories.map(category => `<option value="${category._id}">${category.name}</option>`).join("");
  form.search.value = params.get("search") || "";
  form.category.value = params.get("category") || "";
  form.sort.value = params.get("sort") || "newest";

  const products = await window.shopApi.getProducts({
    search: form.search.value,
    category: form.category.value,
    sort: form.sort.value
  });

  const grid = document.getElementById("productsGrid");
  const empty = document.getElementById("emptyMessage");
  empty.style.display = products.length ? "none" : "block";
  grid.innerHTML = products.map(window.renderProductCard).join("");
  window.attachAddToCart(products);
});
