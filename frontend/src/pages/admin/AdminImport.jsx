import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import {
  Plus, Truck, Package, CheckCircle, Clock, XCircle, AlertCircle,
  Trash2, Search, Eye, X, ChevronDown, RefreshCcw, Edit2
} from 'lucide-react'

const STATUS_CONFIG = {
  draft: { label: 'Bản nháp', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock },
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
  ordered: { label: 'Đã đặt hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Truck },
  partial_received: { label: 'Nhận một phần', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Package },
  received: { label: 'Đã nhận đủ', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
}

const PAYMENT_CONFIG = {
  unpaid: { label: 'Chưa thanh toán', color: 'text-red-600' },
  partial: { label: 'Thanh toán một phần', color: 'text-yellow-600' },
  paid: { label: 'Đã thanh toán', color: 'text-green-600' },
}

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p || 0) + 'đ'

export default function AdminImport() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])

  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')

  // Create/Edit modal
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formItems, setFormItems] = useState([])
  const [form, setForm] = useState({
    supplier_id: '', warehouse_id: '', order_date: '', expected_date: '', note: ''
  })

  // Detail modal
  const [detailOrder, setDetailOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [receiveMode, setReceiveMode] = useState(false)
  const [receiveItems, setReceiveItems] = useState([])
  const [receiving, setReceiving] = useState(false)

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Product search
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (filterStatus) params.status = filterStatus
      if (filterSupplier) params.supplier_id = filterSupplier
      const [ordersRes, suppliersRes, warehousesRes] = await Promise.all([
        api.get('/admin/supplier-orders', { params }),
        api.get('/admin/suppliers'),
        api.get('/admin/warehouses'),
      ])
      setOrders(ordersRes.orders || [])
      setSuppliers(suppliersRes.suppliers || [])
      setWarehouses(warehousesRes.warehouses || [])
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [search, filterStatus, filterSupplier])

  const fetchMeta = async () => {
    try {
      const [productsRes, sizesRes, colorsRes] = await Promise.all([
        api.get('/admin/products?all=1'),
        api.get('/admin/sizes'),
        api.get('/admin/colors'),
      ])
      setProducts(productsRes.products || [])
      setSizes(sizesRes.sizes || [])
      setColors(colorsRes.colors || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchMeta() }, [])

  // Product search filter
  useEffect(() => {
    if (!productSearch.trim()) { setFilteredProducts([]); return }
    const q = productSearch.toLowerCase()
    setFilteredProducts(
      products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      ).slice(0, 10)
    )
  }, [productSearch, products])

  const openForm = (order = null) => {
    if (order) {
      setEditingId(order.id)
      setForm({
        supplier_id: order.supplier_id || '',
        warehouse_id: order.warehouse_id || '',
        order_date: order.order_date || '',
        expected_date: order.expected_date || '',
        note: order.note || '',
      })
      setFormItems([])
    } else {
      setEditingId(null)
      setForm({ supplier_id: '', warehouse_id: '', order_date: '', expected_date: '', note: '' })
      setFormItems([])
    }
    setShowForm(true)
    fetchMeta()
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormItems([])
    setProductSearch('')
    setFilteredProducts([])
  }

  const addProduct = (product) => {
    if (formItems.find(i => i.product_id === product.id)) {
      toast.error('Sản phẩm đã có trong danh sách')
      return
    }
    setFormItems([...formItems, {
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku || '',
      variant_id: '',
      size_id: '',
      color_id: '',
      variant_name: '',
      quantity_ordered: 1,
      unit_cost: product.cost_price || 0,
    }])
    setProductSearch('')
    setFilteredProducts([])
    setShowProductDropdown(false)
  }

  const removeItem = (idx) => setFormItems(formItems.filter((_, i) => i !== idx))

  const updateItem = (idx, field, value) => {
    const updated = [...formItems]
    updated[idx] = { ...updated[idx], [field]: value }
    if (field === 'quantity_ordered' || field === 'unit_cost') {
      updated[idx].total_cost = (updated[idx].quantity_ordered || 0) * (updated[idx].unit_cost || 0)
    }
    setFormItems(updated)
  }

  const formSubtotal = formItems.reduce((s, i) => s + (i.quantity_ordered || 0) * (i.unit_cost || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.supplier_id) { toast.error('Chọn nhà cung cấp'); return }
    if (formItems.length === 0) { toast.error('Thêm ít nhất 1 sản phẩm'); return }
    try {
      const payload = {
        ...form,
        items: formItems.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          product_sku: i.product_sku,
          variant_id: i.variant_id || null,
          size_id: i.size_id || null,
          color_id: i.color_id || null,
          variant_name: i.variant_name || '',
          quantity_ordered: Number(i.quantity_ordered),
          unit_cost: Number(i.unit_cost),
        }))
      }
      if (editingId) {
        const res = await api.put(`/admin/supplier-orders/${editingId}`, payload)
        setOrders(orders.map(o => o.id === editingId ? res.order : o))
        toast.success('Đã cập nhật đơn nhập hàng')
      } else {
        const res = await api.post('/admin/supplier-orders', payload)
        setOrders([res.order, ...orders])
        toast.success('Đã tạo đơn nhập hàng')
      }
      closeForm()
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu thất bại')
    }
  }

  const openDetail = async (order) => {
    setDetailLoading(true)
    setDetailOrder(order)
    setReceiveMode(false)
    setReceiveItems([])
    try {
      const res = await api.get(`/admin/supplier-orders/${order.id}`)
      setDetailOrder(res.order)
      setReceiveItems(res.order.items?.map(i => ({ ...i, qty_received: i.quantity_received || 0 })) || [])
    } catch (err) {
      toast.error('Không thể tải chi tiết')
    } finally { setDetailLoading(false) }
  }

  const closeDetail = () => {
    setDetailOrder(null)
    setReceiveMode(false)
    setReceiveItems([])
  }

  const handleReceive = async () => {
    if (!detailOrder) return
    const validItems = receiveItems.filter(i => i.qty_received > 0)
    if (validItems.length === 0) { toast.error('Nhập số lượng nhận'); return }
    setReceiving(true)
    try {
      const res = await api.put(`/admin/supplier-orders/${detailOrder.id}/receive`, {
        items: validItems.map(i => ({ item_id: i.id, quantity_received: Number(i.qty_received) }))
      })
      setDetailOrder(res.order)
      setOrders(orders.map(o => o.id === detailOrder.id ? res.order : o))
      toast.success('Đã nhận hàng thành công')
      setReceiveMode(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Nhận hàng thất bại')
    } finally { setReceiving(false) }
  }

  const handleStatusChange = async (order, newStatus) => {
    try {
      const res = await api.put(`/admin/supplier-orders/${order.id}/status`, { status: newStatus })
      setOrders(orders.map(o => o.id === order.id ? res.order : o))
      if (detailOrder?.id === order.id) setDetailOrder(res.order)
      toast.success(`Đã cập nhật trạng thái: ${STATUS_CONFIG[newStatus]?.label}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/admin/supplier-orders/${deleteTarget.id}`)
      setOrders(orders.filter(o => o.id !== deleteTarget.id))
      toast.success('Đã xóa đơn nhập hàng')
      if (detailOrder?.id === deleteTarget.id) closeDetail()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại')
    } finally { setDeleteTarget(null) }
  }

  const stats = {
    total: orders.length,
    received: orders.filter(o => o.status === 'received').length,
    pending: orders.filter(o => ['pending', 'draft', 'confirmed', 'ordered', 'partial_received'].includes(o.status)).length,
    value: orders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Nhập hàng từ nhà cung cấp</h2>
        <button onClick={() => openForm()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={18} /> Tạo đơn nhập hàng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng đơn', value: stats.total, color: 'from-blue-500 to-blue-700' },
          { label: 'Đã nhận đủ', value: stats.received, color: 'from-green-500 to-green-700' },
          { label: 'Đang xử lý', value: stats.pending, color: 'from-yellow-500 to-yellow-700' },
          { label: 'Tổng giá trị', value: formatPrice(stats.value), color: 'from-purple-500 to-purple-700', isText: true },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.isText ? 'text-purple-600' : 'bg-gradient-to-r ' + s.color + ' bg-clip-text text-transparent'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm mã đơn, NCC..."
            value={search} onChange={e => { setSearch(e.target.value); setFilterStatus(''); setFilterSupplier('') }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setSearch(''); setFilterSupplier('') }}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={filterSupplier} onChange={e => { setFilterSupplier(e.target.value); setSearch(''); setFilterStatus('') }}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả NCC</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nhà cung cấp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kho nhận</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đặt</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Thanh toán</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th className="px-4 py-3 center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>)}</tr>
            )) : orders.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Không có đơn nhập hàng nào</td></tr>
            ) : orders.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft
              const StIcon = st.icon
              const pm = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.unpaid
              return (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5"><span className="text-sm font-bold font-mono text-blue-600">{order.order_code}</span></td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{order.supplier_name}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{order.warehouse_name || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{order.order_date || '—'}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-gray-900">{formatPrice(Number(order.total_amount) || 0)}</td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className={pm.color}>{formatPrice(Number(order.paid_amount) || 0)}</span>
                    <span className="text-gray-400 text-xs ml-1">/ {formatPrice(Number(order.total_amount) || 0)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${st.color}`}>
                      <StIcon size={11} />{st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openDetail(order)} title="Xem chi tiết"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                        <Eye size={16} />
                      </button>
                      {order.status === 'draft' && (
                        <button onClick={() => openForm(order)} title="Sửa"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {['draft', 'pending', 'cancelled'].includes(order.status) && (
                        <button onClick={() => setDeleteTarget(order)} title="Xóa"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ========== FORM MODAL ========== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Sửa đơn nhập hàng' : 'Tạo đơn nhập hàng mới'}</h3>
              <button onClick={closeForm} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                  <select value={form.supplier_id} required
                    onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kho nhận</label>
                  <select value={form.warehouse_id}
                    onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Chọn kho</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}{w.is_main ? ' (Chính)' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt hàng</label>
                  <input type="date" value={form.order_date}
                    onChange={e => setForm({ ...form, order_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến nhận</label>
                  <input type="date" value={form.expected_date}
                    onChange={e => setForm({ ...form, expected_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm <span className="text-red-500">*</span></label>

                {/* Product search */}
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                    value={productSearch}
                    onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true) }}
                    onFocus={() => productSearch && setShowProductDropdown(true)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredProducts.map(p => (
                        <button key={p.id} type="button" onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-50 last:border-0">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                              <Package size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.sku} · Giá nhập: {formatPrice(p.cost_price)}</p>
                          </div>
                          <Plus size={14} className="text-blue-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Items table */}
                {formItems.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-20">Size</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-24">Màu</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 w-20">SL</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-28">Đơn giá</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-28">T.Tiền</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {formItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2">
                              <p className="font-medium text-gray-800 text-xs">{item.product_name}</p>
                              {item.product_sku && <p className="text-gray-400 text-xs">{item.product_sku}</p>}
                            </td>
                            <td className="px-3 py-2">
                              <select value={item.size_id} onChange={e => updateItem(idx, 'size_id', e.target.value)}
                                className="w-full px-1.5 py-1 border border-gray-200 rounded text-xs focus:outline-none">
                                <option value="">—</option>
                                {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select value={item.color_id} onChange={e => updateItem(idx, 'color_id', e.target.value)}
                                className="w-full px-1.5 py-1 border border-gray-200 rounded text-xs focus:outline-none">
                                <option value="">—</option>
                                {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" min="1" value={item.quantity_ordered}
                                onChange={e => updateItem(idx, 'quantity_ordered', e.target.value)}
                                className="w-full px-1.5 py-1 border border-gray-200 rounded text-xs text-center focus:outline-none" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" min="0" step="1000" value={item.unit_cost}
                                onChange={e => updateItem(idx, 'unit_cost', e.target.value)}
                                className="w-full px-1.5 py-1 border border-gray-200 rounded text-xs text-right focus:outline-none" />
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-xs">
                              {formatPrice((item.quantity_ordered || 0) * (item.unit_cost || 0))}
                            </td>
                            <td className="px-3 py-2">
                              <button type="button" onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-3 py-2.5 bg-gray-50 flex justify-end">
                      <div className="text-sm">
                        <span className="text-gray-500">Tạm tính: </span>
                        <span className="font-bold text-gray-900">{formatPrice(formSubtotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {formItems.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center text-sm text-gray-400">
                    Tìm và thêm sản phẩm vào danh sách nhập hàng
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea value={form.note} rows={2} onChange={e => setForm({ ...form, note: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  {editingId ? 'Cập nhật đơn nhập' : 'Tạo đơn nhập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== DETAIL MODAL ========== */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Chi tiết đơn nhập hàng</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{detailOrder.order_code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!receiveMode && detailOrder.status !== 'received' && detailOrder.status !== 'cancelled' && (
                      <button onClick={() => setReceiveMode(true)} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                        <RefreshCcw size={15} /> Nhận hàng
                      </button>
                    )}
                    {receiveMode && (
                      <button onClick={handleReceive} disabled={receiving}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                        {receiving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={15} />}
                        Xác nhận nhận
                      </button>
                    )}
                    {receiveMode && (
                      <button onClick={() => { setReceiveMode(false) }}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Hủy
                      </button>
                    )}
                    <select value={detailOrder.status} onChange={e => handleStatusChange(detailOrder, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={closeDetail} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 w-24">Nhà cung cấp:</span>
                      <span className="text-sm text-gray-900">{detailOrder.supplier_name}</span>
                    </div>
                    {detailOrder.supplier_phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-500 w-24">Điện thoại:</span>
                        <span className="text-sm text-gray-700">{detailOrder.supplier_phone}</span>
                      </div>
                    )}
                    {detailOrder.supplier_address && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-500 w-24">Địa chỉ NCC:</span>
                        <span className="text-sm text-gray-700">{detailOrder.supplier_address}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 w-24">Kho nhận:</span>
                      <span className="text-sm text-gray-900">{detailOrder.warehouse_name || '—'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 w-24">Ngày đặt:</span>
                      <span className="text-sm text-gray-700">{detailOrder.order_date || '—'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 w-24">Ngày nhận dự kiến:</span>
                      <span className="text-sm text-gray-700">{detailOrder.expected_date || '—'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 w-24">Ngày nhận thực tế:</span>
                      <span className="text-sm text-gray-700">{detailOrder.received_date || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Size</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Màu</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">SL đặt</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">SL nhận</th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Đơn giá</th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">T.Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(detailOrder.items || []).map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-gray-800">{item.product_name}</p>
                            {item.product_sku && <p className="text-xs text-gray-400">{item.product_sku}</p>}
                            {receiveMode && (
                              <input type="number" min="0" max={item.quantity_ordered}
                                value={receiveItems.find(r => r.id === item.id)?.qty_received || 0}
                                onChange={e => setReceiveItems(receiveItems.map(r => r.id === item.id ? { ...r, qty_received: Number(e.target.value) } : r))}
                                className="mt-1 w-20 px-2 py-1 border border-blue-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center text-xs text-gray-600">{item.size_name || '—'}</td>
                          <td className="px-3 py-2.5 text-center text-xs text-gray-600">{item.color_name || '—'}</td>
                          <td className="px-3 py-2.5 text-center text-sm font-medium">{item.quantity_ordered}</td>
                          <td className="px-3 py-2.5 text-center text-sm">
                            {item.quantity_received > 0 ? (
                              <span className={`font-bold ${item.quantity_received >= item.quantity_ordered ? 'text-green-600' : 'text-yellow-600'}`}>
                                {item.quantity_received}
                              </span>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm">{formatPrice(Number(item.unit_cost) || 0)}</td>
                          <td className="px-3 py-2.5 text-right font-medium text-sm">{formatPrice(Number(item.total_cost) || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-4">
                  <div className="w-64 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Tạm tính:</span><span className="font-medium">{formatPrice(Number(detailOrder.subtotal) || 0)}</span></div>
                    {Number(detailOrder.discount_amount) > 0 && (
                      <div className="flex justify-between"><span className="text-gray-500">Giảm giá:</span><span className="text-red-500">-{formatPrice(Number(detailOrder.discount_amount) || 0)}</span></div>
                    )}
                    {Number(detailOrder.tax_amount) > 0 && (
                      <div className="flex justify-between"><span className="text-gray-500">Thuế:</span><span>{formatPrice(Number(detailOrder.tax_amount) || 0)}</span></div>
                    )}
                    <div className="flex justify-between border-t pt-1.5 font-bold text-base">
                      <span>Tổng cộng:</span><span className="text-blue-600">{formatPrice(Number(detailOrder.total_amount) || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Đã thanh toán:</span><span className="text-green-600">{formatPrice(Number(detailOrder.paid_amount) || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Còn nợ:</span><span className={Number(detailOrder.total_amount) - Number(detailOrder.paid_amount) > 0 ? 'text-red-500' : 'text-green-600'}>
                        {formatPrice((Number(detailOrder.total_amount) || 0) - (Number(detailOrder.paid_amount) || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {detailOrder.note && (
                  <div className="bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Ghi chú:</p>
                    <p className="text-sm text-gray-700">{detailOrder.note}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ========== DELETE MODAL ========== */}
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
            <p className="text-sm text-gray-600 mb-5">Xóa đơn nhập hàng <strong>"{deleteTarget.order_code}"</strong>?</p>
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
