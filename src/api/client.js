const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getToken() {
  return localStorage.getItem('bazario_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('bazario_token', token)
  else localStorage.removeItem('bazario_token')
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const msg = typeof data === 'object' && data?.error ? data.error : `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

export const api = {
  // Public buyer catalogue — real MySQL-backed products. No mock fallback.
  getProducts: ({ category, categories, search, sellerId } = {}) => {
    const qs = new URLSearchParams()
    if (categories && categories.length) qs.set('categories', categories.join(','))
    else if (category && category !== 'all') qs.set('category', category)
    if (search) qs.set('search', search)
    if (sellerId) qs.set('sellerId', sellerId)
    const q = qs.toString()
    return apiRequest(`/api/products${q ? `?${q}` : ''}`)
  },

  getProduct: (id) => apiRequest(`/api/products/${id}`),

  loginBuyer: (email, password) =>
    apiRequest('/api/auth/buyer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  loginSeller: (email, password) =>
    apiRequest('/api/auth/seller/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  registerBuyer: ({ name, email, password, confirmPassword }) =>
    apiRequest('/api/auth/buyer/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    }),

  registerSeller: ({ shopName, ownerName, email, password, confirmPassword }) =>
    apiRequest('/api/auth/seller/register', {
      method: 'POST',
      body: JSON.stringify({ shopName, ownerName, email, password, confirmPassword })
    }),

  getBuyerProfile: (buyerId) => apiRequest(`/api/buyer/${buyerId}/profile`),

  updateBuyerProfile: (buyerId, body) =>
    apiRequest(`/api/buyer/${buyerId}/profile`, { method: 'PUT', body: JSON.stringify(body) }),

  getCart: (buyerId) => apiRequest(`/api/buyer/${buyerId}/cart`),

  postCart: (buyerId, productId, quantity = 1) =>
    apiRequest(`/api/buyer/${buyerId}/cart`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    }),

  putCartItem: (buyerId, productId, quantity) =>
    apiRequest(`/api/buyer/${buyerId}/cart`, {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity })
    }),

  deleteCartItem: (buyerId, productId) =>
    apiRequest(`/api/buyer/${buyerId}/cart/${productId}`, { method: 'DELETE' }),

  getWishlist: (buyerId) => apiRequest(`/api/buyer/${buyerId}/wishlist`),

  postWishlist: (buyerId, productId) =>
    apiRequest(`/api/buyer/${buyerId}/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    }),

  deleteWishlist: (buyerId, productId) =>
    apiRequest(`/api/buyer/${buyerId}/wishlist/${productId}`, { method: 'DELETE' }),

  getOrders: (buyerId) => apiRequest(`/api/buyer/${buyerId}/orders`),

  postOrder: (buyerId, body) =>
    apiRequest(`/api/buyer/${buyerId}/orders`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getSellerProfile: (sellerId) => apiRequest(`/api/seller/${sellerId}/profile`),

  updateSellerProfile: (sellerId, body) =>
    apiRequest(`/api/seller/${sellerId}/profile`, { method: 'PUT', body: JSON.stringify(body) }),

  getSellerProducts: (sellerId) => apiRequest(`/api/seller/${sellerId}/products`),

  postSellerProduct: (sellerId, body) =>
    apiRequest(`/api/seller/${sellerId}/products`, { method: 'POST', body: JSON.stringify(body) }),

  putSellerProduct: (sellerId, productId, body) =>
    apiRequest(`/api/seller/${sellerId}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  deleteSellerProduct: (sellerId, productId) =>
    apiRequest(`/api/seller/${sellerId}/products/${productId}`, { method: 'DELETE' }),

  getSellerOrders: (sellerId) => apiRequest(`/api/seller/${sellerId}/orders`),

  putSellerOrder: (sellerId, orderId, body) =>
    apiRequest(`/api/seller/${sellerId}/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  // Public, unauthenticated — real MySQL-backed shop info for the buyer's
  // "Visit Shop" page (shop name, owner, description, follower count).
  getShop: (sellerId) => apiRequest(`/api/seller/${sellerId}/shop`),

  getFollowState: (buyerId, sellerId) =>
    apiRequest(`/api/buyer/${buyerId}/follows/${sellerId}`),

  followShop: (buyerId, sellerId) =>
    apiRequest(`/api/buyer/${buyerId}/follows`, {
      method: 'POST',
      body: JSON.stringify({ sellerId })
    }),

  unfollowShop: (buyerId, sellerId) =>
    apiRequest(`/api/buyer/${buyerId}/follows/${sellerId}`, { method: 'DELETE' })
}
