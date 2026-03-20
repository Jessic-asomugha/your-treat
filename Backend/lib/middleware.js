import { verifyToken, getTokenFromHeader } from './auth.js'
import prisma from './db.js'

export async function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req)
  if (!token) return res.status(401).json({ error: 'Unauthorised' })

  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' })

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) return res.status(401).json({ error: 'User not found' })

  req.user = user
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}