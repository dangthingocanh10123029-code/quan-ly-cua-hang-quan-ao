import React, { useState } from 'react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      // Simulate subscription
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section className="py-24 px-8">
      <div className="max-w-screen-xl mx-auto bg-primary rounded-[2rem] p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-md">
          <h2 className="headline-font text-4xl font-bold mb-4">Tham gia cộng đồng</h2>
          <p className="text-primary-fixed-dim leading-relaxed">
            Đăng ký để nhận quyền truy cập sớm vào các đợt phát hành mới và thông tin kỹ thuật độc quyền. Không quảng cáo, chỉ có sự tinh tế.
          </p>
        </div>

        {/* Newsletter Form */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-md flex bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ email của bạn"
            className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/60 flex-1 px-4 text-sm"
            required
          />
          <button
            type="submit"
            className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary-fixed transition-colors cursor-pointer"
          >
            {submitted ? 'Đã đăng ký!' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Newsletter