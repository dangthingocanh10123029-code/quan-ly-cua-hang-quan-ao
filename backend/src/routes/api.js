const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const productController = require('../controllers/productController');

// GET /api/home - Lấy toàn bộ dữ liệu cho trang chủ
router.get('/home', homeController.getHomeData);

// Product routes
router.get('/products', productController.getProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/kids-categories', productController.getKidsCategories);
router.get('/products/:slug', productController.getProductBySlug);

module.exports = router;
