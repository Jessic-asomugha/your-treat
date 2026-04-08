
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

// ── LOADING STATE HELPERS ──
export function showLoading(containerId, message = 'Loading…') {
  const el = document.getElementById(containerId)
  if (!el) return
  el.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
    ">
      <div style="
        width: 36px;
        height: 36px;
        border: 2px solid var(--cream-dark, #F2E8D9);
        border-top-color: var(--brown, #5C3317);
        border-radius: 50%;
        animation: sd-spin 0.8s linear infinite;
      "></div>
      <p style="
        font-size: 0.82rem;
        color: var(--stone, #9E8A78);
        font-weight: 300;
        letter-spacing: 0.05em;
      ">${message}</p>
    </div>
    <style>
      @keyframes sd-spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `
}

export function showError(containerId, message = 'Something went wrong. Please refresh.', onRetry = null) {
  const el = document.getElementById(containerId)
  if (!el) return
  el.innerHTML = `
    <div style="
      text-align: center;
      padding: 4rem 2rem;
    ">
      <div style="
        width: 48px;
        height: 48px;
        border: 1px solid rgba(155,44,44,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.2rem;
      ">!</div>
      <p style="
        font-size: 0.88rem;
        color: #9B2C2C;
        margin-bottom: 1rem;
      ">${message}</p>
      ${onRetry ? `
        <button onclick="${onRetry}()" style="
          padding: 0.6rem 1.5rem;
          background: var(--brown, #5C3317);
          color: white;
          border: none;
          border-radius: 2px;
          font-family: inherit;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
        ">Try Again</button>
      ` : ''}
    </div>
  `
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

export async function apiForgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

export async function apiResetPassword({ token, password }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  })
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
