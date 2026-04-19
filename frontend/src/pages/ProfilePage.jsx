import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice } from '../utils/formatPrice'
import api from '../services/api'

const NAV_ITEMS = [
  { id: 'profile',    path: '/profile',    label: 'Hồ sơ cá nhân',      icon: 'person' },
  { id: 'orders',     path: '/orders',      label: 'Đơn hàng của tôi',     icon: 'shopping_bag' },
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

function FieldLabel({ children }) {
  return (
    <p className="text-[11px] font-medium text-[#454652] uppercase tracking-[0.08em] mb-1">
      {children}
    </p>
  )
}

function FieldValue({ children }) {
  return (
    <p className="text-base font-medium text-[#131b2e] leading-snug">
      {children || <span className="text-[#a5a6aa] italic">Chưa cập nhật</span>}
    </p>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <FieldLabel>{label}{required && ' *'}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#f2f3ff] px-4 py-3 rounded-lg text-[#131b2e] text-sm placeholder:text-[#a5a6aa] outline-none
          focus:bg-white focus:ring-2 focus:ring-[#4450b7]/20 focus:ring-offset-0 transition-all duration-200"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-[#f2f3ff] px-4 py-3 rounded-lg text-[#131b2e] text-sm outline-none
          focus:bg-white focus:ring-2 focus:ring-[#4450b7]/20 transition-all duration-200 cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

const ProfilePage = () => {
  const { user, isAuthenticated, updateUser, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', birthDate: '', gender: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login')
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated && user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        gender: user.gender || ''
      })
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await api.get('/orders')
      if (res.success) setOrders(res.orders || [])
      else setOrders([])
    } catch { setOrders([]) } finally { setOrdersLoading(false) }
  }

  const handleEdit = () => {
    setEditForm({
      name: user?.name || '', email: user?.email || '',
      phone: user?.phone || '', birthDate: user?.birthDate || '', gender: user?.gender || ''
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      updateUser(editForm)
      setIsEditing(false)
    } finally { setSaving(false) }
  }

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout()
      navigate('/')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    } catch { return dateStr }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl animate-spin text-[#4450b7]">progress_activity</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  const hasRealOrders = orders.length > 0

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Header cartCount={0} />

      <main className="pt-20 max-w-screen-2xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ===== SIDEBAR ===== */}
          <aside className="lg:w-64 shrink-0 lg:sticky lg:top-[88px] lg:self-start">
            {/* User summary card */}
            <div className="bg-white rounded-2xl p-5 mb-3"
              style={{ boxShadow: '0 20px 40px rgba(19, 27, 46, 0.06)' }}>
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#eaedff]" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#4450b7] flex items-center justify-center
                    text-white font-bold text-lg font-['Space_Grotesk'] shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[#131b2e] truncate leading-tight">{user.name || 'Khách hàng'}</p>
                  <p className="text-xs text-[#454652] mt-0.5 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-[#f2f3ff] rounded-2xl p-2 flex flex-col gap-0.5">
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.id
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
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

              {/* Divider - tonal shift */}
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

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Profile Header */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[#131b2e] leading-none mt-6">
                  Hồ sơ cá nhân
                </h1>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="shrink-0 px-5 py-2.5 bg-gradient-to-br from-[#4450b7] to-[#5e6ad2] text-white text-sm font-medium rounded-lg
                    hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                  style={{ boxShadow: '0 8px 20px rgba(68, 80, 183, 0.25)' }}
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Chỉnh sửa
                </button>
              )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-8"
              style={{ boxShadow: '0 20px 40px rgba(19, 27, 46, 0.06)' }}>

              {/* Avatar + member level */}
              <div className="flex items-center gap-5 mb-10">
                <div className="relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Ảnh đại diện"
                      className="w-24 h-24 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-[#4450b7] flex items-center justify-center
                      text-white font-bold text-4xl font-['Space_Grotesk']">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <button className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#4450b7] text-white rounded-xl flex items-center justify-center
                    hover:opacity-80 transition-all"
                    style={{ boxShadow: '0 4px 12px rgba(68, 80, 183, 0.35)' }}>
                    <span className="material-symbols-outlined text-base">photo_camera</span>
                  </button>
                </div>
                <div>
                  <p className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">{user.name || 'Chưa cập nhật'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-[#eaedff] text-[#4450b7] text-xs font-semibold rounded-full">
                      Thành viên {user.memberLevel || 'Bronze'}
                    </span>
                    {user.email && (
                      <span className="text-xs text-[#454652]">{user.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputField label="Họ và tên" value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nguyễn Văn A" required />
                  <InputField label="Email" value={editForm.email} type="email"
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@example.com" />
                  <InputField label="Số điện thoại" value={editForm.phone} type="tel"
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="0912 345 678" />
                  <InputField label="Ngày sinh" value={editForm.birthDate}
                    onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })}
                    placeholder="15/05/1995" />
                  <SelectField label="Giới tính" value={editForm.gender}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                    options={[
                      { value: '', label: 'Chọn giới tính' },
                      { value: 'Nam', label: 'Nam' },
                      { value: 'Nữ', label: 'Nữ' },
                      { value: 'Khác', label: 'Khác' },
                    ]} />
                  <div className="flex items-end gap-3 md:col-span-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-[#f2f3ff] text-[#454652] text-sm font-medium rounded-xl hover:bg-[#dae2fd]/40 transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-8 py-3 bg-gradient-to-br from-[#4450b7] to-[#5e6ad2] text-white text-sm font-medium rounded-xl
                        hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-60"
                      style={{ boxShadow: '0 8px 20px rgba(68, 80, 183, 0.25)' }}
                    >
                      {saving ? (
                        <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Đang lưu...</>
                      ) : (
                        <><span className="material-symbols-outlined text-base">save</span> Lưu thay đổi</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <FieldLabel>Họ và tên</FieldLabel>
                    <FieldValue>{user.name}</FieldValue>
                  </div>
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <FieldValue>{user.email}</FieldValue>
                  </div>
                  <div>
                    <FieldLabel>Số điện thoại</FieldLabel>
                    <FieldValue>{user.phone}</FieldValue>
                  </div>
                  <div>
                    <FieldLabel>Ngày sinh</FieldLabel>
                    <FieldValue>{user.birthDate}</FieldValue>
                  </div>
                  <div>
                    <FieldLabel>Giới tính</FieldLabel>
                    <FieldValue>{user.gender}</FieldValue>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e] tracking-tight leading-none">
                    Đơn hàng gần đây
                  </h2>
                </div>
                {hasRealOrders && (
                  <Link to="/orders"
                    className="flex items-center gap-1 text-[#4450b7] text-sm font-medium hover:gap-2 transition-all duration-200">
                    Xem tất cả
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                )}
              </div>

              {ordersLoading ? (
                <div className="bg-[#f2f3ff] rounded-2xl p-10 flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-3xl animate-spin text-[#4450b7]">progress_activity</span>
                  <p className="text-sm text-[#454652]">Đang tải đơn hàng...</p>
                </div>
              ) : !hasRealOrders ? (
                <div className="bg-[#f2f3ff] rounded-2xl p-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#dae2fd] flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-3xl text-[#4450b7]">shopping_bag</span>
                  </div>
                  <p className="font-['Space_Grotesk'] text-lg font-semibold text-[#131b2e] mb-2">
                    Bạn chưa có đơn hàng nào
                  </p>
                  <p className="text-sm text-[#454652] mb-6">
                    Hãy bắt đầu mua sắm để có đơn hàng đầu tiên
                  </p>
                  <Link to="/"
                    className="px-7 py-3 bg-gradient-to-br from-[#4450b7] to-[#5e6ad2] text-white text-sm font-medium rounded-xl
                      hover:opacity-90 transition-all"
                    style={{ boxShadow: '0 8px 20px rgba(68, 80, 183, 0.25)' }}>
                    Khám phá sản phẩm
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.slice(0, 5).map(order => {
                    const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending
                    return (
                      <Link
                        key={order.id}
                        to="/orders"
                        onClick={() => setActiveTab('orders')}
                        className="bg-white rounded-2xl p-5 flex items-center gap-5
                          hover:bg-[#f2f3ff] transition-all duration-200 group"
                        style={{ boxShadow: '0 8px 24px rgba(19, 27, 46, 0.05)' }}
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl bg-[#f2f3ff] overflow-hidden flex items-center justify-center shrink-0">
                          {order.first_image ? (
                            <img src={order.first_image} alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <span className="material-symbols-outlined text-2xl text-[#a5a6aa]">inventory_2</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-medium text-[#a5a6aa] uppercase tracking-wider">
                              #{order.order_number}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[#131b2e]">{order.item_count} sản phẩm</p>
                          <p className="text-xs text-[#454652] mt-0.5">{formatDate(order.created_at)}</p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className="font-['Space_Grotesk'] font-bold text-base text-[#131b2e]">
                            {formatPrice(order.total_price)}
                          </p>
                          <span className="material-symbols-outlined text-lg text-[#a5a6aa] group-hover:text-[#4450b7] transition-colors">
                            chevron_right
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/favorites"
                className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:bg-[#f2f3ff] transition-all duration-200 group"
                style={{ boxShadow: '0 8px 24px rgba(19, 27, 46, 0.05)' }}>
                <div className="w-11 h-11 rounded-xl bg-[#fef0f0] flex items-center justify-center shrink-0
                  group-hover:bg-[#fedcdc] transition-colors">
                  <span className="material-symbols-outlined text-xl text-[#e05c5c]">favorite</span>
                </div>
                <div>
                  <p className="font-semibold text-[#131b2e] text-sm">Yêu thích</p>
                  <p className="text-xs text-[#454652]">Xem sản phẩm đã lưu</p>
                </div>
                <span className="material-symbols-outlined text-lg text-[#a5a6aa] ml-auto group-hover:text-[#4450b7] transition-colors">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
