import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, UserCog, Mail, Phone, DollarSign, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'

const emptyEmp = {
  first_name: '', last_name: '', email: '', phone: '', id_card: '',
  position: '', department: '', hire_date: '', salary: '', gender: 'male',
}

export default function AdminEmployees() {
  const toast = useToast()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyEmp)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchEmployees() }, [page, search])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/employees', { params: { page, search } })
      setEmployees(res.employees)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Fetch employees error:', err)
      setEmployees([])
      setTotalPages(1)
    } finally { setLoading(false) }
  }

  const toggleStatus = async (emp) => {
    try {
      const res = await api.put(`/admin/employees/${emp.id}/toggle`)
      setEmployees(employees.map(e => e.id === emp.id ? { ...e, is_active: !e.is_active } : e))
      toast.success('Đã cập nhật trạng thái nhân viên')
    } catch (err) {
      console.error('Toggle status error:', err)
      setEmployees(employees.map(e => e.id === emp.id ? { ...e, is_active: !e.is_active } : e))
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        const res = await api.put(`/admin/employees/${editing}`, form)
        setEmployees(employees.map(e => e.id === editing ? res.employee : e))
        toast.success('Đã cập nhật nhân viên')
      } else {
        const res = await api.post('/admin/employees', form)
        setEmployees([...employees, res.employee])
        toast.success('Đã thêm nhân viên mới')
      }
      setShowForm(false)
      setForm(emptyEmp)
      setEditing(null)
    } catch (err) {
      console.error('Save employee error:', err)
      toast.error(err.response?.data?.message || 'Lưu nhân viên thất bại')
      setShowForm(false)
    }
  }

  const handleEdit = (emp) => {
    console.log('Editing employee:', emp)
    const parts = emp.full_name ? emp.full_name.trim().split(' ') : ['', '']
    const first_name = parts[0] || ''
    const last_name = parts.slice(1).join(' ') || ''
    setForm({ first_name, last_name, email: emp.email || '', phone: emp.phone || '', id_card: emp.id_card || '', position: emp.position || '', department: emp.department || '', hire_date: emp.hire_date || '', salary: emp.salary || '', gender: emp.gender || 'male' })
    setEditing(emp.id)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/admin/employees/${deleteTarget.id}`)
      setEmployees(employees.filter(e => e.id !== deleteTarget.id))
      toast.success('Đã xóa nhân viên')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa nhân viên thất bại')
    } finally {
      setDeleteTarget(null)
    }
  }

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm nhân viên..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => { setForm(emptyEmp); setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={18} /> Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nhân viên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã NV</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Liên hệ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Chức vụ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày vào</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>)}</tr>)
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                        {emp.full_name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{emp.full_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{emp.employee_code}</span></td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-600 flex items-center gap-1"><Mail size={13} />{emp.email}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={13} />{emp.phone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{emp.position}</p>
                    <p className="text-xs text-gray-400">{emp.department}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{emp.hire_date}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => toggleStatus(emp)} className={emp.is_active ? 'text-green-500' : 'text-gray-300'}>
                      {emp.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(emp)} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"><Edit size={16} /></button>
                      <button onClick={() => setDeleteTarget(emp)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ <span className="text-red-500">*</span></label>
                  <input type="text" value={form.first_name} required onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
                  <input type="text" value={form.last_name} required onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD</label>
                  <input type="text" value={form.id_card} onChange={e => setForm({ ...form, id_card: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                  <input type="text" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                  <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào</label>
                  <input type="date" value={form.hire_date} onChange={e => setForm({ ...form, hire_date: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lương</label>
                  <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
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
            <p className="text-sm text-gray-600 mb-5">Bạn có chắc muốn xóa nhân viên <strong>"{deleteTarget.full_name}"</strong>?</p>
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