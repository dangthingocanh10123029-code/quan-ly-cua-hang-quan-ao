import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

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

  const contactInfo = {
    address: '123 Đại lộ Tech, Quận 1, HCM',
    email: 'support@cloth.com',
    phone: '+84 900 123 456'
  }

  const handleLinkClick = (e, href) => {
    if (href.startsWith('/')) {
      e.preventDefault()
      navigate(href)
    }
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      alert('Cảm ơn bạn đã đăng ký!')
      setEmail('')
    }
  }

  return (
    <footer className="w-full pt-24 pb-12 bg-slate-50 dark:bg-slate-950 font-body text-sm leading-relaxed">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-screen-2xl mx-auto">
        {/* Brand */}
        <div className="space-y-6">
          <Link to="/" className="text-xl font-bold text-slate-900 dark:text-slate-50">
            CLOTH
          </Link>
          <p className="text-slate-500 dark:text-slate-400">
            Thương mại điện tử Phòng trưng bày Kỹ thuật. Tuyển chọn những mẫu trang phục kiến trúc và mô-đun tốt nhất từ năm 2018.
          </p>
          <div className="flex gap-4">
            <a className="text-slate-500 hover:text-red-600 transition-colors cursor-pointer" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">public</span>
            </a>
            <a className="text-slate-500 hover:text-red-600 transition-colors cursor-pointer" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">chat</span>
            </a>
            <a className="text-slate-500 hover:text-red-600 transition-colors cursor-pointer" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">camera</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-6 text-slate-900 dark:text-slate-50">Liên kết nhanh</h4>
          <ul className="space-y-4">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Links */}
        <div>
          <h4 className="font-bold mb-6 text-slate-900 dark:text-slate-50">Thông tin</h4>
          <ul className="space-y-4">
            {infoLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div>
          <h4 className="font-bold mb-6 text-slate-900 dark:text-slate-50">Liên hệ</h4>
          <ul className="space-y-4 text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">pin_drop</span>
              {contactInfo.address}
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">mail</span>
              {contactInfo.email}
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">call</span>
              {contactInfo.phone}
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500">
        <p>© 2024 CLOTH. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
