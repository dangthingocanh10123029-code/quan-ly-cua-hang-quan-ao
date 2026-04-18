export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(Number(price)) + 'đ'
}
