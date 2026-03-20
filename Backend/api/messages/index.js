import express from 'express'
import prisma from '../../lib/db.js'
import { requireAuth, requireAdmin } from '../../lib/middleware.js'

const router = express.Router()

// POST /api/messages — send a message (public)
router.post('/', async (req, res) => {
  try {
    const { senderName, senderEmail, text } = req.body

    if (!senderName || !text) {
      return res.status(400).json({ error: 'Name and message text are required' })
    }

    const message = await prisma.message.create({
      data: {
        senderName,
        senderEmail: senderEmail || null,
        text,
        isAdmin: false
      }
    })

    res.status(201).json({ success: true, message })

  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// GET /api/messages — get all messages (admin only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' }
    })
    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// GET /api/messages/conversation/:senderName — get thread for one customer (admin only)
router.get('/conversation/:senderName', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { senderName } = req.params

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderName, isAdmin: false },
          { replyTo: senderName, isAdmin: true }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })

    res.json(messages)

  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

// GET /api/messages/mine/:senderName — get thread for a customer (public, by name)
router.get('/mine/:senderName', async (req, res) => {
  try {
    const { senderName } = req.params

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderName, isAdmin: false },
          { replyTo: senderName, isAdmin: true }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })

    res.json(messages)

  } catch (error) {
    console.error('Get my messages error:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// POST /api/messages/reply — admin replies to a customer
router.post('/reply', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { replyTo, text } = req.body

    if (!replyTo || !text) {
      return res.status(400).json({ error: 'replyTo and text are required' })
    }

    const message = await prisma.message.create({
      data: {
        senderName:  'Sweet Delights',
        senderEmail: null,
        text,
        isAdmin:     true,
        replyTo
      }
    })

    res.status(201).json({ success: true, message })

  } catch (error) {
    console.error('Reply error:', error)
    res.status(500).json({ error: 'Failed to send reply' })
  }
})

// GET /api/messages/unread-count — count of unread customer messages (admin only)
router.get('/unread-count', requireAuth, requireAdmin, async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: { isAdmin: false }
    })
    res.json({ count })
  } catch (error) {
    console.error('Unread count error:', error)
    res.status(500).json({ error: 'Failed to get unread count' })
  }
})

export default router