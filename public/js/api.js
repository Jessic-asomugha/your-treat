// ── CONFIG ──
// Change this to your Vercel backend URL after deployment
const API_BASE = 'https://your-treat-production.up.railway.app/api'
// ── TOKEN HELPERS ──
export function getToken() {
  return localStorage.getItem('sd_token')
}

export function setToken(token) {
  localStorage.setItem('sd_token', token)
}

export function removeToken() {
  localStorage.removeItem('sd_token')
}

export function setUser(user) {
  localStorage.setItem('sd_user', JSON.stringify(user))
}

export function getUser() {
  const u = localStorage.getItem('sd_user')
  return u ? JSON.parse(u) : null
}

export function removeUser() {
  localStorage.removeItem('sd_user')
}

export function isLoggedIn() {
  return !!getToken()
}

export function isAdmin() {
  const user = getUser()
  return user && user.role === 'ADMIN'
}

// ── BASE FETCH ──
async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

// ── AUTH ──
export async function apiRegister({ email, password, fullName, phone }) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName, phone })
  })
  setToken(data.token)
  setUser(data.user)
  return data
}

export async function apiLogin({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  setToken(data.token)
  setUser(data.user)
  return data
}

export async function apiMe() {
  return request('/auth/me')
}

export function apiLogout() {
  removeToken()
  removeUser()
  window.location.href = '/index.html'
}

// ── ORDERS ──
export async function apiCreateOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  })
}

export async function apiGetMyOrders() {
  return request('/orders/mine')
}

export async function apiGetOrderById(id) {
  return request(`/orders/${id}`)
}

export async function apiGetAllOrders(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/orders${query ? '?' + query : ''}`)
}

export async function apiUpdateOrderStatus(id, status) {
  return request(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

export async function apiCancelOrder(id) {
  return request(`/orders/${id}/cancel`, { method: 'PATCH' })
}

// ── MESSAGES ──
export async function apiSendMessage({ senderName, senderEmail, text }) {
  return request('/messages', {
    method: 'POST',
    body: JSON.stringify({ senderName, senderEmail, text })
  })
}

export async function apiGetMyMessages(senderName) {
  return request(`/messages/mine/${encodeURIComponent(senderName)}`)
}

export async function apiGetAllMessages() {
  return request('/messages')
}

export async function apiGetConversation(senderName) {
  return request(`/messages/conversation/${encodeURIComponent(senderName)}`)
}

export async function apiReply({ replyTo, text }) {
  return request('/messages/reply', {
    method: 'POST',
    body: JSON.stringify({ replyTo, text })
  })
}

export async function apiGetUnreadCount() {
  return request('/messages/unread-count')
}