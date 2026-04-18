import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Log all requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.baseURL + config.url)
    // Thêm token nếu có
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý logout
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const homeAPI = {
  getHomeData: () => api.get('/home'),
}

export const searchAPI = {
  search: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
}

export const productAPI = {
  getProduct: (slug) => api.get(`/products/${slug}`),
  getProducts: (params) => {
    const queryParams = new URLSearchParams(params).toString()
    return api.get(`/products${queryParams ? `?${queryParams}` : ''}`)
  },
  getKidsCategories: () => api.get('/products/kids-categories'),
  search: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
}

export const saleAPI = {
  getSaleProducts: (params) => {
    const queryParams = new URLSearchParams(params).toString()
    return api.get(`/products/sale${queryParams ? `?${queryParams}` : ''}`)
  },
}

export default api
