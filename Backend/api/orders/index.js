import express from 'express'
import prisma from '../../lib/db.js'
import { requireAuth, requireAdmin } from '../../lib/middleware.js'

const router = express.Router()

// POST /api/orders — create a new order (public, no auth required)
router.post('/', async (req, res) => {
  try {
    const {
      cakeName, size, layers, quantity, flavor,
      deliveryOption, deliveryDate, deliveryAddress,
      customerName, customerPhone, customerEmail,
      specialRequests
    } = req.body

    if (!cakeName || !size || !layers || !deliveryDate || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Attach to user account if token provided
    let userId = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifyToken } = await import('../../lib/auth.js')
      const payload = verifyToken(authHeader.split(' ')[1])
      if (payload) userId = payload.userId
    }

    const order = await prisma.order.create({
      data: {
        userId,
        cakeName, size, layers,
        quantity:        parseInt(quantity) || 1,
        flavor:          flavor || null,
        deliveryOption:  deliveryOption || 'pickup',
        deliveryDate,
        deliveryAddress: deliveryAddress || null,
        customerName,
        customerPhone,
        customerEmail:   customerEmail || null,
        specialRequests: specialRequests || null,
        status:          'PENDING'
      }
    })

    res.status(201).json({ success: true, order })

  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// GET /api/orders — get all orders (admin only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query

    const where = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { customerName:  { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { cakeName:      { contains: search, mode: 'insensitive' } },
        { id:            { contains: search } }
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, fullName: true } } }
    })

    res.json(orders)

  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /api/orders/mine — get current user's orders (auth required)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (error) {
    console.error('Get my orders error:', error)
    res.status(500).json({ error: 'Failed to fetch your orders' })
  }
})

// GET /api/orders/:id — get single order by ID (public — customers track by ID)
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id }
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// PATCH /api/orders/:id/status — update order status (admin only)
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['PENDING', 'CONFIRMED', 'BAKING', 'DELIVERED', 'CANCELLED']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data:  { status }
    })

    res.json({ success: true, order })

  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// PATCH /api/orders/:id/cancel — cancel order (auth required, own order only)
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id }
    })

    if (!order) return res.status(404).json({ error: 'Order not found' })

    // Only owner or admin can cancel
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised to cancel this order' })
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ error: 'This order cannot be cancelled' })
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data:  { status: 'CANCELLED' }
    })

    res.json({ success: true, order: updated })

  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
})

export default router