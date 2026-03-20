import bcrypt from 'bcryptjs'
import prisma from '../../lib/db.js'
import { signToken } from '../../lib/auth.js'

export async function register(req, res) {
  try {
    const { email, password, fullName, phone } = req.body

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password and full name are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        role: 'CUSTOMER'
      }
    })

    // Sign token
    const token = signToken({ userId: user.id, role: user.role })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}