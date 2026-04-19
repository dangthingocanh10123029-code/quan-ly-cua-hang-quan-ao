import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { orderAPI } from '../services/api'
import { formatPrice } from '../utils/formatPrice'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getCartTotal, getItemCount, clearCart } = useCart()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Contact
    email: '',
    phone: '',
    // Shipping
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    // Payment
    paymentMethod: 'cod'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const subtotal = getCartTotal()
  const shipping = 0 // Miễn phí vận chuyển
  const total = subtotal + shipping

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Auto-fill personal info from auth user
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').trim().split(' ')
      const lastName = nameParts.pop() || ''
      const firstName = nameParts.join(' ')
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || '',
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
      }))
    }
  }, [user])

  const buildShippingAddress = () => {
    const parts = [formData.address, formData.apartment, formData.ward, formData.district, formData.city]
      .filter(Boolean)
      .join(', ')
    return parts
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        product_name: item.name,
        product_image: item.image,
        unit_price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }))

      const payload = {
        items: orderItems,
        shipping_address: buildShippingAddress(),
        recipient_name: `${formData.firstName} ${formData.lastName}`.trim(),
        recipient_phone: formData.phone,
        ward: formData.ward,
        district: formData.district,
        city: formData.city,
        shipping_fee: shipping,
        discount_amount: 0,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === 'cod' ? 'unpaid' : 'paid',
        note: formData.note,
      }

      const res = await orderAPI.createOrder(payload)

      if (res.success) {
        clearCart()
        toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.')
        navigate('/order-success', {
          state: {
            order_number: res.order.order_number,
            order_id: res.order.id,
            payment_method: formData.paymentMethod
          }
        })
      } else {
        toast.error(res.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
        setLoading(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartCount={0} />
        <main className="pt-20 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-8xl text-outline mb-6">shopping_cart</span>
            <h1 className="text-4xl font-headline font-bold tracking-tighter text-on-surface mb-4">Giỏ hàng trống</h1>
            <p className="text-on-surface-variant mb-8">Bạn chưa có sản phẩm nào để thanh toán</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary font-headline font-semibold rounded-lg hover:bg-primary/90 transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={getItemCount()} />
      
      <main className="pt-20 max-w-screen-2xl mx-auto px-6 md:px-12 py-16">
        {/* Page Title */}
        <header className="mb-12">
          <Link to="/cart" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Quay lại giỏ hàng
          </Link>
          <h1 className="text-4xl font-headline font-bold tracking-tighter text-on-surface">Thanh toán</h1>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Section */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Contact Information */}
              <section className="bg-surface-container-low rounded-2xl p-8">
                <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Thông tin liên hệ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Số điện thoại <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0912 345 678"
                      required
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-surface-container-low rounded-2xl p-8">
                <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  Địa chỉ giao hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Họ <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Nguyễn"
                      required
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Tên <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Văn A"
                      required
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Địa chỉ <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Đường ABC, Phường XYZ"
                      required
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Căn hộ, suite, v.v. (tùy chọn)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="Tầng 5, Phòng 501"
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Tỉnh / Thành phố <span className="text-error">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="danang">Đà Nẵng</option>
                      <option value="cantho">Cần Thơ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Quận / Huyện <span className="text-error">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Chọn quận/huyện</option>
                      <option value="1">Quận 1</option>
                      <option value="3">Quận 3</option>
                      <option value="5">Quận 5</option>
                      <option value="7">Quận 7</option>
                      <option value="go-vap">Gò Vấp</option>
                      <option value="tan-binh">Tân Bình</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng"
                      rows={3}
                      className="w-full bg-surface-container-lowest border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-surface-container-low rounded-2xl p-8">
                <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">credit_card</span>
                  Phương thức thanh toán
                </h2>
                <div className="space-y-4">
                  {/* COD */}
                  <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/40 hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cod' ? 'border-primary' : 'border-outline'}`}>
                      {formData.paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                    <div className="flex-1">
                      <p className="font-headline font-semibold text-on-surface">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-on-surface-variant">Trả tiền mặt khi nhận được hàng</p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/40 hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'bank' ? 'border-primary' : 'border-outline'}`}>
                      {formData.paymentMethod === 'bank' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                    <div className="flex-1">
                      <p className="font-headline font-semibold text-on-surface">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-on-surface-variant">Thanh toán trực tiếp qua tài khoản ngân hàng</p>
                    </div>
                  </label>

                  {/* VNPay */}
                  <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'vnpay' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/40 hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={formData.paymentMethod === 'vnpay'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'vnpay' ? 'border-primary' : 'border-outline'}`}>
                      {formData.paymentMethod === 'vnpay' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">qr_code</span>
                    <div className="flex-1">
                      <p className="font-headline font-semibold text-on-surface">Thanh toán qua VNPay</p>
                      <p className="text-sm text-on-surface-variant">Thanh toán bằng QR code qua ứng dụng ngân hàng</p>
                    </div>
                  </label>

                  {/* MoMo */}
                  <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'momo' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/40 hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={formData.paymentMethod === 'momo'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'momo' ? 'border-primary' : 'border-outline'}`}>
                      {formData.paymentMethod === 'momo' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">phone_android</span>
                    <div className="flex-1">
                      <p className="font-headline font-semibold text-on-surface">Thanh toán qua MoMo</p>
                      <p className="text-sm text-on-surface-variant">Thanh toán nhanh chóng qua ứng dụng MoMo</p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="lg:col-span-4">
              <div className="bg-surface-container-low rounded-2xl p-8 sticky top-32">
                <h2 className="text-xl font-headline font-bold text-on-surface mb-6">Tóm tắt đơn hàng</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 pb-6 border-b border-outline-variant/40 max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface-container-lowest flex-shrink-0 relative">
                        <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-on-primary text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-on-surface text-sm truncate">{item.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {item.color && `Màu: ${item.color}`} {item.color && item.size && ' | '} {item.size && `Size: ${item.size}`}
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-4 py-6 border-b border-outline-variant/40">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Tạm tính</span>
                    <span className="text-on-surface">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end py-6">
                  <span className="text-lg font-headline font-medium text-on-surface">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-bold text-on-surface">{formatPrice(total)}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Đã bao gồm VAT</p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-lg text-on-primary font-headline font-bold text-lg tracking-tight hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] duration-200 bg-gradient-to-r from-primary to-primary-container disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Đang xử lý...
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined align-middle mr-2">lock</span>
                      Đặt hàng ngay
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-3 mt-6 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <p className="text-xs">Thanh toán an toàn & bảo mật</p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}

export default CheckoutPage
