import express from 'express'
import { register } from './register.js'
import { login } from './login.js'
import { me } from './me.js'
import { requireAuth } from '../../lib/middleware.js'
import { forgotPassword } from './forgot-password.js'
import { resetPassword } from './reset-password.js'


const router = express.Router()

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, me)

export default router