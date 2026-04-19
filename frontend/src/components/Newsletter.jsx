import React, { useState } from 'react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="py-24 bg-[#0F172A] overflow-hidden relative">
      {/* Dot Pattern */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Atmospheric blur orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#4F46E5]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#7C3AED]/8 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '7000ms' }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#4F46E5]/8 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '9000ms' }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">

          {/* Heading */}
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-[-0.02em]">
            Đừng bỏ lỡ <span className="gradient-text">ưu đãi</span>
          </h2>
          <p className="text-slate-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
            Đăng ký nhận bản tin để cập nhật xu hướng mới nhất và ưu đãi đặc biệt dành riêng cho bạn.
          </p>

          {/* Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 focus:border-[#4F46E5]/50
                    transition-all duration-200 font-medium"
                />
              </div>
              <button
                type="submit"
                className="btn-primary h-14 px-8 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 flex-shrink-0"
              >
                Đăng ký
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-[#4F46E5]/20 border border-[#4F46E5]/30 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                <span className="material-symbols-outlined text-[#4F46E5] text-3xl">check</span>
              </div>
              <p className="text-white font-bold text-lg">Cảm ơn bạn đã đăng ký!</p>
              <p className="text-slate-400 text-sm">Chúng tôi sẽ gửi thông tin ưu đãi đến email của bạn.</p>
            </div>
          )}

          {/* Trust text */}
          <p className="text-slate-600 text-xs mt-6">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <a href="#" className="text-slate-500 underline hover:text-[#7C3AED] transition-colors">Điều khoản sử dụng</a>
            {' '}và{' '}
            <a href="#" className="text-slate-500 underline hover:text-[#7C3AED] transition-colors">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
