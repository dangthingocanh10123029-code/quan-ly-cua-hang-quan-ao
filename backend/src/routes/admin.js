const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, unique + path.extname(file.originalname))
  }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)) cb(null, true)
  else cb(new Error('Chỉ chấp nhận file ảnh'))
} })

// Upload image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Không có file' })
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ success: true, url })
})

// Login - no auth required
router.post('/login', require('../controllers/adminController').adminLogin)

// All routes require authentication + admin role
const { authMiddleware } = require('../middleware/auth')
router.use(authMiddleware)

// Dashboard
router.get('/dashboard', require('../controllers/adminController').getDashboard)

// Products
router.get('/products', require('../controllers/adminController').getProducts)
router.get('/products/:id', require('../controllers/adminController').getProductById)
router.post('/products', require('../controllers/adminController').createProduct)
router.put('/products/:id', require('../controllers/adminController').updateProduct)
router.delete('/products/:id', require('../controllers/adminController').deleteProduct)
router.put('/products/:id/toggle', require('../controllers/adminController').toggleProduct)
router.put('/products/:id/toggle-featured', require('../controllers/adminController').toggleFeatured)

// Categories
router.get('/categories', require('../controllers/adminController').getCategories)
router.post('/categories', require('../controllers/adminController').createCategory)
router.put('/categories/:id', require('../controllers/adminController').updateCategory)
router.delete('/categories/:id', require('../controllers/adminController').deleteCategory)

// Brands
router.get('/brands', require('../controllers/adminController').getBrands)
router.post('/brands', require('../controllers/adminController').createBrand)
router.put('/brands/:id', require('../controllers/adminController').updateBrand)
router.delete('/brands/:id', require('../controllers/adminController').deleteBrand)

// Orders
router.get('/orders', require('../controllers/adminController').getOrders)
router.put('/orders/:id/status', require('../controllers/adminController').updateOrderStatus)
router.get('/orders/:id', require('../controllers/adminController').getOrderDetail)

// Customers
router.get('/customers', require('../controllers/adminController').getCustomers)
router.get('/customers/:id', require('../controllers/adminController').getCustomerDetail)
router.put('/customers/:id', require('../controllers/adminController').updateCustomer)

// Employees
router.get('/employees', require('../controllers/adminController').getEmployees)
router.post('/employees', require('../controllers/adminController').createEmployee)
router.put('/employees/:id', require('../controllers/adminController').updateEmployee)
router.delete('/employees/:id', require('../controllers/adminController').deleteEmployee)
router.put('/employees/:id/toggle', require('../controllers/adminController').toggleEmployee)

// Promotions
router.get('/promotions', require('../controllers/adminController').getPromotions)
router.post('/promotions', require('../controllers/adminController').createPromotion)
router.put('/promotions/:id', require('../controllers/adminController').updatePromotion)
router.delete('/promotions/:id', require('../controllers/adminController').deletePromotion)

// Coupons
router.get('/coupons', require('../controllers/adminController').getCoupons)
router.post('/coupons', require('../controllers/adminController').createCoupon)
router.put('/coupons/:id', require('../controllers/adminController').updateCoupon)
router.delete('/coupons/:id', require('../controllers/adminController').deleteCoupon)

// Warehouse
router.get('/warehouse', require('../controllers/adminController').getWarehouse)

// Supplier Orders
router.get('/supplier-orders', require('../controllers/adminController').getSupplierOrders)

// Reviews
router.get('/reviews', require('../controllers/adminController').getReviews)
router.put('/reviews/:id/approve', require('../controllers/adminController').approveReview)
router.put('/reviews/:id/reply', require('../controllers/adminController').replyReview)

// News/Blog
router.get('/news', require('../controllers/adminController').getNews)
router.post('/news', require('../controllers/adminController').createNews)
router.put('/news/:id', require('../controllers/adminController').updateNews)
router.delete('/news/:id', require('../controllers/adminController').deleteNews)

// Contacts
router.get('/contacts', require('../controllers/adminController').getContacts)

// Reports
router.get('/reports', require('../controllers/adminController').getReports)

// Settings
router.get('/settings', require('../controllers/adminController').getSettings)
router.put('/settings', require('../controllers/adminController').updateSettings)

// Auth
router.get('/profile', require('../controllers/adminController').getProfile)
router.put('/profile', require('../controllers/adminController').updateProfile)
router.post('/logout', require('../controllers/adminController').logout)

module.exports = router
