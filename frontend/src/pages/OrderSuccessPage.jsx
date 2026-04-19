import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const OrderSuccessPage = () => {
  const { clearCart, getItemCount } = useCart()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const orderData = location.state || {}
  const orderNumber = orderData.order_number || null
  const paymentMethod = orderData.payment_method || 'cod'

  const PAYMENT_LABEL = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank: 'Chuyển khoản ngân hàng',
    vnpay: 'Thanh toán qua VNPay',
    momo: 'Thanh toán qua MoMo',
  }

  useEffect(() => {
    if (getItemCount() > 0) {
      clearCart()
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  const handleViewOrders = () => {
    navigate('/orders')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />
      
      <main className="pt-20 min-h-[60vh] flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-lg">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-headline font-bold tracking-tighter text-on-surface mb-4">
            Đặt hàng thành công!
          </h1>
          
          <p className="text-on-surface-variant mb-2">
            Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.
          </p>
          
          {orderNumber && (
            <p className="text-on-surface-variant mb-8">
              Mã đơn hàng của bạn: <span className="font-headline font-bold text-primary">{orderNumber}</span>
            </p>
          )}

          {/* Order Info Card */}
          <div className="bg-surface-container-low rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-headline font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Thông tin đơn hàng
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Trạng thái:</span>
                <span className="text-green-600 font-medium">Đã xác nhận</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Phương thức thanh toán:</span>
                <span className="text-on-surface">{PAYMENT_LABEL[paymentMethod] || paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Dự kiến giao hàng:</span>
                <span className="text-on-surface">3-5 ngày làm việc</span>
              </div>
            </div>
          </div>

          {/* Email Notice */}
          <div className="bg-primary-fixed/20 rounded-xl p-4 mb-8">
            <p className="text-sm text-on-surface">
              <span className="material-symbols-outlined text-primary align-middle mr-2">mail</span>
              Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary font-headline font-semibold rounded-lg hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined">home</span>
              Tiếp tục mua sắm
            </Link>
            <button
              onClick={handleViewOrders}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary font-headline font-semibold rounded-lg hover:bg-primary hover:text-on-primary transition-all"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Xem đơn hàng
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default OrderSuccessPage
