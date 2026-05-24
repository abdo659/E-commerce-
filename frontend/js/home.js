document.addEventListener("DOMContentLoaded", async () => {
  const [categories, products] = await Promise.all([
    window.shopApi.getCategories(),
    window.shopApi.getProducts()
  ]);

  document.getElementById("categoryGrid").innerHTML = categories.slice(0, 10).map(category => `
    <a class="category-card" href="shop.html?category=${category._id}">
      <span>${category.name}</span>
    </a>
  `).join("");

  const shownProducts = products.length ? products.slice(0, 8) : window.demoProducts;
  document.getElementById("featuredProducts").innerHTML = shownProducts.map(window.renderProductCard).join("");
  window.attachAddToCart(shownProducts);
});
