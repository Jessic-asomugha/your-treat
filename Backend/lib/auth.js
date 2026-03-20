import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.split(' ')[1]
}