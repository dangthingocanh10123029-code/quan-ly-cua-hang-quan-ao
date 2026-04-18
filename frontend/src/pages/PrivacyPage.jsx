import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={0} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-screen-2xl mx-auto px-8 text-center">
            <span className="material-symbols-outlined text-6xl mb-4 text-primary">security</span>
            <h1 className="text-5xl font-bold mb-4">Chính Sách Bảo Mật</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Cam kết bảo vệ thông tin cá nhân của khách hàng
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-24 max-w-4xl mx-auto px-8">
          <div className="prose prose-lg max-w-none">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">1. Thu thập thông tin</h2>
              <p className="text-slate-600 mb-4">
                Chúng tôi thu thập các thông tin cá nhân khi bạn:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Đăng ký tài khoản trên website</li>
                <li>Thực hiện đặt hàng</li>
                <li>Đăng ký nhận bản tin</li>
                <li>Liên hệ với bộ phận chăm sóc khách hàng</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">2. Thông tin thu thập</h2>
              <p className="text-slate-600 mb-4">
                Thông tin cá nhân chúng tôi thu thập bao gồm:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Họ và tên</li>
                <li>Địa chỉ email</li>
                <li>Số điện thoại</li>
                <li>Địa chỉ giao hàng</li>
                <li>Thông tin thanh toán</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">3. Sử dụng thông tin</h2>
              <p className="text-slate-600 mb-4">
                Thông tin cá nhân của bạn được sử dụng để:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Xử lý đơn hàng và giao hàng</li>
                <li>Liên lạc về tình trạng đơn hàng</li>
                <li>Gửi thông tin về sản phẩm và khuyến mãi (nếu bạn đồng ý)</li>
                <li>Cải thiện dịch vụ khách hàng</li>
                <li>Phát hiện và ngăn chặn gian lận</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">4. Bảo mật thông tin</h2>
              <p className="text-slate-600 mb-4">
                CLOTH cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Mã hóa dữ liệu SSL 256-bit</li>
                <li>Lưu trữ an toàn trên máy chủ bảo mật</li>
                <li>Hạn chế quyền truy cập nhân viên</li>
                <li>Thường xuyên cập nhật hệ thống bảo mật</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">5. Quyền của khách hàng</h2>
              <p className="text-slate-600 mb-4">
                Bạn có quyền:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Truy cập thông tin cá nhân của mình</li>
                <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
                <li>Yêu cầu xóa thông tin cá nhân</li>
                <li>Từ chối nhận email marketing</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">6. Liên hệ</h2>
              <p className="text-slate-600">
                Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
              </p>
              <div className="mt-4 p-6 bg-slate-50 rounded-xl">
                <p className="font-bold mb-2">CLOTH - Bộ phận Chăm sóc Khách hàng</p>
                <p className="text-slate-600">Email: privacy@cloth.com</p>
                <p className="text-slate-600">Hotline: 1900 1234</p>
                <p className="text-slate-600">Địa chỉ: 123 Đại lộ Tech, Quận 1, TP.HCM</p>
              </div>
            </div>

            <div className="text-sm text-slate-500 text-center mt-12">
              <p>Cập nhật lần cuối: Tháng 4/2024</p>
            </div>
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  )
}

export default PrivacyPage
