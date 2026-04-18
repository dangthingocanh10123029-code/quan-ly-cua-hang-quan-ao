import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Plus, Truck, Package, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

export default function AdminImport() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ supplier_id: '', warehouse_id: '1', note: '', items: [] })
  const [suppliers, setSuppliers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/supplier-orders')
      setOrders(res.orders)
    } catch (err) {
      console.error('Fetch supplier orders error:', err)
      setOrders([])
    } finally { setLoading(false) }
  }

  const statusConfig = {
    draft: { label: 'Bản nháp', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock },
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
    ordered: { label: 'Đã đặt hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Truck },
    partial_received: { label: 'Nhận một phần', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Package },
    received: { label: 'Đã nhận đủ', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  }

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Nhập hàng từ nhà cung cấp</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={18} /> Tạo đơn nhập hàng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng đơn nhập', value: '4', color: 'from-blue-500 to-blue-700' },
          { label: 'Đã nhận đủ', value: '2', color: 'from-green-500 to-green-700' },
          { label: 'Đang chờ', value: '1', color: 'from-yellow-500 to-yellow-700' },
          { label: 'Tổng giá trị', value: '85M', color: 'from-purple-500 to-purple-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nhà cung cấp</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kho nhận</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đặt</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Đã thanh toán</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>)}</tr>
            )) : orders.map(order => {
              const st = statusConfig[order.status] || statusConfig.draft
              const StIcon = st.icon
              return (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold font-mono text-blue-600">{order.order_code}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{order.supplier_name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{order.warehouse_name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{order.order_date}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{formatPrice(order.paid_amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${st.color}`}>
                      <StIcon size={12} />{st.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Tạo đơn nhập hàng mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                <select className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Chọn nhà cung cấp</option>
                  <option value="1">Công Ty TNHH Thời Trang Phương Nam</option>
                  <option value="2">Công Ty CP Dệt May Thắng Lợi</option>
                  <option value="3">Hai Yen Fashion Co., Ltd</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kho nhận <span className="text-red-500">*</span></label>
                <select className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="1">Kho Hàng Chính TP.HCM</option>
                  <option value="2">Kho Hàng Hà Nội</option>
                  <option value="3">Kho Hàng Cần Thơ</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt</label>
                  <input type="date" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến nhận</label>
                  <input type="date" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
                Thêm sản phẩm nhập hàng sẽ được phát triển thêm
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Tạo đơn nhập</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
