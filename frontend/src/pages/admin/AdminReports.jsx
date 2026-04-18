import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Download, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { AreaChart, Area } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AdminReports() {
  const [reportType, setReportType] = useState('revenue')
  const [period, setPeriod] = useState('30days')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: { totalRevenue: 0, totalOrders: 0, newCustomers: 0, avgOrderValue: 0 },
    revenueData: [],
    categoryData: [],
    paymentData: [],
    topProducts: [],
  })

  useEffect(() => { fetchReports() }, [period])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/reports', { params: { period } })
      setData({
        stats: res.stats || { totalRevenue: 0, totalOrders: 0, newCustomers: 0, avgOrderValue: 0 },
        revenueData: res.revenueData || [],
        categoryData: res.categoryData || [],
        paymentData: res.paymentData || [],
        topProducts: res.topProducts || [],
      })
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally { setLoading(false) }
  }

  const { stats, revenueData, categoryData, paymentData, topProducts } = data

  const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + 'đ'
  const fmtM = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-gray-600">
            {p.name === 'revenue' ? 'Doanh thu: ' : p.name === 'orders' ? 'Đơn hàng: ' : `${p.name}: `}
            <span className="font-semibold" style={{ color: p.color || p.fill }}>
              {p.name === 'revenue' ? formatPrice(p.value) : p.value}
            </span>
          </p>
        ))}
      </div>
    )
  }

  const paymentLabels = { cod: 'COD', vnpay: 'VNPay', momo: 'MoMo', bank_transfer: 'Chuyển khoản', wallet: 'Ví điện tử' }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Báo cáo & Thống kê</h2>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">3 tháng</option>
            <option value="365days">12 tháng</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-white" />
          </div>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Tổng doanh thu</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3">
            <ShoppingCart size={20} className="text-white" />
          </div>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Tổng đơn hàng</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-3">
            <Users size={20} className="text-white" />
          </div>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats.newCustomers.toLocaleString()}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Khách hàng mới</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mb-3">
            <Package size={20} className="text-white" />
          </div>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.avgOrderValue)}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Giá trị đơn TB</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Doanh thu theo thời gian</h3>
          {loading ? (
            <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
          ) : revenueData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu trong khoảng thời gian này</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={v => fmtM(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#gradRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Theo danh mục</h3>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ) : categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : paymentData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748B' }} width={80}
                    tickFormatter={n => paymentLabels[n] || n} />
                  <Tooltip formatter={(v) => [v, 'Số đơn']} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top sản phẩm bán chạy</h3>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}</div>
          ) : topProducts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: topProducts[0].sold > 0 ? `${(item.sold / topProducts[0].sold) * 100}%` : '0%' }} />
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
      </div>
    </div>
  )
}
