const db = require('../config/database')

async function addColumnIfNotExists(table, column, definition) {
  try {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    console.log(`[Migration] ✓ Added column ${table}.${column}`)
    return true
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log(`[Migration] ${table}.${column} already exists, skipping`)
      return false
    }
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      console.log(`[Migration] ${table}.${column} already exists, skipping`)
      return false
    }
    throw err
  }
}

async function runMigrations() {
  console.log('[Migration] Running database migrations...')

  try {
    // Addresses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address VARCHAR(255) NOT NULL,
        ward VARCHAR(100) DEFAULT '',
        district VARCHAR(100) DEFAULT '',
        city VARCHAR(100) NOT NULL,
        is_default TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_default (user_id, is_default),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('[Migration] ✓ addresses table ready')
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('[Migration] addresses table already exists')
    } else {
      console.error('[Migration] Error creating addresses table:', err.message)
    }
  }

  try {
    // Wishlists table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product (user_id, product_id),
        INDEX idx_user (user_id),
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('[Migration] ✓ wishlists table ready')
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('[Migration] wishlists table already exists')
    } else {
      console.error('[Migration] Error creating wishlists table:', err.message)
    }
  }

  // Users member_level column
  try {
    await addColumnIfNotExists('users', 'member_level', "VARCHAR(20) DEFAULT 'Bronze'")
  } catch (err) {
    console.error(`[Migration] Error adding users.member_level:`, err.message)
  }

  // --- Orders table schema migration ---
  // Add missing columns to orders table if they don't exist
  const orderColumns = [
    { name: 'recipient_name',   def: 'VARCHAR(100) DEFAULT \'\'' },
    { name: 'recipient_phone',  def: 'VARCHAR(20) DEFAULT \'\'' },
    { name: 'ward',            def: 'VARCHAR(100) DEFAULT \'\'' },
    { name: 'district',        def: 'VARCHAR(100) DEFAULT \'\'' },
    { name: 'city',            def: 'VARCHAR(100) DEFAULT \'\'' },
    { name: 'note',            def: 'TEXT' },
    { name: 'coupon_code',     def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'cancel_reason',   def: 'TEXT' },
    { name: 'cancelled_at',    def: 'DATETIME DEFAULT NULL' },
    { name: 'delivered_at',     def: 'DATETIME DEFAULT NULL' },
  ]

  for (const col of orderColumns) {
    try {
      await addColumnIfNotExists('orders', col.name, col.def)
    } catch (err) {
      console.error(`[Migration] Error adding orders.${col.name}:`, err.message)
    }
  }

  try {
    await addColumnIfNotExists('contacts', 'is_replied', 'TINYINT(1) DEFAULT 0')
  } catch (err) {
    console.error('[Migration] Error adding contacts.is_replied:', err.message)
  }

  // Product reviews is_active column
  try {
    await addColumnIfNotExists('product_reviews', 'is_active', 'TINYINT(1) DEFAULT 1')
  } catch (err) {
    console.error('[Migration] Error adding product_reviews.is_active:', err.message)
  }

  console.log('[Migration] Done.')
}

module.exports = { runMigrations }
