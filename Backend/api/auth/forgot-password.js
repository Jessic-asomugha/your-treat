import prisma from '../../lib/db.js'
import { sendPasswordResetEmail } from '../../lib/mailer.js'
import crypto from 'crypto'

function getFrontendUrl(req) {
  const configured = process.env.FRONTEND_URL?.trim()
  if (configured) return configured

  const origin = req.get('origin')?.trim()
  if (origin) return origin

  const referer = req.get('referer')
  if (!referer) return ''

  try {
    return new URL(referer).origin
  } catch {
    return ''
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success even if user not found — prevents email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' })
    }

    // Generate reset token
    const resetToken  = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save token to user
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry: resetExpiry
      }
    })

    // Send email
    await sendPasswordResetEmail(email, resetToken, getFrontendUrl(req))

    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
