import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { Star, CheckCircle, Clock, MessageSquare, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

export default function AdminReviews() {
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('all')
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)

  useEffect(() => { fetchReviews() }, [page, filter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/reviews', { params: { page, filter } })
      setReviews(res.reviews || [])
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      console.error('Fetch reviews error:', err)
      setReviews([])
    } finally { setLoading(false) }
  }

  const approveReview = async (id) => {
    try {
      await api.put(`/admin/reviews/${id}/approve`)
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: 1 } : r))
      toast.success('Đã duyệt đánh giá')
    } catch {
      toast.error('Không thể duyệt đánh giá')
    }
  }

  const toggleActive = async (review) => {
    setToggleTarget(review.id)
    try {
      await api.put(`/admin/reviews/${review.id}/toggle`, { is_active: review.is_active ? 0 : 1 })
      setReviews(reviews.map(r => r.id === review.id ? { ...r, is_active: r.is_active ? 0 : 1 } : r))
      toast.success('Đã cập nhật trạng thái hiển thị')
    } catch {
      toast.error('Không thể cập nhật trạng thái')
      setReviews(reviews.map(r => r.id === review.id ? { ...r, is_active: review.is_active } : r))
    } finally { setToggleTarget(null) }
  }

  const submitReply = async (reviewId) => {
    if (!replyText.trim()) { toast.warning('Vui lòng nhập nội dung phản hồi'); return }
    try {
      await api.put(`/admin/reviews/${reviewId}/reply`, { reply: replyText })
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, admin_reply: replyText } : r))
      setReplyId(null)
      setReplyText('')
      toast.success('Đã gửi phản hồi')
    } catch {
      toast.error('Không thể gửi phản hồi')
    }
  }

  const deleteReview = async (id) => {
    try {
      await api.delete(`/admin/reviews/${id}`)
      setReviews(reviews.filter(r => r.id !== id))
      setDeleteTarget(null)
      toast.success('Đã xóa đánh giá')
    } catch {
      toast.error('Không thể xóa đánh giá')
    }
  }

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  )

  const getAvatar = (user_name, avatar) => {
    if (avatar) return <img src={avatar} alt={user_name} className="w-10 h-10 rounded-full object-cover" />
    return (
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
        {user_name ? user_name.charAt(0).toUpperCase() : '?'}
      </div>
    )
  }

  const getProductImage = (img) => img ? <img src={img} alt="" className="w-14 h-14 rounded-lg object-cover" /> : null

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-2">
        {[{ key: 'all', label: 'Tất cả' }, { key: 'pending', label: 'Chờ duyệt' }, { key: 'approved', label: 'Đã duyệt' }].map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-56 animate-pulse" />
        )) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-20" />
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                {/* User + review info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getProductImage(r.product_image)}
                  <div className="flex-1 min-w-0">
                    {/* Stars + status badges */}
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      {renderStars(r.rating)}
                      {r.is_approved ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle size={12} /> Đã duyệt
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                          <Clock size={12} /> Chờ duyệt
                        </span>
                      )}
                      {!r.is_active && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Đã ẩn</span>
                      )}
                    </div>
                    {/* Content */}
                    <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                      <span>Khách hàng: <span className="text-gray-600 font-medium">{r.user_name || 'Không xác định'}</span></span>
                      <span>Sản phẩm: <span className="text-gray-600 font-medium">{r.product_name}</span></span>
                      <span>{formatDate(r.created_at)}</span>
                    </div>
                    {/* Admin reply */}
                    {r.admin_reply && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm">
                        <p className="text-xs text-blue-500 font-semibold mb-1">Phản hồi của shop:</p>
                        <p className="text-gray-700">{r.admin_reply}</p>
                        {r.replied_at && <p className="text-xs text-gray-400 mt-1">{formatDate(r.replied_at)}</p>}
                      </div>
                    )}
                    {/* Reply form */}
                    {replyId === r.id && (
                      <div className="mt-3 flex gap-2">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder="Nhập phản hồi..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={e => e.key === 'Enter' && submitReply(r.id)} />
                        <button onClick={() => submitReply(r.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Gửi</button>
                        <button onClick={() => setReplyId(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!r.is_approved && (
                    <button onClick={() => approveReview(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                      <CheckCircle size={14} /> Duyệt
                    </button>
                  )}
                  <button onClick={() => toggleActive(r)} disabled={toggleTarget === r.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    title={r.is_active ? 'Ẩn đánh giá' : 'Hiện đánh giá'}>
                    {r.is_active ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                  <button onClick={() => { setReplyId(r.id); setReplyText(r.admin_reply || '') }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Trả lời">
                    <MessageSquare size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="Xóa">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><Trash2 size={24} className="text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-800">Xóa đánh giá</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
              <button onClick={() => deleteReview(deleteTarget.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
