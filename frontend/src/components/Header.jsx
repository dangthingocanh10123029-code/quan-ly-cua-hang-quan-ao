import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { searchAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice } from '../utils/formatPrice'

const Header = () => {
  const { getItemCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const cartCount = getItemCount()

  const navLinks = [
    { name: 'Nam', href: '/nam' },
    { name: 'Nữ', href: '/nu' },
    { name: 'Trẻ em', href: '/tre-em' },
    { name: 'Giảm giá', href: '/giam-gia' }
  ]

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await searchAPI.search(searchQuery)
        setSearchResults(response.data || [])
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowResults(false)
      setSearchQuery('')
    }
  }

  const handleResultClick = (productSlug) => {
    navigate(`/product/${productSlug}`)
    setShowResults(false)
    setSearchQuery('')
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/')
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      <nav className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto font-headline tracking-tight">
        {/* Logo */}
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">
            CLOTH
          </Link>
          <div className="hidden md:flex gap-8 items-center h-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`${
                    isActive
                      ? 'text-red-600 dark:text-red-500 font-medium'
                      : 'text-slate-600 dark:text-slate-400'
                  } hover:text-red-600 dark:hover:text-red-500 transition-colors`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* User & Cart */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div
                className={`flex items-center bg-surface-container-low px-3 py-2 rounded-full group transition-all w-48 ${
                  isSearchFocused ? 'bg-surface-container ring-2 ring-primary/50 w-64' : ''
                }`}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
                <input
                  type="text"
                  placeholder="Tìm..."
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 mx-2 placeholder:text-on-surface-variant w-28"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {isSearching && (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                )}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-outline-variant overflow-hidden max-h-[400px] overflow-y-auto w-80">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.slice(0, 6).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleResultClick(product.slug)}
                        className="flex items-center gap-3 p-3 hover:bg-surface-container-low cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image_url || product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-primary font-bold text-sm">
                              {formatPrice(product.price)}đ
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <span className="text-on-surface-variant text-xs line-through">
                                {formatPrice(product.compare_price)}đ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 6 && (
                      <div
                        onClick={handleSearchSubmit}
                        className="p-3 text-center text-primary font-medium cursor-pointer hover:bg-surface-container-low border-t border-outline-variant"
                      >
                        Xem thêm {searchResults.length - 6} kết quả
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                    <p>Không tìm thấy sản phẩm nào</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                  />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
                    <div className="p-4 border-b border-outline-variant/40">
                      <p className="font-medium text-on-surface truncate">{user?.name}</p>
                      <p className="text-sm text-on-surface-variant truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">person</span>
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">shopping_bag</span>
                        Đơn hàng của tôi
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">favorite</span>
                        Yêu thích
                      </Link>
                    </div>
                    <div className="border-t border-outline-variant/40 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-error hover:bg-error-container/20 transition-colors w-full"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="hover:opacity-70 transition-opacity text-slate-900 dark:text-slate-50">
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="hover:opacity-70 transition-opacity text-slate-900 dark:text-slate-50 relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header
