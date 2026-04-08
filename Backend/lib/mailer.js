import 'dotenv/config'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.FROM_EMAIL || 'Sweet Delights <onboarding@resend.dev>'
const ADMIN = process.env.ADMIN_EMAIL

function ensureResendConfigured() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing')
  }
}

function cleanBaseUrl(url) {
  return String(url || '')
    .trim()
    .replace(/\/+$/, '')
}

function formatDeliveryDate(value) {
  if (!value) return 'Not provided'

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return value
  }
}

async function sendEmail(payload) {
  ensureResendConfigured()

  const result = await resend.emails.send(payload)
  if (result?.error) {
    const message = typeof result.error === 'string'
      ? result.error
      : result.error.message || JSON.stringify(result.error)

    throw new Error(`Resend send failed: ${message}`)
  }

  return result
}

export async function sendOrderConfirmation(order) {
  if (!order.customerEmail) return

  await sendEmail({
    from: FROM,
    to: order.customerEmail,
    subject: `Order Received - ${order.id} | Sweet Delights`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1C1410;">
        <h1 style="font-size: 2rem; color: #5C3317; margin-bottom: 0.5rem;">Sweet Delights</h1>
        <p style="color: #9E8A78; font-size: 0.85rem; margin-bottom: 2rem; letter-spacing: 0.1em; text-transform: uppercase;">Order Received</p>
        <p style="margin-bottom: 1.5rem;">Hi ${order.customerName},</p>
        <p style="margin-bottom: 1.5rem;">Thank you for your order. We've received it and will review the details shortly.</p>

        <div style="background: #FAF6F0; padding: 1.5rem; border-left: 3px solid #C4924A; margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #9E8A78;">Order ID</p>
          <p style="margin: 0 0 1rem; font-size: 1.5rem; font-weight: bold; color: #5C3317;">${order.id}</p>

          <table style="width: 100%; font-size: 0.88rem; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Cake</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.cakeName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Size</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.size}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Layers</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.layers}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Quantity</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.quantity}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Delivery</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #9E8A78;">Date</td>
              <td style="padding: 0.5rem 0; text-align: right;">${formatDeliveryDate(order.deliveryDate)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #FAF6F0; padding: 1.5rem; margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.75rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #9E8A78;">Payment Details</p>
          <p style="margin: 0 0 0.25rem; font-size: 0.88rem;"><strong>Bank:</strong> First Bank of Nigeria</p>
          <p style="margin: 0 0 0.25rem; font-size: 0.88rem;"><strong>Account Name:</strong> Sweet Delights Bakery</p>
          <p style="margin: 0 0 0.25rem; font-size: 0.88rem;"><strong>Account Number:</strong> 1234567890</p>
          <p style="margin: 0 0 0.75rem; font-size: 0.88rem;"><strong>Reference:</strong> ${order.id}</p>
          <p style="font-size: 0.8rem; color: #9E8A78;">Please use your Order ID as payment reference and send proof to WhatsApp: +234 800 123 4567.</p>
        </div>

        <p style="font-size: 0.85rem; color: #9E8A78; margin-bottom: 0.5rem;">Questions? Reply to this email or chat with us on our website.</p>
        <p style="font-size: 0.85rem; color: #9E8A78;">- The Sweet Delights Team</p>
      </div>
    `
  })
}

export async function sendAdminOrderNotification(order) {
  if (!ADMIN) return

  await sendEmail({
    from: FROM,
    to: ADMIN,
    subject: `New Order - ${order.id} | Sweet Delights`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1C1410;">
        <h1 style="font-size: 2rem; color: #5C3317; margin-bottom: 0.5rem;">New Order Received</h1>
        <p style="color: #9E8A78; font-size: 0.85rem; margin-bottom: 2rem;">${new Date().toLocaleString('en-NG')}</p>

        <div style="background: #FAF6F0; padding: 1.5rem; border-left: 3px solid #C4924A; margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #9E8A78;">Order ID</p>
          <p style="margin: 0 0 1rem; font-size: 1.5rem; font-weight: bold; color: #5C3317;">${order.id}</p>

          <table style="width: 100%; font-size: 0.88rem; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Customer</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.customerName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Phone</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.customerPhone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Email</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.customerEmail || '-'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Cake</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.cakeName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Size / Layers</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.size} / ${order.layers} layers</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Delivery</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Date</td>
              <td style="padding: 0.5rem 0; text-align: right;">${formatDeliveryDate(order.deliveryDate)}</td>
            </tr>
            ${order.specialRequests ? `
            <tr>
              <td style="padding: 0.5rem 0; color: #9E8A78;">Notes</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.specialRequests}</td>
            </tr>` : ''}
          </table>
        </div>

        <a href="${process.env.ADMIN_DASHBOARD_URL || '#'}" style="
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #5C3317;
          color: white;
          text-decoration: none;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        ">View in Dashboard</a>
      </div>
    `
  })
}

const STATUS_EMAILS = {
  PENDING: {
    subject: 'Order update received',
    heading: 'Your order update is in progress',
    message: 'We are reviewing your order details and will let you know once everything is confirmed.'
  },
  CONFIRMED: {
    subject: 'Your order has been confirmed',
    heading: 'Your order is confirmed',
    message: 'Your baker has reviewed your request and your order is now confirmed.'
  },
  BAKING: {
    subject: 'Your order is being baked',
    heading: 'Your cake is now being baked',
    message: 'Our team has started working on your cake and it is currently in production.'
  },
  DELIVERED: {
    subject: 'Your order has been completed',
    heading: 'Your order has been completed',
    message: 'Your order has been marked as completed. We hope your celebration is wonderful.'
  },
  CANCELLED: {
    subject: 'Your order has been cancelled',
    heading: 'Your order has been cancelled',
    message: 'This order has been cancelled. If this was unexpected, please reply to this email or contact us directly.'
  }
}

export async function sendOrderStatusUpdate(order) {
  if (!order.customerEmail) return

  const content = STATUS_EMAILS[order.status] || {
    subject: `Order status updated to ${order.status}`,
    heading: 'Your order status has changed',
    message: `Your order is now marked as ${order.status}.`
  }

  await sendEmail({
    from: FROM,
    to: order.customerEmail,
    subject: `${content.subject} - ${order.id} | Sweet Delights`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1C1410;">
        <h1 style="font-size: 2rem; color: #5C3317; margin-bottom: 0.5rem;">Sweet Delights</h1>
        <p style="color: #9E8A78; font-size: 0.85rem; margin-bottom: 2rem; letter-spacing: 0.1em; text-transform: uppercase;">Order Status Update</p>

        <p style="margin-bottom: 1.5rem;">Hi ${order.customerName},</p>
        <p style="margin-bottom: 1rem; font-size: 1.1rem; color: #5C3317;"><strong>${content.heading}</strong></p>
        <p style="margin-bottom: 1.5rem;">${content.message}</p>

        <div style="background: #FAF6F0; padding: 1.5rem; border-left: 3px solid #C4924A; margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #9E8A78;">Order ID</p>
          <p style="margin: 0 0 1rem; font-size: 1.5rem; font-weight: bold; color: #5C3317;">${order.id}</p>

          <table style="width: 100%; font-size: 0.88rem; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Status</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.status}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Cake</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.cakeName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2E8D9;">
              <td style="padding: 0.5rem 0; color: #9E8A78;">Delivery</td>
              <td style="padding: 0.5rem 0; text-align: right;">${order.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #9E8A78;">Date</td>
              <td style="padding: 0.5rem 0; text-align: right;">${formatDeliveryDate(order.deliveryDate)}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 0.85rem; color: #9E8A78;">If you have any questions, reply to this email and we'll help you out.</p>
      </div>
    `
  })
}

export async function sendPasswordResetEmail(email, resetToken, frontendUrl) {
  const baseUrl = cleanBaseUrl(frontendUrl || process.env.FRONTEND_URL)

  if (!baseUrl) {
    throw new Error('FRONTEND_URL is missing for password reset emails')
  }

  const resetUrl = `${baseUrl}/auth/reset-password.html?token=${encodeURIComponent(resetToken)}`

  await sendEmail({
    from: FROM,
    to: email,
    subject: 'Reset your password | Sweet Delights',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1C1410;">
        <h1 style="font-size: 2rem; color: #5C3317; margin-bottom: 0.5rem;">Sweet Delights</h1>
        <p style="color: #9E8A78; font-size: 0.85rem; margin-bottom: 2rem; letter-spacing: 0.1em; text-transform: uppercase;">Password Reset</p>
        <p style="margin-bottom: 1.5rem;">We received a request to reset your password. Click the button below to create a new one.</p>
        <p style="margin-bottom: 1.5rem; color: #9E8A78; font-size: 0.85rem;">This link expires in 1 hour. If you did not request this, ignore this email.</p>

        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #5C3317;
          color: white;
          text-decoration: none;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        ">Reset Password</a>

        <p style="font-size: 0.8rem; color: #9E8A78;">Or copy this link: ${resetUrl}</p>
        <p style="font-size: 0.85rem; color: #9E8A78; margin-top: 2rem;">- The Sweet Delights Team</p>
      </div>
    `
  })
}
