import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'

const BlogPage = () => {
  const articles = [
    {
      id: 1,
      title: 'Xu hướng thời trang 2024: Những gì đang lên ngôi',
      slug: 'xu-huong-thoi-trang-2024',
      category: 'Xu hướng',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      summary: 'Khám phá những xu hướng thời trang nổi bật nhất năm 2024, từ màu sắc đến kiểu dáng đang được giới trẻ ưa chuộng.',
      published_at: '2024-04-15',
      author: 'CLOTH Editorial'
    },
    {
      id: 2,
      title: 'Cách phối đồ cho mùa hè năng động',
      slug: 'cach-phoi-do-cho-mua-he',
      category: 'Hướng dẫn',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
      summary: 'Những tips phối đồ giúp bạn tự tin và thoải mái trong những ngày hè nóng bỏng.',
      published_at: '2024-04-10',
      author: 'Style Team'
    },
    {
      id: 3,
      title: 'Bền vững trong thời trang: Lựa chọn xanh cho tương lai',
      slug: 'ben-vung-trong-thoi-trang',
      category: 'Cộng đồng',
      thumbnail: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
      summary: 'CLOTH cam kết với môi trường bằng những bước tiến trong việc sản xuất bền vững.',
      published_at: '2024-04-05',
      author: 'CLOTH Editorial'
    },
    {
      id: 4,
      title: '5 items không thể thiếu trong tủ đồ nam giới',
      slug: '5-items-khong-the-thieu-trong-tu-do-nam',
      category: 'Gợi ý',
      thumbnail: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600',
      summary: 'Những món đồ cơ bản nhưng không thể thiếu giúp nam giới xây dựng tủ đồ hoàn hảo.',
      published_at: '2024-03-28',
      author: 'Style Team'
    },
    {
      id: 5,
      title: 'Thời trang circular: Xu hướng thế giới hướng tới',
      slug: 'thoi-trang-circular',
      category: 'Xu hướng',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
      summary: 'Khái niệm thời trang tuần hoàn đang ngày càng phổ biến, hướng tới một nền công nghiệp thời trang bền vững hơn.',
      published_at: '2024-03-20',
      author: 'CLOTH Editorial'
    },
    {
      id: 6,
      title: ' Bí quyết bảo quản quần áo để giữ độ bền lâu dài',
      slug: 'bi-quyet-bao-quan-quan-ao',
      category: 'Hướng dẫn',
      thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600',
      summary: 'Những mẹo đơn giản giúp quần áo của bạn luôn mới và bền đẹp theo thời gian.',
      published_at: '2024-03-15',
      author: 'Style Team'
    }
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const categories = ['Tất cả', 'Xu hướng', 'Hướng dẫn', 'Cộng đồng', 'Gợi ý']
  const [activeCategory, setActiveCategory] = React.useState('Tất cả')

  const filteredArticles = activeCategory === 'Tất cả' 
    ? articles 
    : articles.filter(a => a.category === activeCategory)

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={0} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-screen-2xl mx-auto px-8 text-center">
            <span className="material-symbols-outlined text-6xl mb-4 text-primary">article</span>
            <h1 className="text-5xl font-bold mb-4">Blog Thời Trang</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Cập nhật xu hướng, chia sẻ phong cách và câu chuyện từ CLOTH
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-slate-200 sticky top-20 bg-white z-40">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 max-w-screen-2xl mx-auto px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article key={article.id} className="group cursor-pointer">
                {/* Thumbnail */}
                <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-6 bg-slate-100">
                  <img
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={article.thumbnail}
                    loading="lazy"
                  />
                </div>

                {/* Category */}
                <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-3">
                  {article.category}
                </span>

                {/* Title */}
                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h2>

                {/* Summary */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {article.summary}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{article.author}</span>
                  <span>{formatDate(article.published_at)}</span>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
              <p className="text-slate-500">Không có bài viết nào trong danh mục này</p>
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-screen-2xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Đăng ký nhận tin mới nhất</h2>
            <p className="text-slate-400 mb-8">Theo dõi blog CLOTH để cập nhật xu hướng và ưu đãi hấp dẫn</p>
            <form className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-primary"
              />
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-colors">
                Đăng ký
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default BlogPage
