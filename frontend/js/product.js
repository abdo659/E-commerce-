document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const product = await window.shopApi.getProduct(id);
  const container = document.getElementById("productDetails");

  if (!product) {
    container.innerHTML = `<div class="panel"><h1>Product not found</h1><a class="primary-btn" href="shop.html">Back to Shop</a></div>`;
    return;
  }

  container.innerHTML = `
    <div class="panel">
      <img src="${product.image}" alt="${product.name}" style="width:100%;aspect-ratio:1/1;object-fit:cover;">
    </div>
    <div class="panel">
      <div class="brand">${product.brand || "Electronics"}</div>
      <h1>${product.name}</h1>
      <p>${product.description || ""}</p>
      <div class="price">${window.shopApi.money(product.price)}</div>
      ${product.oldPrice ? `<div class="old-price">${window.shopApi.money(product.oldPrice)}</div>` : ""}
      <p>${product.stock || 0} items in stock</p>
      <button class="primary-btn" id="addProduct">Add to Cart</button>
    </div>
  `;

  document.getElementById("addProduct").addEventListener("click", () => {
    window.cart.addToCart(product);
    document.getElementById("addProduct").textContent = "Added to Cart";
  });
});
