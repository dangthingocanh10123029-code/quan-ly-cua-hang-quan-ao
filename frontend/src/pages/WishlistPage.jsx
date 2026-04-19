import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../utils/formatPrice'
import api from '../services/api'

const NAV_ITEMS = [
  { id: 'profile',    path: '/profile',    label: 'Hồ sơ cá nhân',      icon: 'person' },
  { id: 'orders',     path: '/orders',      label: 'Đơn hàng của tôi',    icon: 'shopping_bag' },
  { id: 'favorites',  path: '/favorites',   label: 'Danh sách yêu thích', icon: 'favorite' },
]

function Sidebar({ activeId, onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout()
      navigate('/')
    }
  }

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl p-5 mb-3"
        style={{ boxShadow: '0 20px 40px rgba(19, 27, 46, 0.06)' }}>
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#eaedff]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#4450b7] flex items-center justify-center
              text-white font-bold text-lg font-['Space_Grotesk'] shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-[#131b2e] truncate leading-tight">{user?.name || 'Khách hàng'}</p>
            <p className="text-xs text-[#454652] mt-0.5 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="bg-[#f2f3ff] rounded-2xl p-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = activeId === item.id
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#4450b7] font-semibold'
                  : 'text-[#454652] hover:bg-white/60 hover:text-[#131b2e]'
              }`}
              style={isActive ? { boxShadow: '0 8px 16px rgba(19, 27, 46, 0.05)' } : {}}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#4450b7] rounded-r-full" />
              )}
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}

        <div className="my-1 h-px bg-[#dae2fd]/40 mx-3" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            text-[#454652] hover:bg-white/60 hover:text-[#c9392c] w-full text-left group"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm">Đăng xuất</span>
        </button>
      </nav>
    </aside>
  )
}

function EmptyState({ icon, title, subtitle, cta }) {
  return (
    <div className="bg-[#f2f3ff] rounded-2xl p-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#dae2fd] flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-3xl text-[#4450b7]">{icon}</span>
      </div>
      <p className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e] mb-2">{title}</p>
      <p className="text-sm text-[#454652] mb-7">{subtitle}</p>
      {cta}
    </div>
  )
}

function LoadingState({ message }) {
  return (
    <div className="bg-[#f2f3ff] rounded-2xl p-12 flex flex-col items-center gap-4">
      <span className="material-symbols-outlined text-3xl animate-spin text-[#4450b7]">progress_activity</span>
      <p className="text-sm text-[#454652]">{message}</p>
    </div>
  )
}

const WishlistPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [cartLoadingId, setCartLoadingId] = useState(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login')
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated) fetchWishlist()
  }, [isAuthenticated])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const res = await api.get('/wishlist')
      if (res.success) setWishlist(res.wishlist || [])
      else setWishlist([])
    } catch { setWishlist([]) } finally { setLoading(false) }
  }

  const removeFromWishlist = async (item) => {
    setRemovingId(item.product_id)
    try {
      const res = await api.delete(`/wishlist/${item.product_id}`)
      if (res.success) setWishlist(wishlist.filter(i => i.product_id !== item.product_id))
    } catch {} finally { setRemovingId(null) }
  }

  const handleAddToCart = async (item) => {
    setCartLoadingId(item.product_id)
    try {
      addItem({
        id: item.id, name: item.name, slug: item.slug,
        price: item.price, compare_price: item.compare_price, image_url: item.image_url,
      }, 1, null, null)
    } catch {} finally { setCartLoadingId(null) }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl animate-spin text-[#4450b7]">progress_activity</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Header cartCount={0} />

      <main className="pt-20 max-w-screen-2xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          <Sidebar activeId="favorites" onNavigate={() => {}} />

          <div className="flex-1 min-w-0 space-y-8">
            {/* Page Header */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[#131b2e] leading-none mt-6">
                  Yêu thích
                </h1>
                <p className="text-sm text-[#454652] mt-3">
                  {wishlist.length > 0 ? `${wishlist.length} sản phẩm` : 'Lưu lại những sản phẩm bạn yêu thích'}
                </p>
              </div>
            </div>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[#454652] text-xs font-medium">
              <Link to="/profile" className="hover:text-[#4450b7] transition-colors">Tài khoản</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#131b2e] font-semibold">Yêu thích</span>
            </nav>

            {/* Content */}
            {loading ? (
              <LoadingState message="Đang tải danh sách..." />
            ) : wishlist.length === 0 ? (
              <EmptyState
                icon="favorite"
                title="Danh sách yêu thích đang trống"
                subtitle="Lưu lại những sản phẩm bạn yêu thích để mua sắm dễ dàng hơn"
                cta={
                  <Link to="/"
                    className="px-7 py-3 bg-gradient-to-br from-[#4450b7] to-[#5e6ad2] text-white text-sm font-medium rounded-xl
                      hover:opacity-90 transition-all"
                    style={{ boxShadow: '0 8px 20px rgba(68, 80, 183, 0.25)' }}>
                    Khám phá sản phẩm
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {wishlist.map(item => {
                  const hasDiscount = item.compare_price && item.compare_price > item.price
                  const discountPct = hasDiscount
                    ? Math.round((1 - item.price / item.compare_price) * 100) : 0
                  const outOfStock = !item.is_active || item.stock_quantity <= 0
                  const isRemoving = removingId === item.product_id
                  const isAddingToCart = cartLoadingId === item.product_id

                  return (
                    <div key={`${item.wishlist_id}-${item.id}`}
                      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                      style={{ boxShadow: '0 8px 24px rgba(19, 27, 46, 0.05)' }}>

                      {/* Image */}
                      <Link to={`/product/${item.slug}`} className="block relative aspect-[3/4] bg-[#f2f3ff] overflow-hidden group">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-[#a5a6aa]">image</span>
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#c9392c] text-white text-xs font-bold rounded-lg">
                            -{discountPct}%
                          </div>
                        )}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-[#131b2e]/40 flex items-center justify-center">
                            <span className="px-4 py-2 bg-white/90 text-[#131b2e] text-xs font-bold rounded-lg">
                              Hết hàng
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="p-5">
                        <Link to={`/product/${item.slug}`}>
                          <h3 className="text-sm font-medium text-[#131b2e] line-clamp-2 mb-3 leading-snug
                            hover:text-[#4450b7] transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="font-['Space_Grotesk'] font-bold text-base text-[#131b2e]">
                            {formatPrice(item.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-[#a5a6aa] line-through">{formatPrice(item.compare_price)}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={outOfStock || isAddingToCart}
                            className="flex-1 py-2.5 bg-gradient-to-br from-[#4450b7] to-[#5e6ad2] text-white text-xs font-semibold rounded-xl
                              hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            style={{ boxShadow: '0 4px 12px rgba(68, 80, 183, 0.2)' }}
                          >
                            {isAddingToCart ? (
                              <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span></>
                            ) : (
                              <><span className="material-symbols-outlined text-base">shopping_cart</span> Thêm vào giỏ</>
                            )}
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item)}
                            disabled={isRemoving}
                            className="w-10 h-10 bg-[#fef0f0] text-[#c9392c] rounded-xl flex items-center justify-center
                              hover:bg-[#fedcdc] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            title="Xóa khỏi yêu thích"
                          >
                            {isRemoving ? (
                              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-base">delete</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default WishlistPage
