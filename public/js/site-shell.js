import { getUser, isLoggedIn, apiLogout } from './api.js'

function ensureShellStyles() {
  if (document.getElementById('site-shell-styles')) return

  const style = document.createElement('style')
  style.id = 'site-shell-styles'
  style.textContent = `
    .auth-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.9rem;
      flex-wrap: wrap;
    }

    .auth-nav .auth-name {
      color: var(--brown);
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .auth-nav a {
      text-decoration: none;
    }

    .footer.footer-rich-shell {
      display: block !important;
      background: var(--ink);
      padding: 3.5rem 5% 2rem;
      margin-top: 5rem;
    }

    .footer-rich-shell .footer-top-shell {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .footer-rich-shell .footer-logo-shell {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.8rem;
      color: var(--gold-light);
      font-weight: 300;
      margin-bottom: 0.75rem;
    }

    .footer-rich-shell .footer-desc-shell {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.45);
      line-height: 1.8;
      font-weight: 300;
      max-width: 320px;
    }

    .footer-rich-shell .footer-col-title-shell {
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 500;
      margin-bottom: 1.25rem;
    }

    .footer-rich-shell .footer-links-shell {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin: 0;
      padding: 0;
    }

    .footer-rich-shell .footer-links-shell a {
      text-decoration: none;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.48);
      font-weight: 300;
      transition: color 0.2s;
    }

    .footer-rich-shell .footer-links-shell a:hover {
      color: rgba(255,255,255,0.88);
    }

    .footer-rich-shell .footer-bottom-shell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .footer-rich-shell .footer-copy-shell {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.28);
      font-weight: 300;
      letter-spacing: 0.05em;
    }

    .footer-rich-shell .footer-note-shell {
      font-size: 0.68rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 500;
      background: rgba(196,146,74,0.1);
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
    }

    @media (max-width: 900px) {
      .footer-rich-shell .footer-top-shell {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .footer.footer-rich-shell {
        padding: 3rem 5% 1.8rem;
      }

      .footer-rich-shell .footer-bottom-shell {
        flex-direction: column;
        align-items: flex-start;
      }

      .auth-nav .auth-name {
        width: 100%;
      }
    }
  `

  document.head.appendChild(style)
}

function titleCase(value) {
  const raw = String(value || '').trim()
  if (!raw) return 'Account'
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

function getDisplayName(user) {
  const fullName = String(user?.fullName || '').trim()
  if (fullName) {
    return titleCase(fullName.split(/\s+/)[0])
  }

  const email = String(user?.email || '').trim()
  if (email.includes('@')) {
    return titleCase(email.split('@')[0].split(/[._-]/)[0])
  }

  return 'Account'
}

function renderAuthNav() {
  const authNav = document.getElementById('authNav')
  if (!authNav) return

  authNav.classList.add('auth-nav')

  if (isLoggedIn()) {
    const user = getUser()
    const name = getDisplayName(user)

    authNav.innerHTML = `
      <span class="auth-name">${name}</span>
      <a href="#" id="logoutBtn">Logout</a>
    `

    document.getElementById('logoutBtn')?.addEventListener('click', event => {
      event.preventDefault()
      apiLogout()
    })
    return
  }

  authNav.innerHTML = `
    <a href="auth/register.html">Sign Up</a>
    <a href="auth/login.html" class="nav-cta">Login</a>
  `
}

function renderFooter() {
  const footer = document.querySelector('footer.footer')
  if (!footer) return

  footer.classList.add('footer-rich-shell')
  footer.innerHTML = `
    <div class="footer-top-shell">
      <div>
        <div class="footer-logo-shell">Sweet Delights</div>
        <p class="footer-desc-shell">Handcrafted cakes baked fresh for every occasion. Proudly based in Lagos, Nigeria.</p>
      </div>
      <div>
        <div class="footer-col-title-shell">Navigate</div>
        <ul class="footer-links-shell">
          <li><a href="index.html">Home</a></li>
          <li><a href="gallery.html">Gallery</a></li>
          <li><a href="order.html">Order a Cake</a></li>
          <li><a href="my-orders.html">My Orders</a></li>
          <li><a href="chat.html">Chat with Us</a></li>
          <li><a href="auth/admin-login.html">Admin Login</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title-shell">Contact</div>
        <ul class="footer-links-shell">
          <li><a href="mailto:hello@sweetdelights.ng">hello@sweetdelights.ng</a></li>
          <li><a href="tel:08012345678">08012345678</a></li>
          <li><a href="https://maps.google.com/?q=Lagos,Nigeria">Lagos, Nigeria</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom-shell">
      <span class="footer-copy-shell">&copy; 2025 Sweet Delights Bakery. All rights reserved.</span>
      <span class="footer-note-shell">Baked Fresh Daily</span>
    </div>
  `
}

ensureShellStyles()
renderAuthNav()
renderFooter()
