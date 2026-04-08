import prisma from '../../lib/db.js'
import bcrypt from 'bcryptjs'

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken:        token,
        resetTokenExpiry:  { gt: new Date() }
      }
    })

    if (!user) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired.' })
    }

    // Update password and clear token
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:         hashedPassword,
        resetToken:       null,
        resetTokenExpiry: null
      }
    })

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}