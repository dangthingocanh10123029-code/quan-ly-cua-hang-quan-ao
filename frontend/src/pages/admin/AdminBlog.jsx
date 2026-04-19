import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { FileText, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Search, Calendar, Tag, AlertCircle } from 'lucide-react'

const emptyPost = { title: '', slug: '', summary: '', content: '', category: '', is_featured: false, is_published: true, thumbnail: '' }

export default function AdminBlog() {
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyPost)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/news')
      setPosts(res.posts)
    } catch (err) {
      console.error('Fetch posts error:', err)
      setPosts([])
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        const res = await api.put(`/admin/news/${editing}`, form)
        setPosts(posts.map(p => p.id === editing ? res.post : p))
        toast.success('Đã cập nhật bài viết')
      } else {
        const res = await api.post('/admin/news', form)
        setPosts([...posts, res.post])
        toast.success('Đã thêm bài viết mới')
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyPost)
    } catch {
      toast.error('Lưu bài viết thất bại')
      setShowForm(false)
    }
  }

  const handleEdit = (post) => { setForm({ ...emptyPost, ...post }); setEditing(post.id); setShowForm(true) }
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/admin/news/${deleteTarget.id}`)
      setPosts(posts.filter(p => p.id !== deleteTarget.id))
      toast.success('Đã xóa bài viết')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa bài viết thất bại')
    } finally {
      setDeleteTarget(null)
    }
  }

  const toggle = async (post, field) => {
    try {
      await api.put(`/admin/news/${post.id}`, { [field]: !post[field] })
      setPosts(posts.map(p => p.id === post.id ? { ...p, [field]: !post[field] } : p))
      toast.success('Đã cập nhật trạng thái')
    } catch {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm bài viết..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={18} /> Viết bài mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hình</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bài viết</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đăng</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Lượt xem</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Nổi bật</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>)}</tr>
            )) : filtered.map(post => (
              <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt="" className="w-12 h-8 object-cover rounded border border-gray-200" />
                  ) : (
                    <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">No img</div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {post.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Nổi bật</span>}
                    <span className="text-sm font-semibold text-gray-800">{post.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.summary}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{post.category}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{post.published_at}</td>
                <td className="px-5 py-3.5 text-center text-sm font-medium text-gray-700">{post.view_count?.toLocaleString() || 0}</td>
                <td className="px-5 py-3.5 text-center">
                  <button onClick={() => toggle(post, 'is_featured')} className={post.is_featured ? 'text-yellow-500' : 'text-gray-300'}>
                    {post.is_featured ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button onClick={() => toggle(post, 'is_published')} className={post.is_published ? 'text-green-500' : 'text-gray-300'}>
                    {post.is_published ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(post)} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"><Edit size={16} /></button>
                    <button onClick={() => setDeleteTarget(post)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Sửa bài viết' : 'Viết bài mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} required onChange={e => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
                <textarea value={form.summary} rows={2} onChange={e => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <input type="text" value={form.thumbnail || ''} onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="Dán URL hình ảnh bài viết..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {form.thumbnail && (
                  <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea value={form.content} rows={6} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đăng</label>
                  <input type="date" value={form.published_at || ''} onChange={e => setForm({ ...form, published_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Nổi bật</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Xuất bản</span></label>
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
            <p className="text-sm text-gray-600 mb-5">Bạn có chắc muốn xóa bài viết <strong>"{deleteTarget.title}"</strong>?</p>
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
