const Product = require('../models/Product');

// Get all products (auth required by route)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email role');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, price, inStock, category, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const product = await Product.create({
      name,
      sku: sku || '',
      price: Number.isFinite(Number(price)) ? Number(price) : 0,
      inStock: typeof inStock === 'boolean' ? inStock : String(inStock).toLowerCase() === 'true',
      category: category || 'general',
      notes: notes || '',
      createdBy: req.user.id
    });

    const populated = await Product.findById(product._id).populate('createdBy', 'name email role');
    res.status(201).json({ success: true, product: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (creator or admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, sku, price, inStock, category, notes } = req.body;

    if (name !== undefined) product.name = name;
    if (sku !== undefined) product.sku = sku;
    if (price !== undefined) product.price = Number.isFinite(Number(price)) ? Number(price) : product.price;
    if (inStock !== undefined) product.inStock = typeof inStock === 'boolean' ? inStock : String(inStock).toLowerCase() === 'true';
    if (category !== undefined) product.category = category;
    if (notes !== undefined) product.notes = notes;
    product.updatedAt = Date.now();

    await product.save();
    const populated = await Product.findById(product._id).populate('createdBy', 'name email role');
    res.json({ success: true, product: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (creator or admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

