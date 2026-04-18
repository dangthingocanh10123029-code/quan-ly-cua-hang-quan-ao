import React from 'react'

const ReviewSection = ({ reviews }) => {
  // Default reviews
  const defaultReviews = [
    {
      id: 1,
      product_name: 'Heavyweight Tech Tee',
      product_slug: 'heavyweight-tech-tee',
      rating: 5,
      title: 'Chất lượng tuyệt vời',
      content: 'Áo mặc rất thoải mái, chất vải tốt, giao hàng nhanh.',
      user_name: 'Nguyễn Văn A',
      created_at: '2024-01-15',
      product_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
    },
    {
      id: 2,
      product_name: 'Architectural Trousers',
      product_slug: 'architectural-trousers',
      rating: 4,
      title: 'Hài lòng',
      content: 'Quần đẹp, kiểu dáng hiện đại. Sẽ mua thêm.',
      user_name: 'Trần Thị B',
      created_at: '2024-01-10',
      product_image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'
    }
  ]

  const displayReviews = reviews?.length > 0 ? reviews : defaultReviews

  const StarRating = ({ rating }) => (
    <div className="flex text-amber-500">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  )

  return (
    <section className="py-16 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto px-8">
        <h2 className="headline-font text-3xl font-bold mb-8 text-center">
          Đánh giá từ khách hàng
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              {/* Product Image */}
              <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-surface-container-low">
                <img
                  src={review.product_image || 'https://via.placeholder.com/200'}
                  alt={review.product_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Rating */}
              <StarRating rating={review.rating} />
              
              {/* Review Content */}
              <h4 className="font-bold mt-2">{review.title}</h4>
              <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                {review.content}
              </p>
              
              {/* User */}
              <div className="mt-4 pt-4 border-t border-outline-variant/30">
                <p className="text-sm font-medium">{review.user_name}</p>
                <p className="text-xs text-on-surface-variant">
                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ReviewSection