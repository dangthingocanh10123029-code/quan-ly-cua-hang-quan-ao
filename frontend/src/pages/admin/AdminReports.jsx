import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  Download, DollarSign, ShoppingCart, Users, Package,
  TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { AreaChart, Area } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function AdminReports() {
  const [period, setPeriod] = useState('all')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { fetchReports() }, [period])

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/admin/reports', { params: { period } })
      setData(res)
    } catch (err) {
      console.error('[AdminReports] Failed to fetch:', err)
      setError(err.response?.data?.message || 'Tải báo cáo thất bại')
      setData(null)
    } finally { setLoading(false) }
  }

  const formatPrice = (v) => {
    if (!v && v !== 0) return '0đ'
    if (Math.abs(v) >= 1000000000) return `${(v / 1000000000).toFixed(1)}Bđ`
    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}Mđ`
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}Kđ`
    return new Intl.NumberFormat('vi-VN').format(v) + 'đ'
  }

  const fmtM = (v) => {
    if (!v && v !== 0) return '0'
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
    return String(v)
  }

  const { stats, dailyRevenue, monthlyRevenue, categoryData, paymentData, statusData, topProducts, topCustomers } = data || {}

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-gray-600">
            {p.name === 'revenue' || p.name === 'net_revenue' ? 'Doanh thu: ' : p.name === 'orders' ? 'Đơn hàng: ' : p.name === 'sold' ? 'Đã bán: ' : `${p.name}: `}
            <span className="font-semibold" style={{ color: p.color || p.fill }}>
              {p.name === 'revenue' || p.name === 'net_revenue' || p.name === 'revenue_vnd' ? formatPrice(p.value) : p.value}
            </span>
          </p>
        ))}
      </div>
    )
  }

  const paymentLabels = {
    cod: 'COD', vnpay: 'VNPay', momo: 'MoMo',
    bank_transfer: 'Chuyển khoản', credit_card: 'Thẻ',
  }

  const statusLabels = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý', shipped: 'Đang giao',
    delivered: 'Đã giao', cancelled: 'Đã hủy', returned: 'Trả hàng',
  }

  const chartData = (dailyRevenue || []).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
  }))

  const totalCategoryRevenue = (categoryData || []).reduce((sum, c) => sum + c.revenue, 0)

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Báo cáo & Thống kê</h2>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">3 tháng</option>
            <option value="365days">12 tháng</option>
            <option value="all">Toàn bộ</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`bg-white rounded-xl p-4 shadow-sm border ${loading ? 'border-transparent' : 'border-gray-100'}`}>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <DollarSign size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">Doanh thu</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatPrice(stats?.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-0.5">{stats?.deliveredOrders || 0} đơn đã giao</p>
            </>
          )}
        </div>

        <div className={`bg-white rounded-xl p-4 shadow-sm border ${loading ? 'border-transparent' : 'border-gray-100'}`}>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">Lợi nhuận</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatPrice(stats?.totalProfit)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Margin {stats?.profitMargin || 0}%</p>
            </>
          )}
        </div>

        <div className={`bg-white rounded-xl p-4 shadow-sm border ${loading ? 'border-transparent' : 'border-gray-100'}`}>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <ShoppingCart size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">Tổng đơn</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{(stats?.totalOrders || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">GTBQ {formatPrice(stats?.avgOrderValue)}</p>
            </>
          )}
        </div>

        <div className={`bg-white rounded-xl p-4 shadow-sm border ${loading ? 'border-transparent' : 'border-gray-100'}`}>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Users size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">Khách mới</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{(stats?.newCustomers || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">/ {(stats?.totalCustomers || 0).toLocaleString()} tổng</p>
            </>
          )}
        </div>

        <div className={`bg-white rounded-xl p-4 shadow-sm border ${loading ? 'border-transparent' : 'border-gray-100'}`}>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <Package size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">Hủy/Trả</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {(stats?.cancelledOrders || 0) + (stats?.returnedOrders || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {stats?.totalOrders > 0
                  ? `${((stats.cancelledOrders + stats.returnedOrders) / stats.totalOrders * 100).toFixed(1)}% tỷ lệ`
                  : '0% tỷ lệ'}
              </p>
            </>
          )}
        </div>

        <div className={`bg-white rounded-xl p-4 shadow-sm border ${loading ? 'border-transparent' : 'border-gray-100'}`}>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <Package size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">Giá trị kho</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatPrice(stats?.inventoryValue)}</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {stats?.lowStockProducts || 0} sản phẩm sắp hết
              </p>
            </>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Doanh thu theo thời gian</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" /> Doanh thu</span>
          </div>
        </div>
        {loading ? (
          <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => fmtM(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#gradRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Doanh thu theo danh mục</h3>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ) : !categoryData?.length ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="revenue" paddingAngle={2}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [formatPrice(v), n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {categoryData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-semibold text-gray-800">{formatPrice(item.revenue)}</span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({totalCategoryRevenue > 0 ? Math.round(item.revenue / totalCategoryRevenue * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Phân bổ trạng thái đơn hàng</h3>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ) : !statusData?.length ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" paddingAngle={2} nameKey="status" label={({ status, count }) => count}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, s) => [v, statusLabels[s] || s]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{statusLabels[item.status] || item.status}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ) : !paymentData?.length ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => fmtM(v)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={80}
                    tickFormatter={n => paymentLabels[n] || n} />
                  <Tooltip formatter={(v) => [v, 'Số đơn']} />
                  <Bar dataKey="order_count" radius={[0, 6, 6, 0]}>
                    {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {paymentData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{paymentLabels[item.name] || item.name}</span>
                    <span className="font-semibold text-gray-800">{formatPrice(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Products + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top sản phẩm bán chạy</h3>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : !topProducts?.length ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, i) => (
                <div key={item.id || i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                        style={{ width: topProducts[0]?.revenue > 0 ? `${(item.revenue / topProducts[0].revenue) * 100}%` : '0%' }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-800">{item.sold} đã bán</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top khách hàng</h3>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : !topCustomers?.length ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((item, i) => (
                <div key={item.id || i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.order_count} đơn hàng</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-blue-600">{formatPrice(item.total_spent)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
