import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice } from '../utils/formatPrice'

const ProfilePage = () => {
  const { user, isAuthenticated, updateUser, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || '',
    gender: user?.gender || ''
  })

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  const orders = [
    {
      id: 'LM-28491',
      name: 'Áo Khoác Wool Oversized',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
      date: '22/05/2024',
      price: 2450000,
      status: 'delivering'
    },
    {
      id: 'LM-27103',
      name: 'Giày Sneaker Performance X',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
      date: '10/05/2024',
      price: 1890000,
      status: 'completed'
    },
    {
      id: 'LM-25847',
      name: 'Quần Jean Slim Fit Premium',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200',
      date: '28/04/2024',
      price: 890000,
      status: 'completed'
    }
  ]

  const menuItems = [
    { id: 'profile', icon: 'person', label: 'Hồ sơ cá nhân', active: true },
    { id: 'orders', icon: 'shopping_bag', label: 'Đơn hàng của tôi' },
    { id: 'favorites', icon: 'favorite', label: 'Danh sách yêu thích' },
    { id: 'addresses', icon: 'location_on', label: 'Sổ địa chỉ' },
    { id: 'logout', icon: 'logout', label: 'Đăng xuất', danger: true }
  ]

  const handleEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate || '',
      gender: user?.gender || ''
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateUser(editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout()
      navigate('/')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      delivering: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', dot: true, label: 'Đang giao' },
      completed: { bg: 'bg-surface-variant', text: 'text-on-surface-variant', dot: false, label: 'Đã hoàn thành' },
      processing: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', dot: true, label: 'Đang xử lý' },
      cancelled: { bg: 'bg-error-container', text: 'text-on-error-container', dot: false, label: 'Đã hủy' }
    }
    return badges[status] || badges.processing
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />
      
      <main className="pt-20 max-w-screen-2xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-2 sticky top-32">
              <div className="mb-6 px-4">
                <h2 className="font-headline text-on-surface-variant text-xs font-bold uppercase tracking-widest">Tài khoản</h2>
              </div>
              <nav className="flex flex-col gap-1">
                <Link
                  to="/profile"
                  onClick={() => setActiveTab('profile')}
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'profile'
                      ? 'bg-surface-container text-primary font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container/50'
                  }`}
                >
                  {activeTab === 'profile' && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r"></div>
                  )}
                  <span className="material-symbols-outlined text-lg">person</span>
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  to="#"
                  onClick={() => setActiveTab('orders')}
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'orders'
                      ? 'bg-surface-container text-primary font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container/50'
                  }`}
                >
                  {activeTab === 'orders' && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r"></div>
                  )}
                  <span className="material-symbols-outlined text-lg">shopping_bag</span>
                  <span>Đơn hàng của tôi</span>
                </Link>
                <Link
                  to="#"
                  onClick={() => setActiveTab('favorites')}
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-surface-container text-primary font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container/50'
                  }`}
                >
                  {activeTab === 'favorites' && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r"></div>
                  )}
                  <span className="material-symbols-outlined text-lg">favorite</span>
                  <span>Danh sách yêu thích</span>
                </Link>
                <Link
                  to="#"
                  onClick={() => setActiveTab('addresses')}
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'addresses'
                      ? 'bg-surface-container text-primary font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container/50'
                  }`}
                >
                  {activeTab === 'addresses' && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r"></div>
                  )}
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  <span>Sổ địa chỉ</span>
                </Link>
                <div className="my-4 h-px bg-outline-variant/30 mx-4"></div>
                <button
                  onClick={handleLogout}
                  className="relative flex items-center gap-4 px-4 py-3 rounded-lg text-error hover:bg-error-container/20 transition-all w-full text-left"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-12">
            {/* User Profile Section */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Hồ sơ cá nhân</h1>
                  <p className="text-on-surface-variant mt-2">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/20">
                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Avatar Column */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'}
                        alt="Ảnh đại diện"
                        className="w-32 h-32 rounded-full object-cover border-4 border-surface-container shadow-md"
                      />
                      <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>
                    <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                      Thành viên {user.memberLevel || 'Bronze'}
                    </span>
                  </div>

                  {/* Info Grid */}
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Họ và tên</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-surface-container-lowest border border-outline rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-surface-container-lowest border border-outline rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Số điện thoại</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-surface-container-lowest border border-outline rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Ngày sinh</label>
                        <input
                          type="text"
                          value={editForm.birthDate}
                          onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                          className="w-full bg-surface-container-lowest border border-outline rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Giới tính</label>
                        <select
                          value={editForm.gender}
                          onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                          className="w-full bg-surface-container-lowest border border-outline rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex items-center justify-end gap-4 pt-4">
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 border border-outline text-on-surface rounded-lg hover:bg-surface-container transition-all"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-medium rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">save</span>
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <label className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Họ và tên</label>
                        <p className="text-lg font-medium text-on-surface">{user.name || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Email</label>
                        <p className="text-lg font-medium text-on-surface">{user.email || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Số điện thoại</label>
                        <p className="text-lg font-medium text-on-surface">{user.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Ngày sinh</label>
                        <p className="text-lg font-medium text-on-surface">{user.birthDate || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Giới tính</label>
                        <p className="text-lg font-medium text-on-surface">{user.gender || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="flex items-center justify-end md:col-span-2 pt-4">
                        <button
                          onClick={handleEdit}
                          className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-medium rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Chỉnh sửa thông tin
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Recent Orders Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-2xl font-bold text-on-surface">Đơn hàng gần đây</h2>
                <Link to="/orders" className="text-primary font-medium hover:underline flex items-center gap-1">
                  Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => {
                  const badge = getStatusBadge(order.status)
                  return (
                    <div
                      key={order.id}
                      className="bg-surface-container-low hover:bg-surface-container transition-all p-6 rounded-xl flex flex-wrap md:flex-nowrap items-center justify-between gap-6 group cursor-pointer"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-16 h-20 bg-surface-container-highest rounded-lg overflow-hidden">
                          <img
                            src={order.image}
                            alt={order.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-label text-outline uppercase tracking-wider">#{order.id}</span>
                          <h3 className="font-medium text-on-surface">{order.name}</h3>
                          <p className="text-sm text-on-surface-variant">Ngày đặt: {order.date}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col md:items-end gap-2">
                        <div className={`px-3 py-1 ${badge.bg} ${badge.text} rounded text-xs font-bold uppercase tracking-tight flex items-center gap-1.5`}>
                          {badge.dot && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                          {badge.label}
                        </div>
                        <p className="font-headline font-bold text-lg">{formatPrice(order.price)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/favorites" className="bg-surface-container-low hover:bg-surface-container transition-all p-6 rounded-xl flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">favorite</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-on-surface">Yêu thích</h3>
                  <p className="text-sm text-on-surface-variant">5 sản phẩm</p>
                </div>
              </Link>
              <Link to="/addresses" className="bg-surface-container-low hover:bg-surface-container transition-all p-6 rounded-xl flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">location_on</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-on-surface">Địa chỉ</h3>
                  <p className="text-sm text-on-surface-variant">2 địa chỉ đã lưu</p>
                </div>
              </Link>
              <Link to="/settings" className="bg-surface-container-low hover:bg-surface-container transition-all p-6 rounded-xl flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">settings</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-on-surface">Cài đặt</h3>
                  <p className="text-sm text-on-surface-variant">Bảo mật & Privacy</p>
                </div>
              </Link>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
