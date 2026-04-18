import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  Search, Eye, Package, Truck, CheckCircle, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Filter, MoreHorizontal, Phone,
  MapPin, Clock, DollarSign, X
} from 'lucide-react'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
  processing: { label: 'Đang xử lý', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Package },
  shipped: { label: 'Đang giao', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Truck },
  delivered: { label: 'Đã giao', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  returned: { label: 'Trả hàng', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: RefreshCw },
}

const paymentConfig = {
  paid: { label: 'Đã thanh toán', color: 'bg-green-50 text-green-700' },
  unpaid: { label: 'Chưa thanh toán', color: 'bg-yellow-50 text-yellow-700' },
  partially_paid: { label: 'Thanh toán một phần', color: 'bg-blue-50 text-blue-700' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-gray-50 text-gray-700' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [detailOrder, setDetailOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const openDetail = async (order) => {
    setDetailLoading(true)
    try {
      const res = await api.get('/admin/orders/' + order.id)
      setDetailOrder(res.order)
    } catch (err) {
      console.error('Fetch order detail error:', err)
      setDetailOrder(order)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [page, status, search, dateRange])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = { page, status, search, date: dateRange }
      const res = await api.get('/admin/orders', { params })
      setOrders(res.orders)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Fetch orders error:', err)
      setOrders([])
      setTotalPages(1)
    } finally { setLoading(false) }
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true)
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus })
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (detailOrder?.id === orderId) setDetailOrder({ ...detailOrder, status: newStatus })
    } catch {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } finally { setUpdating(false) }
  }

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ'
  const formatDate = (d) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm mã đơn hàng, tên khách hàng..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1) }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(statusConfig).slice(0, 5).map(([k, v]) => {
          const count = orders.filter(o => o.status === k).length
          return (
            <button key={k} onClick={() => { setStatus(k); setPage(1) }}
              className={`bg-white rounded-xl p-4 text-left border shadow-sm transition-all hover:shadow-md ${status === k ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'}`}>
              <p className="text-xs text-gray-500">{v.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đặt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Thanh toán</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>)}</tr>
                ))
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-bold text-blue-600">{order.order_number}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-gray-900">{formatPrice(order.total_price)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentConfig[order.payment_status]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {paymentConfig[order.payment_status]?.label || order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[order.status]?.color || ''}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openDetail(order)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Chi tiết">
                        <Eye size={16} />
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
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{detailOrder.order_number}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(detailOrder.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig[detailOrder.status]?.color}`}>
                  {statusConfig[detailOrder.status]?.label}
                </span>
                <button onClick={() => setDetailOrder(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Khách hàng</h4>
                  <p className="font-semibold text-gray-800">{detailOrder.customer_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{detailOrder.customer_email}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone size={14} /> {detailOrder.customer_phone}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Địa chỉ giao hàng</h4>
                  <p className="text-sm text-gray-700 flex items-start gap-1">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                    {detailOrder.shipping_full_address}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Cập nhật trạng thái</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(detailOrder.id, k)}
                      disabled={detailOrder.status === k || updating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        detailOrder.status === k
                          ? `${v.color} border-current cursor-default`
                          : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                      } disabled:opacity-50`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sản phẩm</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">SL</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Đơn giá</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Tổng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detailLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-32" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-8 mx-auto" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto" /></td>
                          </tr>
                        ))
                      ) : detailOrder.items?.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-800">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800">{formatPrice(Number(item.unit_price))}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatPrice(Number(item.total_price))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(detailOrder.subtotal || detailOrder.total_price - 30000)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(30000)}</span>
                </div>
                {detailOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(detailOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{formatPrice(detailOrder.total_price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
