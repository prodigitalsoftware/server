"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = exports.createReview = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = require("../models/Product");
const Review_1 = require("../models/Review");
const getProducts = async (req, res) => {
    try {
        const { category, search, type, featured, minPrice, maxPrice, sort = 'newest', page = '1', limit = '12', status = 'published', } = req.query;
        const query = {};
        if (status !== 'all') {
            query.status = status;
        }
        if (category) {
            query.category = category;
        }
        if (type) {
            query.type = type;
        }
        if (featured === 'true') {
            query.featured = true;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        if (search) {
            const searchRegex = new RegExp(String(search), 'i');
            query.$or = [
                { name: searchRegex },
                { nameKh: searchRegex },
                { description: searchRegex },
                { tags: searchRegex },
            ];
        }
        let sortOptions = { createdAt: -1 };
        if (sort === 'price_asc')
            sortOptions = { price: 1 };
        else if (sort === 'price_desc')
            sortOptions = { price: -1 };
        else if (sort === 'popular')
            sortOptions = { numReviews: -1, rating: -1 };
        else if (sort === 'oldest')
            sortOptions = { createdAt: 1 };
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.max(1, parseInt(String(limit), 10));
        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            Product_1.Product.find(query)
                .populate('category', 'name nameKh slug')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product_1.Product.countDocuments(query),
        ]);
        res.json({
            success: true,
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve products', error: error.message });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        // Support both Mongo ObjectId and slug lookup
        let product;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product_1.Product.findById(id).populate('category', 'name nameKh slug');
        }
        else {
            product = await Product_1.Product.findOne({ slug: id }).populate('category', 'name nameKh slug');
        }
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        // Related products in same category
        const related = await Product_1.Product.find({
            category: product.category,
            _id: { $ne: product._id },
            status: 'published',
        })
            .limit(4)
            .lean();
        res.json({
            success: true,
            product,
            related,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving product', error: error.message });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, nameKh, slug, description, descriptionKh, price, discountPrice, category, images, type, digitalDownloadUrl, digitalAccessInfo, stock, featured, status, specifications, tags, } = req.body;
        const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existingSlug = await Product_1.Product.findOne({ slug: generatedSlug });
        const finalSlug = existingSlug ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : generatedSlug;
        const product = new Product_1.Product({
            name,
            nameKh,
            slug: finalSlug,
            description,
            descriptionKh,
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : undefined,
            category,
            images: Array.isArray(images) ? images : images ? [images] : [],
            type: type || 'software',
            digitalDownloadUrl: digitalDownloadUrl || '',
            digitalAccessInfo: digitalAccessInfo || '',
            stock: stock !== undefined ? Number(stock) : 999,
            featured: Boolean(featured),
            status: status || 'published',
            specifications: specifications || [],
            tags: tags || [],
        });
        await product.save();
        res.status(201).json({ success: true, message: 'Product created successfully', product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (updateData.price)
            updateData.price = Number(updateData.price);
        if (updateData.discountPrice)
            updateData.discountPrice = Number(updateData.discountPrice);
        const product = await Product_1.Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, message: 'Product updated successfully', product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.Product.findByIdAndDelete(id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const createReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, userName } = req.body;
        const product = await Product_1.Product.findById(id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        const review = new Review_1.Review({
            user: req.user?._id,
            userName: userName || req.user?.name || 'Customer',
            product: product._id,
            rating: Number(rating),
            comment,
        });
        await review.save();
        // Recalculate average rating
        const reviews = await Review_1.Review.find({ product: product._id });
        const avg = reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length;
        product.rating = parseFloat(avg.toFixed(1));
        product.numReviews = reviews.length;
        await product.save();
        res.status(201).json({ success: true, message: 'Review added', review, rating: product.rating });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add review', error: error.message });
    }
};
exports.createReview = createReview;
const getReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review_1.Review.find({ product: id }).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
    }
};
exports.getReviews = getReviews;
