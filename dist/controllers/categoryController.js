"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const getCategories = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        const categories = await Category_1.Category.find(filter).sort({ name: 1 }).lean();
        // Attach product counts to each category
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            const productCount = await Product_1.Product.countDocuments({ category: cat._id, status: 'published' });
            return {
                ...cat,
                productCount,
            };
        }));
        res.json({ success: true, categories: categoriesWithCount });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve categories', error: error.message });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, nameKh, slug, description, image, icon, status } = req.body;
        const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existing = await Category_1.Category.findOne({ slug: generatedSlug });
        if (existing) {
            res.status(400).json({ success: false, message: 'Category slug already exists' });
            return;
        }
        const category = new Category_1.Category({
            name,
            nameKh,
            slug: generatedSlug,
            description,
            image,
            icon: icon || 'Folder',
            status: status || 'active',
        });
        await category.save();
        res.status(201).json({ success: true, message: 'Category created', category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.Category.findByIdAndUpdate(id, req.body, { new: true });
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }
        res.json({ success: true, message: 'Category updated', category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const productsUsingCategory = await Product_1.Product.countDocuments({ category: id });
        if (productsUsingCategory > 0) {
            res.status(400).json({
                success: false,
                message: `Cannot delete category: ${productsUsingCategory} products belong to this category. Please reassign or delete them first.`,
            });
            return;
        }
        const category = await Category_1.Category.findByIdAndDelete(id);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }
        res.json({ success: true, message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
    }
};
exports.deleteCategory = deleteCategory;
