const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'clothing-store-secret-key-2026'

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== 'admin' && decoded.role !== 'manager' && decoded.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' })
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
    } catch {}
  }
  next()
}

module.exports = { authMiddleware, optionalAuth, JWT_SECRET }
