import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Search, Plus, Eye, Edit, Trash2, Star, CheckCircle, Clock, MessageSquare } from 'lucide-react'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all') // all, pending, approved
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => { fetchReviews() }, [page, filter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/reviews', { params: { page, filter } })
      setReviews(res.reviews)
    } catch (err) {
      console.error('Fetch reviews error:', err)
      setReviews([])
    } finally { setLoading(false) }
  }

  const approveReview = async (id) => {
    try { await api.put(`/admin/reviews/${id}/approve`) } catch {}
    setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: true } : r))
  }

  const submitReply = async (reviewId) => {
    try {
      const res = await api.put(`/admin/reviews/${reviewId}/reply`, { reply: replyText })
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, admin_reply: replyText } : r))
      setReplyId(null)
      setReplyText('')
    } catch (err) {
      console.error('Failed to submit reply:', err)
    }
  }

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  )

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
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-48 animate-pulse" />
        )) : reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  {renderStars(r.rating)}
                  <h4 className="font-semibold text-gray-800">{r.title}</h4>
                  {r.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} /> Đã mua hàng
                    </span>
                  )}
                  {r.is_approved ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Đã duyệt</span>
                  ) : (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Chờ duyệt</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{r.content}</p>
                <p className="text-xs text-gray-400 mt-2">Sản phẩm: <span className="text-gray-600 font-medium">{r.product_name}</span> • Khách hàng: <span className="text-gray-600 font-medium">{r.user_name}</span> • {r.created_at}</p>
                {r.admin_reply && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm">
                    <p className="text-xs text-blue-500 font-semibold mb-1">Phản hồi của shop:</p>
                    <p className="text-gray-700">{r.admin_reply}</p>
                  </div>
                )}
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
              <div className="flex items-center gap-2 ml-4">
                {!r.is_approved && (
                  <button onClick={() => approveReview(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                    <CheckCircle size={14} /> Duyệt
                  </button>
                )}
                <button onClick={() => { setReplyId(r.id); setReplyText('') }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Trả lời">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
