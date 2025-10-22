// routes/products.js
const express = require('express');
const router = express.Router();

const Product = require('../models/Product'); // Mongoose model
const asyncHandler = require('../utils/asyncHandler'); // wrapper for async errors
const auth = require('../middleware/auth'); // x-api-key middleware
const validateProduct = require('../middleware/validateProduct'); // validation middleware
const NotFoundError = require('../errors/NotFoundError');

// GET /api/products
// Supports pagination: ?page=1&limit=10
// Filtering: ?category=tools
// Search: ?q=widget (search on name, case-insensitive)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.inStock !== undefined) filter.inStock = req.query.inStock === 'true';
    if (req.query.q) filter.name = { $regex: req.query.q, $options: 'i' };

    const [items, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      Product.countDocuments(filter).exec(),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: items,
    });
  })
);

// GET /api/products/stats  -- put before /:id to avoid being treated as an id
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const stats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]).exec();

    res.json({ stats });
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ id: req.params.id }).exec();
    if (!product) throw new NotFoundError('Product not found');
    res.json(product);
  })
);

// POST /api/products
router.post(
  '/',
  auth,
  validateProduct,
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const product = new Product(payload);
    await product.save();
    res.status(201).json(product);
  })
);

// PUT /api/products/:id
router.put(
  '/:id',
  auth,
  validateProduct,
  asyncHandler(async (req, res) => {
    const update = req.body;
    const product = await Product.findOneAndUpdate({ id: req.params.id }, update, { new: true }).exec();
    if (!product) throw new NotFoundError('Product not found');
    res.json(product);
  })
);

// DELETE /api/products/:id
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const product = await Product.findOneAndDelete({ id: req.params.id }).exec();
    if (!product) throw new NotFoundError('Product not found');
    res.json({ message: 'Deleted', id: product.id });
  })
);

module.exports = router;
