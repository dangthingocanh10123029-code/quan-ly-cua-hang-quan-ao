import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { Search, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Percent, Calendar, Clock, AlertCircle } from 'lucide-react'

export default function AdminPromotions() {
  const toast = useToast()
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', promotion_type: 'flash_sale',
    discount_type: 'percentage', discount_value: '', max_discount_amount: '',
    valid_from: '', valid_until: '', is_active: true, is_featured: false,
    applicable_products: '', applicable_categories: '',
  })
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchPromotions() }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/promotions')
      setPromotions(res.promotions)
    } catch (err) {
      console.error('Fetch promotions error:', err)
      setPromotions([])
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        const res = await api.put(`/admin/promotions/${editing}`, form)
        setPromotions(promotions.map(p => p.id === editing ? res.promotion : p))
        toast.success('Đã cập nhật khuyến mãi')
      } else {
        const res = await api.post('/admin/promotions', form)
        setPromotions([...promotions, res.promotion])
        toast.success('Đã thêm khuyến mãi mới')
      }
      setShowForm(false)
      setEditing(null)
      setForm({ name: '', slug: '', description: '', promotion_type: 'flash_sale', discount_type: 'percentage', discount_value: '', max_discount_amount: '', valid_from: '', valid_until: '', is_active: true, is_featured: false, applicable_products: '', applicable_categories: '' })
    } catch {
      toast.error('Lưu khuyến mãi thất bại')
      setShowForm(false)
    }
  }

  const handleEdit = (promo) => {
    setForm({ ...promo, applicable_products: '', applicable_categories: '' })
    setEditing(promo.id)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/admin/promotions/${deleteTarget.id}`)
      setPromotions(promotions.filter(p => p.id !== deleteTarget.id))
      toast.success('Đã xóa khuyến mãi')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa khuyến mãi thất bại')
    } finally {
      setDeleteTarget(null)
    }
  }

  const toggle = async (promo, field) => {
    try {
      await api.put(`/admin/promotions/${promo.id}`, { [field]: !promo[field] })
      setPromotions(promotions.map(p => p.id === promo.id ? { ...p, [field]: !promo[field] } : p))
      toast.success('Đã cập nhật trạng thái')
    } catch {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const typeLabels = { flash_sale: 'Flash Sale', buy_x_get_y: 'Mua X tặng Y', bundle: 'Combo', tier_discount: 'Giảm theo bậc', free_shipping: 'Miễn phí ship', gift: 'Quà tặng' }
  const typeColors = { flash_sale: 'bg-red-50 text-red-700', buy_x_get_y: 'bg-blue-50 text-blue-700', bundle: 'bg-purple-50 text-purple-700', tier_discount: 'bg-green-50 text-green-700', free_shipping: 'bg-yellow-50 text-yellow-700', gift: 'bg-pink-50 text-pink-700' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách khuyến mãi</h2>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={18} /> Thêm khuyến mãi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-48 animate-pulse border shadow-sm" />) :
          promotions.map(promo => (
            <div key={promo.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeColors[promo.promotion_type] || 'bg-gray-100 text-gray-700'}`}>
                  {typeLabels[promo.promotion_type] || promo.promotion_type}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(promo)} className="p-1.5 rounded text-gray-400 hover:text-green-600"><Edit size={15} /></button>
                  <button onClick={() => setDeleteTarget(promo)} className="p-1.5 rounded text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mt-3">{promo.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock size={12} />{promo.valid_from}</span>
                <span>- {promo.valid_until}</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-sm font-semibold text-blue-600">
                  {promo.discount_type === 'percentage' ? `-${promo.discount_value}%` : `${new Intl.NumberFormat('vi-VN').format(promo.discount_value)}đ`}
                </span>
                <button onClick={() => toggle(promo, 'is_active')} className={promo.is_active ? 'text-green-500' : 'text-gray-300'}>
                  {promo.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
            </div>
          ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khuyến mãi <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} required onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description} rows={2} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                  <select value={form.promotion_type} onChange={e => setForm({ ...form, promotion_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="flash_sale">Flash Sale</option>
                    <option value="buy_x_get_y">Mua X tặng Y</option>
                    <option value="bundle">Combo</option>
                    <option value="tier_discount">Giảm theo bậc</option>
                    <option value="free_shipping">Miễn phí ship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm theo</label>
                  <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="percentage">%</option>
                    <option value="fixed_amount">Số tiền cố định</option>
                    <option value="price">Giá cố định</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm <span className="text-red-500">*</span></label>
                  <input type="number" value={form.discount_value} required onChange={e => setForm({ ...form, discount_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label>
                  <input type="number" value={form.max_discount_amount} onChange={e => setForm({ ...form, max_discount_amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                  <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                  <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Nổi bật</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Hoạt động</span></label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Bạn có chắc muốn xóa khuyến mãi <strong>"{deleteTarget.name}"</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}