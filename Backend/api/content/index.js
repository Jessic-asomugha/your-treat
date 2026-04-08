import express from 'express'
import prisma from '../../lib/db.js'
import { requireAuth, requireAdmin } from '../../lib/middleware.js'

const router = express.Router()

const gallerySelect = {
  id: true,
  title: true,
  category: true,
  tag: true,
  sizes: true,
  layers: true,
  priceLabel: true,
  summary: true,
  description: true,
  imageUrl: true,
  featured: true,
  active: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true
}

const promoSelect = {
  id: true,
  title: true,
  message: true,
  ctaLabel: true,
  ctaUrl: true,
  active: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true
}

const postSelect = {
  id: true,
  title: true,
  tag: true,
  excerpt: true,
  body: true,
  imageUrl: true,
  active: true,
  sortOrder: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true
}

function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return fallback
}

function parseIntValue(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

function orderByContent() {
  return [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
}

router.get('/public', async (req, res) => {
  try {
    const [galleryItems, promos, posts] = await Promise.all([
      prisma.galleryItem.findMany({
        where: { active: true },
        orderBy: orderByContent(),
        select: gallerySelect
      }),
      prisma.promo.findMany({
        where: { active: true },
        orderBy: orderByContent(),
        select: promoSelect
      }),
      prisma.sitePost.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
        select: postSelect
      })
    ])

    res.json({ galleryItems, promos, posts })
  } catch (error) {
    console.error('Get public content error:', error)
    res.status(500).json({ error: 'Failed to fetch site content' })
  }
})

router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [galleryItems, promos, posts] = await Promise.all([
      prisma.galleryItem.findMany({ orderBy: orderByContent(), select: gallerySelect }),
      prisma.promo.findMany({ orderBy: orderByContent(), select: promoSelect }),
      prisma.sitePost.findMany({
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
        select: postSelect
      })
    ])

    res.json({ galleryItems, promos, posts })
  } catch (error) {
    console.error('Get admin content error:', error)
    res.status(500).json({ error: 'Failed to fetch admin content' })
  }
})

router.post('/gallery', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, category, tag, sizes, layers, priceLabel, summary, description, imageUrl, featured, active, sortOrder } = req.body

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Title, category, and description are required' })
    }

    const item = await prisma.galleryItem.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        tag: tag?.trim() || null,
        sizes: sizes?.trim() || null,
        layers: layers?.trim() || null,
        priceLabel: priceLabel?.trim() || null,
        summary: summary?.trim() || null,
        description: description.trim(),
        imageUrl: imageUrl?.trim() || null,
        featured: parseBoolean(featured),
        active: parseBoolean(active, true),
        sortOrder: parseIntValue(sortOrder)
      },
      select: gallerySelect
    })

    res.status(201).json({ item })
  } catch (error) {
    console.error('Create gallery item error:', error)
    res.status(500).json({ error: 'Failed to create gallery item' })
  }
})

router.patch('/gallery/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, category, tag, sizes, layers, priceLabel, summary, description, imageUrl, featured, active, sortOrder } = req.body

    const item = await prisma.galleryItem.update({
      where: { id: req.params.id },
      data: {
        title: title?.trim(),
        category: category?.trim(),
        tag: tag === undefined ? undefined : (tag?.trim() || null),
        sizes: sizes === undefined ? undefined : (sizes?.trim() || null),
        layers: layers === undefined ? undefined : (layers?.trim() || null),
        priceLabel: priceLabel === undefined ? undefined : (priceLabel?.trim() || null),
        summary: summary === undefined ? undefined : (summary?.trim() || null),
        description: description?.trim(),
        imageUrl: imageUrl === undefined ? undefined : (imageUrl?.trim() || null),
        featured: featured === undefined ? undefined : parseBoolean(featured),
        active: active === undefined ? undefined : parseBoolean(active),
        sortOrder: sortOrder === undefined ? undefined : parseIntValue(sortOrder)
      },
      select: gallerySelect
    })

    res.json({ item })
  } catch (error) {
    console.error('Update gallery item error:', error)
    res.status(500).json({ error: 'Failed to update gallery item' })
  }
})

router.delete('/gallery/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.galleryItem.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete gallery item error:', error)
    res.status(500).json({ error: 'Failed to delete gallery item' })
  }
})

router.post('/promos', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, message, ctaLabel, ctaUrl, active, sortOrder } = req.body

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' })
    }

    const promo = await prisma.promo.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        ctaLabel: ctaLabel?.trim() || null,
        ctaUrl: ctaUrl?.trim() || null,
        active: parseBoolean(active, true),
        sortOrder: parseIntValue(sortOrder)
      },
      select: promoSelect
    })

    res.status(201).json({ promo })
  } catch (error) {
    console.error('Create promo error:', error)
    res.status(500).json({ error: 'Failed to create promo' })
  }
})

router.patch('/promos/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, message, ctaLabel, ctaUrl, active, sortOrder } = req.body

    const promo = await prisma.promo.update({
      where: { id: req.params.id },
      data: {
        title: title?.trim(),
        message: message?.trim(),
        ctaLabel: ctaLabel === undefined ? undefined : (ctaLabel?.trim() || null),
        ctaUrl: ctaUrl === undefined ? undefined : (ctaUrl?.trim() || null),
        active: active === undefined ? undefined : parseBoolean(active),
        sortOrder: sortOrder === undefined ? undefined : parseIntValue(sortOrder)
      },
      select: promoSelect
    })

    res.json({ promo })
  } catch (error) {
    console.error('Update promo error:', error)
    res.status(500).json({ error: 'Failed to update promo' })
  }
})

router.delete('/promos/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.promo.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete promo error:', error)
    res.status(500).json({ error: 'Failed to delete promo' })
  }
})

router.post('/posts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, tag, excerpt, body, imageUrl, active, sortOrder, publishedAt } = req.body

    if (!title || !excerpt) {
      return res.status(400).json({ error: 'Title and excerpt are required' })
    }

    const post = await prisma.sitePost.create({
      data: {
        title: title.trim(),
        tag: tag?.trim() || null,
        excerpt: excerpt.trim(),
        body: body?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        active: parseBoolean(active, true),
        sortOrder: parseIntValue(sortOrder),
        publishedAt: publishedAt ? new Date(publishedAt) : new Date()
      },
      select: postSelect
    })

    res.status(201).json({ post })
  } catch (error) {
    console.error('Create site post error:', error)
    res.status(500).json({ error: 'Failed to create site update' })
  }
})

router.patch('/posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, tag, excerpt, body, imageUrl, active, sortOrder, publishedAt } = req.body

    const post = await prisma.sitePost.update({
      where: { id: req.params.id },
      data: {
        title: title?.trim(),
        tag: tag === undefined ? undefined : (tag?.trim() || null),
        excerpt: excerpt?.trim(),
        body: body === undefined ? undefined : (body?.trim() || null),
        imageUrl: imageUrl === undefined ? undefined : (imageUrl?.trim() || null),
        active: active === undefined ? undefined : parseBoolean(active),
        sortOrder: sortOrder === undefined ? undefined : parseIntValue(sortOrder),
        publishedAt: publishedAt === undefined ? undefined : (publishedAt ? new Date(publishedAt) : null)
      },
      select: postSelect
    })

    res.json({ post })
  } catch (error) {
    console.error('Update site post error:', error)
    res.status(500).json({ error: 'Failed to update site update' })
  }
})

router.delete('/posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.sitePost.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete site post error:', error)
    res.status(500).json({ error: 'Failed to delete site update' })
  }
})

export default router
