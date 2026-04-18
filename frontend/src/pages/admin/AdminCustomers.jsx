import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, Mail, Phone, ToggleLeft, ToggleRight, X } from 'lucide-react'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCustomers() }, [page, search])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/customers', { params: { page, search } })
      setCustomers(res.customers || [])
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      console.error('Fetch customers error:', err)
      setCustomers([])
      setTotalPages(1)
    } finally { setLoading(false) }
  }

  const handleEdit = (c) => {
    setEditForm({ name: c.name, phone: c.phone || '', is_active: c.is_active })
    setSelected(c)
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) return
    try {
      setSaving(true)
      await api.put(`/admin/customers/${selected.id}`, editForm)
      setCustomers(customers.map(c => c.id === selected.id ? { ...c, ...editForm } : c))
      setShowEdit(false)
      setSelected(null)
    } catch (err) {
      console.error('Failed to update customer:', err)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa khách hàng này? Hành động này không thể hoàn tác.')) return
    try {
      await api.put(`/admin/customers/${id}`, { is_active: false })
      setCustomers(customers.map(c => c.id === id ? { ...c, is_active: false } : c))
    } catch (err) {
      console.error('Failed to delete customer:', err)
    }
  }

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p || 0) + 'đ'

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm theo tên, email, SĐT..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Liên hệ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Đơn hàng</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tổng chi tiêu</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Điểm</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>)}</tr>
                ))
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {c.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-600 flex items-center gap-1"><Mail size={13} /> {c.email}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5"><Phone size={13} /> {c.phone || '-'}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-sm font-semibold text-gray-800">{c.order_count || 0}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(c.total_spent)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-sm font-semibold text-yellow-600">{c.reward_points?.toLocaleString() || 0}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {c.is_active ? 'Hoạt động' : 'Khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelected(c)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(c)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Trang {page} / {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${
                    page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && !showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Chi tiết khách hàng</h3>
              <button onClick={() => { setSelected(null); setShowEdit(false) }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {selected.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.name}</p>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Đơn hàng</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{selected.order_count || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Tổng chi tiêu</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">{formatPrice(selected.total_spent)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">SĐT:</span><span className="text-gray-800">{selected.phone || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Điểm tích lũy:</span><span className="text-yellow-600 font-semibold">{selected.reward_points?.toLocaleString() || 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ngày tham gia:</span><span className="text-gray-800">{selected.created_at}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {selected.is_active ? 'Hoạt động' : 'Khóa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Sửa khách hàng</h3>
              <button onClick={() => { setShowEdit(false); setSelected(null) }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">Tài khoản hoạt động</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowEdit(false); setSelected(null) }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
                <button onClick={handleSaveEdit} disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
