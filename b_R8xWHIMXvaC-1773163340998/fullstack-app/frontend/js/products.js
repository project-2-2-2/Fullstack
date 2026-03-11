let products = [];
let currentEditProductId = null;

const money = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  return num.toFixed(2);
};

const createProductRow = (product, currentUserId) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${product._id}</td>
    <td>${escapeHtml(product.name || '')}</td>
    <td>${escapeHtml(product.sku || '')}</td>
    <td>${escapeHtml(product.category || '')}</td>
    <td>${money(product.price)}</td>
    <td>${product.inStock ? 'Yes' : 'No'}</td>
    <td>${escapeHtml(product.createdBy?.name || 'Unknown')}</td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-primary btn-small" onclick="openEditProductModal('${product._id}')">Edit</button>
        ${(product.createdBy?._id === currentUserId || getCurrentUser().role === 'admin')
          ? `<button class="btn btn-danger btn-small" onclick="deleteProduct('${product._id}')">Delete</button>`
          : ''}
      </div>
    </td>
  `;
  return row;
};

const loadProducts = async () => {
  showLoader();
  try {
    const response = await apiProducts.getAll();
    if (response.success) {
      products = response.products || [];
      displayProducts(products);
    } else {
      showAlert(response.message || 'Failed to load products', 'danger');
    }
  } catch (error) {
    showAlert('Error loading products: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

const displayProducts = (list) => {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const currentUser = getCurrentUser();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No products yet.</td></tr>`;
    return;
  }

  list.forEach((p) => tbody.appendChild(createProductRow(p, currentUser.id)));
};

const openCreateProductModal = () => {
  document.getElementById('product-form').reset();
  currentEditProductId = null;
  document.getElementById('product-modal-title').textContent = 'Add Product';
  document.getElementById('product-modal').style.display = 'block';
};

const openEditProductModal = (productId) => {
  currentEditProductId = productId;
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-sku').value = product.sku || '';
  document.getElementById('product-category').value = product.category || '';
  document.getElementById('product-price').value = product.price ?? 0;
  document.getElementById('product-stock').value = String(!!product.inStock);
  document.getElementById('product-notes').value = product.notes || '';

  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-modal').style.display = 'block';
};

const closeProductModal = () => {
  document.getElementById('product-modal').style.display = 'none';
  currentEditProductId = null;
};

const saveProduct = async (e) => {
  e.preventDefault();

  const productData = {
    name: document.getElementById('product-name').value,
    sku: document.getElementById('product-sku').value,
    category: document.getElementById('product-category').value,
    price: document.getElementById('product-price').value,
    inStock: document.getElementById('product-stock').value === 'true',
    notes: document.getElementById('product-notes').value
  };

  if (!productData.name || !productData.name.trim()) {
    showAlert('Name is required', 'danger');
    return;
  }

  showLoader();
  try {
    const response = currentEditProductId
      ? await apiProducts.update(currentEditProductId, productData)
      : await apiProducts.create(productData);

    if (response.success) {
      showAlert(currentEditProductId ? 'Product updated' : 'Product created', 'success');
      closeProductModal();
      await loadProducts();
    } else {
      showAlert(response.message || 'Failed to save product', 'danger');
    }
  } catch (error) {
    showAlert('Error saving product: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

const deleteProduct = async (productId) => {
  if (!confirm('Delete this product?')) return;
  showLoader();
  try {
    const response = await apiProducts.delete(productId);
    if (response.success) {
      showAlert('Product deleted', 'success');
      await loadProducts();
    } else {
      showAlert(response.message || 'Failed to delete product', 'danger');
    }
  } catch (error) {
    showAlert('Error deleting product: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

const filterProductsByStock = () => {
  const v = document.getElementById('stock-filter').value;
  if (!v) return displayProducts(products);
  const wanted = v === 'true';
  displayProducts(products.filter((p) => !!p.inStock === wanted));
};

const searchProducts = () => {
  const q = (document.getElementById('product-search').value || '').toLowerCase();
  const filtered = products.filter((p) => {
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.createdBy?.name || '').toLowerCase().includes(q)
    );
  });
  displayProducts(filtered);
};

document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  loadProducts();

  const modal = document.getElementById('product-modal');
  if (modal) {
    window.onclick = function(event) {
      if (event.target === modal) closeProductModal();
    };
  }
});

