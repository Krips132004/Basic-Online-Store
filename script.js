const PRODUCT_KEY = "products";
const CART_KEY = "cart";

let editingId = null;

/* ===== Manage Products ===== */
function loadProducts() {
  let products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
  let tbody = document.getElementById("productTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  products.forEach(p => {
    let row = tbody.insertRow();
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>₹${p.price}</td>
      <td><img src="${p.image}" width="60"></td>
      <td>${p.description}</td>
      <td>${p.category}</td>
      <td>
        <button class="btn-edit" onclick="editProduct('${p.id}')">Edit</button>
        <button class="btn-delete" onclick="deleteProduct('${p.id}')">Delete</button>
      </td>
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  let form = document.getElementById("productForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      let products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
      let product = {
        id: document.getElementById("prodId").value,
        name: document.getElementById("prodName").value,
        price: parseFloat(document.getElementById("prodPrice").value),
        image: document.getElementById("prodImage").value,
        description: document.getElementById("prodDesc").value,
        category: document.getElementById("prodCategory").value
      };

      if (editingId) {
        products = products.map(p => (p.id === editingId ? product : p));
        editingId = null;
      } else {
        products.push(product);
      }

      localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
      form.reset();
      loadProducts();
    });
  }

  loadProductsForHome();
  loadProduct();
  loadCart();
  showTotal();
});

function editProduct(id) {
  let products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
  let product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById("prodId").value = product.id;
  document.getElementById("prodName").value = product.name;
  document.getElementById("prodPrice").value = product.price;
  document.getElementById("prodImage").value = product.image;
  document.getElementById("prodDesc").value = product.description;
  document.getElementById("prodCategory").value = product.category;

  editingId = id;
}

function deleteProduct(id) {
  let products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
  products = products.filter(p => p.id !== id);
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
  loadProducts();
}

/* ===== Home Page Products ===== */
function loadProductsForHome() {
  let products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
  let grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";
  products.forEach(p => {
    let card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="price">₹${p.price}</p>
      <button onclick="addToCart('${p.id}')">Add to Cart</button>
      <button onclick="viewProduct('${p.id}')">View Product</button>
    `;
    grid.appendChild(card);
  });
}

function viewProduct(id) {
  localStorage.setItem("viewProductId", id);
  window.location.href = "viewproduct.html";
}

/* ===== View Product Page ===== */
function loadProduct() {
  const id = localStorage.getItem("viewProductId");
  if (!id) return;

  const products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
  const product = products.find(p => p.id === id);
  if (!product) return;

  const imgContainer = document.getElementById("productImages");
  if (imgContainer) imgContainer.innerHTML = `<img src="${product.image}" alt="${product.name}">`;

  const details = document.getElementById("productDetails");
  if (details) {
    details.innerHTML = `
      <h1>${product.name}</h1>
      <div class="ratings">⭐⭐⭐⭐☆ 578 ratings | Amazon's Choice</div>
      <div class="price">₹${product.price} <span class="old-price">₹${Math.round(product.price*1.2)}</span> <span class="discount">-20%</span></div>
      <div class="offers">
        <div>No Cost EMI available on Credit Cards</div>
        <div>Partner Offers: Get GST invoice & save up to 18%</div>
      </div>
      <div class="key-info">
        <div>Brand: ${product.category}</div>
        <div>1 Year Warranty Care</div>
        <div>10 days Replacement by Brand</div>
        <div>Free Delivery</div>
      </div>
      <div class="actions">
        <button class="add-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
        <button class="buy-now" onclick="buyNow('${product.id}')">Buy Now</button>
      </div>
    `;
  }
}

/* ===== Cart Functions ===== */
function addToCart(id) {
  let products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  let product = products.find(p => p.id === id);
  if (!product) return;

  let existing = cart.find(i => i.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  alert("Added to cart!");
}

function buyNow(id) {
  addToCart(id);
  window.location.href = "cart.html";
}

/* ===== Cart Page ===== */
function loadCart() {
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  let tbody = document.getElementById("cartBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  cart.forEach(item => {
    let subtotal = (item.price * item.quantity).toFixed(2);
    let row = tbody.insertRow();
    row.innerHTML = `
      <td>${item.name}</td>
      <td><img src="${item.image}" width="70"></td>
      <td>
        <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">−</button>
        <span class="qty">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
      </td>
      <td>₹${subtotal}</td>
      <td>
        <button class="btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
      </td>
    `;
  });
  showTotal();
}

function changeQuantity(id, delta) {
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  let item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity < 1) item.quantity = 1;

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  loadCart();
}

function deleteItem(id) {
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  loadCart();
}

function showTotal() {
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  let total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  let totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.innerText = "Total: ₹" + total.toFixed(2);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  loadCart();
  let totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.innerText = "";
}
