function renderProductCard(product) {
  return `
    <article class="product-card">
      <a href="product.html?id=${product._id}">
        <img src="${product.image}" alt="${product.name}">
      </a>
      <div class="product-card-content">
        <div class="brand">${product.brand || "Electronics"}</div>
        <h3><a href="product.html?id=${product._id}">${product.name}</a></h3>
        <p>${product.description || ""}</p>
        <div class="price-row">
          <div>
            <div class="price">${window.shopApi.money(product.price)}</div>
            ${product.oldPrice ? `<div class="old-price">${window.shopApi.money(product.oldPrice)}</div>` : ""}
          </div>
          <button class="icon-btn" data-add-to-cart="${product._id}">+</button>
        </div>
      </div>
    </article>
  `;
}

function attachAddToCart(products) {
  document.querySelectorAll("[data-add-to-cart]").forEach(button => {
    button.addEventListener("click", () => {
      const product = products.find(item => item._id === button.dataset.addToCart);
      if (product) {
        window.cart.addToCart(product);
        button.textContent = "✓";
        setTimeout(() => {
          button.textContent = "+";
        }, 900);
      }
    });
  });
}

window.renderProductCard = renderProductCard;
window.attachAddToCart = attachAddToCart;
