const BASE = 'http://localhost:3000/api'

// Login as admin
const loginRes = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'thisisjess@gmail10p.com', password: 'password' })
})
const { token } = await loginRes.json()
console.log('Admin token:', token ? '✓ received' : '✗ missing')

// Customer sends a message
const sendRes = await fetch(`${BASE}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    senderName:  'Amaka Obi',
    senderEmail: 'amaka@example.com',
    text:        'Hi, I would like to order a custom cake for my wedding!'
  })
})
const { message } = await sendRes.json()
console.log('Send message:', message?.id ? '✓ ' + message.id : '✗ failed')

// Admin gets all messages
const allRes = await fetch(`${BASE}/messages`, {
  headers: { Authorization: `Bearer ${token}` }
})
const allMessages = await allRes.json()
console.log('Get all messages:', Array.isArray(allMessages) ? '✓ count: ' + allMessages.length : '✗ failed')

// Admin replies
const replyRes = await fetch(`${BASE}/messages/reply`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    replyTo: 'Amaka Obi',
    text:    'Hello Amaka! We would love to help with your wedding cake. What date is the wedding?'
  })
})
const replyData = await replyRes.json()
console.log('Admin reply:', replyData?.message?.isAdmin ? '✓ sent' : '✗ failed')

// Get full conversation
const convRes = await fetch(`${BASE}/messages/conversation/Amaka Obi`, {
  headers: { Authorization: `Bearer ${token}` }
})
const conv = await convRes.json()
console.log('Get conversation:', Array.isArray(conv) ? '✓ messages: ' + conv.length : '✗ failed')

// Unread count
const countRes = await fetch(`${BASE}/messages/unread-count`, {
  headers: { Authorization: `Bearer ${token}` }
})
const countData = await countRes.json()
console.log('Unread count:', typeof countData?.count === 'number' ? '✓ count: ' + countData.count : '✗ failed')