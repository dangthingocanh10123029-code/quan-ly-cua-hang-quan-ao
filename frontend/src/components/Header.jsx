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
        setSearchResults(response.data?.products || response.data || [])
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
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl transition-all duration-300 border-b border-slate-100/50">
      <nav className="flex justify-between items-center px-6 md:px-10 h-[72px] w-full max-w-[1400px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-extrabold tracking-[-0.02em] text-slate-900">
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
                      ? 'text-[#4F46E5] font-semibold'
                      : 'text-slate-600'
                  } hover:text-[#4F46E5] transition-colors duration-200 text-sm font-medium`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* User & Cart */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div
                className={`flex items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-full group transition-all w-44 ${
                  isSearchFocused ? 'ring-2 ring-[#4F46E5]/30 ring-offset-1 border-[#4F46E5] w-64 bg-white shadow-[0_4px_14px_rgba(79,70,229,0.1)]' : ''
                }`}
              >
                <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 mx-2 placeholder:text-slate-400 w-28 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {isSearching && (
                  <div className="animate-spin w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full"></div>
                )}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="hover:text-[#4F46E5]"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgba(79,70,229,0.12)] border border-slate-100 overflow-hidden max-h-[400px] overflow-y-auto w-80">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.slice(0, 6).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleResultClick(product.slug)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image_url || product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-900 truncate">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#4F46E5] font-bold text-sm">
                              {formatPrice(product.price)}đ
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <span className="text-slate-400 text-xs line-through">
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
                        className="p-3 text-center text-[#4F46E5] font-semibold cursor-pointer hover:bg-slate-50 border-t border-slate-100 text-sm"
                      >
                        Xem thêm {searchResults.length - 6} kết quả
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-400">
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
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#4F46E5]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[#4F46E5] bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgba(79,70,229,0.12)] border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-[#4F46E5] transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-base">person</span>
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-[#4F46E5] transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-base">shopping_bag</span>
                        Đơn hàng của tôi
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-[#4F46E5] transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-base">favorite</span>
                        Yêu thích
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors w-full text-sm"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="hover:opacity-70 transition-opacity text-slate-900">
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="hover:opacity-70 transition-opacity text-slate-900 relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4F46E5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
