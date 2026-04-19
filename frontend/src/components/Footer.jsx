import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const quickLinks = [
    { name: 'Nam', href: '/nam' },
    { name: 'Nữ', href: '/nu' },
    { name: 'Trẻ em', href: '/tre-em' },
    { name: 'Giảm giá', href: '/giam-gia' }
  ]

  const infoLinks = [
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Giao hàng', href: '/shipping' },
    { name: 'Đổi trả', href: '/returns' },
    { name: 'Chính sách bảo mật', href: '/privacy' }
  ]

  const supportLinks = [
    { name: 'Trung tâm trợ giúp', href: '/help' },
    { name: 'Câu hỏi thường gặp', href: '/faq' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Tuyển dụng', href: '/careers' }
  ]

  const contactInfo = {
    address: '123 Đại lộ Tech, Quận 1, HCM',
    email: 'support@cloth.com',
    phone: '+84 900 123 456'
  }

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#4F46E5]/40 to-transparent" />

      {/* Main footer bg - dark inverted */}
      <div className="bg-[#0F172A] pt-24 pb-12 relative">
        {/* Dot pattern texture */}
        <div className="absolute inset-0 dot-pattern pointer-events-none opacity-40" />

        {/* Atmospheric glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#4F46E5]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
          {/* Top: Logo + Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

            {/* Brand Column - wider */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="inline-block group">
                <span className="font-display text-3xl font-bold text-white tracking-[-0.02em]">
                  CLOTH
                </span>
                <div className="h-0.5 w-0 group-hover:w-12 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] transition-all duration-500 mt-1 rounded-full" />
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Thương mại điện tử Phòng trưng bày Kỹ thuật. Tuyển chọn những mẫu trang phục kiến trúc và mô-đun tốt nhất từ năm 2018.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {[
                  { icon: 'public', label: 'Website' },
                  { icon: 'chat', label: 'Messenger' },
                  { icon: 'camera', label: 'Instagram' }
                ].map((s) => (
                  <a
                    key={s.icon}
                    href="#"
                    aria-label={s.label}
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                      text-slate-400 hover:bg-[#4F46E5]/20 hover:border-[#4F46E5]/30 hover:text-[#7C3AED] transition-all duration-200 group"
                  >
                    <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-display text-xs font-bold uppercase tracking-[0.15em] text-white/30">
                Mua sắm
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info Links */}
            <div className="space-y-4">
              <h4 className="font-display text-xs font-bold uppercase tracking-[0.15em] text-white/30">
                Thông tin
              </h4>
              <ul className="space-y-3">
                {infoLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h4 className="font-display text-xs font-bold uppercase tracking-[0.15em] text-white/30">
                Hỗ trợ
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

            {/* Contact */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4F46E5] text-base">pin_drop</span>
                {contactInfo.address}
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4F46E5] text-base">mail</span>
                {contactInfo.email}
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4F46E5] text-base">call</span>
                {contactInfo.phone}
              </span>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-500">
              © 2026 CLOTH. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
