import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Search, Plus, Eye, Edit, Trash2, MessageSquare, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'

export default function AdminContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [detail, setDetail] = useState(null)

  useEffect(() => { fetchContacts() }, [filter])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/contacts', { params: { filter } })
      setContacts(res.contacts)
    } catch (err) {
      console.error('Fetch contacts error:', err)
      setContacts([])
    } finally { setLoading(false) }
  }

  const statusConfig = {
    new: { label: 'Mới', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle },
    assigned: { label: 'Đã phân công', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Clock },
    in_progress: { label: 'Đang xử lý', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
    replied: { label: 'Đã phản hồi', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CheckCircle },
    resolved: { label: 'Đã giải quyết', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
    closed: { label: 'Đã đóng', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: X },
  }

  const typeLabels = { general: 'Chung', complaint: 'Khiếu nại', suggestion: 'Gợi ý', partnership: 'Hợp tác', warranty: 'Bảo hành', recruitment: 'Tuyển dụng' }
  const priorityColors = { low: 'text-gray-500', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-600' }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Tất cả</button>
        {Object.entries(statusConfig).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === k ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{v.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Người gửi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Chủ đề</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Loại</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày gửi</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>)}</tr>
            )) : contacts.map(c => {
              const statusInfo = statusConfig[c.status] || statusConfig.new
              const StatusIcon = statusInfo.icon
              return (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{c.subject}</p>
                    <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{c.message}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{typeLabels[c.contact_type] || c.contact_type}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{c.created_at}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit mx-auto ${statusInfo.color}`}>
                      <StatusIcon size={12} />{statusInfo.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setDetail(c)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Chi tiết liên hệ</h3>
              <button onClick={() => setDetail(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  {detail.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{detail.name}</p>
                  <p className="text-sm text-gray-500">{detail.email} • {detail.phone}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Chủ đề</p>
                <p className="font-medium text-gray-800">{detail.subject}</p>
                <p className="text-sm text-gray-600 mt-2">{detail.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Loại:</span> <span className="font-medium text-gray-800 ml-1">{typeLabels[detail.contact_type]}</span></div>
                <div><span className="text-gray-500">Nguồn:</span> <span className="font-medium text-gray-800 ml-1">{detail.source}</span></div>
                <div><span className="text-gray-500">Ngày gửi:</span> <span className="font-medium text-gray-800 ml-1">{detail.created_at}</span></div>
                <div><span className="text-gray-500">Trạng thái:</span>
                  <span className={`font-medium ml-1 ${priorityColors[detail.priority]}`}>{statusConfig[detail.status]?.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
