import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice } from '../utils/formatPrice'
import { orderAPI } from '../services/api'

const NAV_ITEMS = [
  { id: 'profile',    path: '/profile',    label: 'Hồ sơ cá nhân',      icon: 'person' },
  { id: 'orders',     path: '/orders',      label: 'Đơn hàng của tôi',    icon: 'shopping_bag' },
  { id: 'favorites',  path: '/favorites',   label: 'Danh sách yêu thích', icon: 'favorite' },
]

const STATUS_BADGE = {
  pending:    { label: 'Chờ xác nhận',   bg: 'bg-[#eaedff]', text: 'text-[#4450b7]', dot: true },
  confirmed:  { label: 'Đã xác nhận',     bg: 'bg-[#eaedff]', text: 'text-[#4450b7]', dot: true },
  processing: { label: 'Đang xử lý',      bg: 'bg-[#eaedff]', text: 'text-[#6670cc]', dot: true },
  shipped:    { label: 'Đang giao',        bg: 'bg-[#dae2fd]', text: 'text-[#3d55ae]', dot: true },
  delivered:  { label: 'Đã giao',          bg: 'bg-[#f2f3ff]', text: 'text-[#454652]', dot: false },
  cancelled:  { label: 'Đã hủy',            bg: 'bg-[#f2f3ff]', text: 'text-[#a5a6aa]', dot: false },
  returned:   { label: 'Trả hàng',         bg: 'bg-[#f2f3ff]', text: 'text-[#a5a6aa]', dot: false },
}

const PAYMENT_LABEL = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  partially_paid: 'Thanh toán 1 phần',
  refunded: 'Đã hoàn tiền',
}

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

const OrdersPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login')
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated) fetchOrders(pagination.page)
  }, [isAuthenticated])

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const res = await orderAPI.getOrders({ page, limit: 10 })
      if (res.success) {
        setOrders(res.orders || [])
        setPagination({ page: res.pagination.page, totalPages: res.pagination.totalPages, total: res.pagination.total })
      } else { setOrders([]) }
    } catch { setOrders([]) } finally { setLoading(false) }
  }

  const openDetail = async (order) => {
    setSelectedOrder(null)
    setDetailLoading(true)
    try {
      const res = await orderAPI.getOrderDetail(order.id)
      if (res.success) setSelectedOrder(res.order)
    } catch {} finally { setDetailLoading(false) }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const res = await orderAPI.cancelOrder(cancelTarget.id, { reason: cancelReason })
      if (res.success) {
        setOrders(orders.map(o => o.id === cancelTarget.id ? { ...o, status: 'cancelled' } : o))
        if (selectedOrder?.id === cancelTarget.id) {
          setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev)
        }
        setCancelTarget(null)
        setCancelReason('')
      }
    } catch {} finally { setCancelling(false) }
  }

  const formatDate = (d) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return d }
  }

  const isCancellable = (s) => ['pending', 'confirmed'].includes(s)

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

          <Sidebar activeId="orders" onNavigate={() => {}} />

          <div className="flex-1 min-w-0 space-y-8">
            {/* Page Header */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[#131b2e] leading-none mt-6">
                  Đơn hàng của tôi
                </h1>
                <p className="text-sm text-[#454652] mt-3">
                  {pagination.total > 0 ? `${pagination.total} đơn hàng` : 'Theo dõi và quản lý đơn hàng của bạn'}
                </p>
              </div>
            </div>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[#454652] text-xs font-medium">
              <Link to="/profile" className="hover:text-[#4450b7] transition-colors">Tài khoản</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#131b2e] font-semibold">Đơn hàng của tôi</span>
            </nav>

            {/* Content */}
            {loading ? (
              <LoadingState message="Đang tải đơn hàng..." />
            ) : orders.length === 0 ? (
              <EmptyState
                icon="shopping_bag"
                title="Bạn chưa có đơn hàng nào"
                subtitle="Hãy bắt đầu mua sắm để có đơn hàng đầu tiên"
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
              <div className="flex flex-col gap-3">
                {orders.map(order => {
                  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending
                  return (
                    <div
                      key={order.id}
                      onClick={() => openDetail(order)}
                      className="bg-white rounded-2xl p-5 flex items-center gap-5
                        hover:bg-[#f2f3ff] transition-all duration-200 cursor-pointer group"
                      style={{ boxShadow: '0 8px 24px rgba(19, 27, 46, 0.05)' }}
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#f2f3ff] overflow-hidden flex items-center justify-center shrink-0">
                        {order.first_image ? (
                          <img src={order.first_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-[#a5a6aa]">inventory_2</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-medium text-[#a5a6aa] uppercase tracking-wider">#{order.order_number}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#131b2e]">{order.item_count} sản phẩm</p>
                        <p className="text-xs text-[#454652] mt-0.5">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-['Space_Grotesk'] font-bold text-base text-[#131b2e]">{formatPrice(order.total_price)}</p>
                        {order.payment_status && (
                          <p className="text-xs text-[#454652] mt-0.5">{PAYMENT_LABEL[order.payment_status] || order.payment_status}</p>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-xl text-[#a5a6aa] group-hover:text-[#4450b7] transition-colors">
                        chevron_right
                      </span>
                    </div>
                  )
                })}

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => fetchOrders(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="w-9 h-9 rounded-xl bg-[#f2f3ff] flex items-center justify-center
                        disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#dae2fd] transition-all">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <span className="text-sm text-[#454652] px-2">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchOrders(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="w-9 h-9 rounded-xl bg-[#f2f3ff] flex items-center justify-center
                        disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#dae2fd] transition-all">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Order Detail Modal */}
      {selectedOrder !== null && (
        <div className="fixed inset-0 bg-[#131b2e]/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-[#faf8ff] rounded-2xl w-full max-w-xl max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#faf8ff] px-7 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">Chi tiết đơn hàng</h2>
                <p className="text-xs text-[#454652] mt-0.5">#{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-xl bg-[#f2f3ff] flex items-center justify-center hover:bg-[#dae2fd] transition-all">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined text-3xl animate-spin text-[#4450b7]">progress_activity</span>
              </div>
            ) : (
              <div className="px-7 pb-7 space-y-6">
                {/* Status */}
                <div className="flex gap-3">
                  {(() => {
                    const sc = STATUS_BADGE[selectedOrder.status] || {}
                    return (
                      <div className={`px-4 py-2.5 rounded-xl ${sc.bg || 'bg-[#f2f3ff]'} ${sc.text || 'text-[#454652]'}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">Trạng thái</p>
                        <p className="font-bold text-sm">{sc.label || selectedOrder.status}</p>
                      </div>
                    )
                  })()}
                  {selectedOrder.payment_status && (
                    <div className="px-4 py-2.5 rounded-xl bg-[#f2f3ff]">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#454652] opacity-60">Thanh toán</p>
                      <p className="font-bold text-sm text-[#131b2e]">{PAYMENT_LABEL[selectedOrder.payment_status] || selectedOrder.payment_status}</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#454652] mb-3">Sản phẩm</p>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map(item => (
                      <div key={item.id} className="bg-white rounded-xl p-4 flex items-center gap-4"
                        style={{ boxShadow: '0 4px 12px rgba(19, 27, 46, 0.04)' }}>
                        <div className="w-12 h-12 rounded-lg bg-[#f2f3ff] overflow-hidden flex items-center justify-center shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-xl text-[#a5a6aa]">inventory_2</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#131b2e] truncate">{item.product_name}</p>
                          <p className="text-xs text-[#454652]">
                            {[item.size_name, item.color_name, item.variant_name].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-[#131b2e]">{formatPrice(item.unit_price)}</p>
                          <p className="text-xs text-[#454652]">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-[#dae2fd]/60 pt-4 space-y-2">
                  {[
                    ['Tổng tiền sản phẩm', selectedOrder.subtotal || selectedOrder.total_price],
                    ['Phí vận chuyển', selectedOrder.shipping_fee],
                    ['Giảm giá', -selectedOrder.discount_amount],
                  ].filter(([, v]) => v > 0).map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm text-[#454652]">
                      <span>{label}</span>
                      <span className={value < 0 ? 'text-[#e05c5c]' : ''}>
                        {value < 0 ? `-${formatPrice(Math.abs(value))}` : formatPrice(value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base text-[#131b2e] pt-2 border-t border-[#dae2fd]/60">
                    <span>Thành tiền</span>
                    <span className="text-[#4450b7]">{formatPrice(selectedOrder.total_price)}</span>
                  </div>
                </div>

                {/* Shipping */}
                {selectedOrder.shipping_address && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#454652] mb-2">Địa chỉ giao hàng</p>
                    <p className="text-sm text-[#131b2e]">{selectedOrder.shipping_address}</p>
                  </div>
                )}

                {/* Cancel */}
                {isCancellable(selectedOrder.status) && (
                  <div className="flex justify-end pt-2 border-t border-[#dae2fd]/60">
                    <button
                      onClick={() => { setCancelTarget(selectedOrder); setCancelReason('') }}
                      className="px-5 py-2.5 bg-[#fef0f0] text-[#c9392c] text-sm font-medium rounded-xl
                        hover:bg-[#fedcdc] transition-all">
                      Hủy đơn hàng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-[#131b2e]/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#faf8ff] rounded-2xl w-full max-w-md p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#fef0f0] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c9392c]">warning</span>
              </div>
              <div>
                <h3 className="font-['Space_Grotesk'] font-bold text-[#131b2e]">Hủy đơn hàng</h3>
                <p className="text-xs text-[#454652]">#{cancelTarget.order_number}</p>
              </div>
            </div>
            <p className="text-sm text-[#454652] mb-4">
              Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Lý do hủy (tùy chọn)"
              rows={3}
              className="w-full bg-[#f2f3ff] rounded-xl px-4 py-3 text-sm text-[#131b2e] placeholder:text-[#a5a6aa]
                outline-none focus:bg-white focus:ring-2 focus:ring-[#4450b7]/20 transition-all resize-none mb-5"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setCancelTarget(null); setCancelReason('') }}
                className="px-5 py-2.5 bg-[#f2f3ff] text-[#454652] text-sm font-medium rounded-xl hover:bg-[#dae2fd] transition-all">
                Đóng
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="px-5 py-2.5 bg-[#c9392c] text-white text-sm font-medium rounded-xl
                  hover:opacity-90 transition-all disabled:opacity-50">
                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
