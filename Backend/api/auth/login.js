import bcrypt from 'bcryptjs'
import prisma from '../../lib/db.js'
import { signToken } from '../../lib/auth.js'

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Sign token
    const token = signToken({ userId: user.id, role: user.role })

    res.json({
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
    console.error('Login error:', error)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}