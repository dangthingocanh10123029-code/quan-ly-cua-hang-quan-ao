import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { Save, Globe, Mail, Phone, Truck, CreditCard, Package, Award, BarChart3 } from 'lucide-react'

export default function AdminSettings() {
  const toast = useToast()
  const [settings, setSettings] = useState({
    site_name: 'Clothing Store',
    site_description: '',
    site_email: 'contact@clothing-store.vn',
    contact_phone: '0909 123 456',
    contact_hotline: '1900 1234',
    contact_address: '',
    free_shipping_threshold: '500000',
    default_shipping_fee: '30000',
    cod_fee: '0',
    tax_rate: '10',
    min_order_amount: '100000',
    pagination_limit: '12',
    points_per_1000: '10',
    low_stock_threshold: '10',
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings')
      setSettings(res.settings)
    } catch {
      // use defaults
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put('/admin/settings', settings)
      toast.success('Đã lưu cài đặt thành công')
    } catch {
      toast.error('Không thể lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { key: 'general', label: 'Chung', icon: Globe },
    { key: 'contact', label: 'Liên hệ', icon: Phone },
    { key: 'shipping', label: 'Vận chuyển', icon: Truck },
    { key: 'payment', label: 'Thanh toán', icon: CreditCard },
    { key: 'display', label: 'Hiển thị', icon: Package },
    { key: 'reward', label: 'Tích điểm', icon: Award },
  ]

  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Tên cửa hàng</label>
              <input type="text" value={settings.site_name || ''} onChange={e => handleChange('site_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mô tả cửa hàng</label>
              <textarea value={settings.site_description || ''} rows={3} onChange={e => handleChange('site_description', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email cửa hàng</label>
              <input type="email" value={settings.site_email || ''} onChange={e => handleChange('site_email', e.target.value)} className={inputClass} />
            </div>
          </div>
        )
      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input type="text" value={settings.contact_phone || ''} onChange={e => handleChange('contact_phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hotline</label>
              <input type="text" value={settings.contact_hotline || ''} onChange={e => handleChange('contact_hotline', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Địa chỉ</label>
              <textarea value={settings.contact_address || ''} rows={2} onChange={e => handleChange('contact_address', e.target.value)} className={inputClass} />
            </div>
          </div>
        )
      case 'shipping':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Ngưỡng miễn phí vận chuyển (VNĐ)</label>
              <input type="number" value={settings.free_shipping_threshold || ''} onChange={e => handleChange('free_shipping_threshold', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phí vận chuyển mặc định (VNĐ)</label>
              <input type="number" value={settings.default_shipping_fee || ''} onChange={e => handleChange('default_shipping_fee', e.target.value)} className={inputClass} />
            </div>
          </div>
        )
      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Phí COD (%)</label>
              <input type="number" value={settings.cod_fee || ''} onChange={e => handleChange('cod_fee', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Thuế VAT (%)</label>
              <input type="number" value={settings.tax_rate || ''} onChange={e => handleChange('tax_rate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Đơn hàng tối thiểu (VNĐ)</label>
              <input type="number" value={settings.min_order_amount || ''} onChange={e => handleChange('min_order_amount', e.target.value)} className={inputClass} />
            </div>
          </div>
        )
      case 'display':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Sản phẩm mỗi trang</label>
              <input type="number" value={settings.pagination_limit || ''} onChange={e => handleChange('pagination_limit', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ngưỡng cảnh báo tồn kho thấp</label>
              <input type="number" value={settings.low_stock_threshold || ''} onChange={e => handleChange('low_stock_threshold', e.target.value)} className={inputClass} />
            </div>
          </div>
        )
      case 'reward':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Điểm tích lũy cho mỗi 1.000đ</label>
              <input type="number" value={settings.points_per_1000 || ''} onChange={e => handleChange('points_per_1000', e.target.value)} className={inputClass} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon size={16} />{tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTab()}
        </div>

        {/* Save */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}
