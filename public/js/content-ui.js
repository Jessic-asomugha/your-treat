import { apiGetPublicContent } from './api.js'

const defaultGalleryItems = [
  {
    title: 'Chocolate Delight',
    category: 'Premium',
    tag: 'Signature',
    sizes: '6, 8, 10 inches',
    layers: '2-4 layers',
    priceLabel: 'From ₦12,000',
    summary: 'Rich dark chocolate sponge with ganache',
    description: 'Rich dark chocolate sponge layered with velvety ganache and finished with a smooth chocolate cream frosting.',
    imageUrl: 'images/chocolate cake.jpg',
    featured: true,
    active: true,
    sortOrder: 0
  },
  {
    title: 'Vanilla Dream',
    category: 'Classic',
    tag: 'Classic',
    sizes: '6, 8 inches',
    layers: '2-3 layers',
    priceLabel: 'From ₦9,500',
    summary: 'Classic buttercream finish',
    description: 'Classic vanilla sponge with smooth Madagascar vanilla buttercream, light and elegant for birthdays and anniversaries.',
    imageUrl: 'images/vanilla-cake.jpg',
    featured: true,
    active: true,
    sortOrder: 1
  },
  {
    title: 'Red Velvet Romance',
    category: 'Premium',
    tag: 'Fan Favourite',
    sizes: '8, 10 inches',
    layers: '3-4 layers',
    priceLabel: 'From ₦11,000',
    summary: 'Cream cheese frosting',
    description: 'Soft, velvety red sponge paired with tangy cream cheese frosting for a dramatic celebration cake.',
    imageUrl: 'images/red velvet cake.jpg',
    featured: true,
    active: true,
    sortOrder: 2
  },
  {
    title: 'Strawberry Passion',
    category: 'Seasonal',
    tag: 'Seasonal',
    sizes: '6, 8, 10 inches',
    layers: '2-3 layers',
    priceLabel: 'From ₦10,500',
    summary: 'Fresh strawberries layered with light cream',
    description: 'Fresh strawberries folded into a light cream sponge and finished with whipped cream frosting.',
    imageUrl: 'images/strawberry cake.jpg',
    featured: false,
    active: true,
    sortOrder: 3
  },
  {
    title: 'Loaf Delight',
    category: 'Classic',
    tag: 'Classic',
    sizes: 'Standard loaf',
    layers: 'Single',
    priceLabel: 'From ₦6,000',
    summary: 'A moist loaf cake for gifting or tea time',
    description: 'A perfectly baked loaf cake with a tender crumb and golden crust for casual sharing and gifting.',
    imageUrl: 'images/bread cake.jpg',
    featured: false,
    active: true,
    sortOrder: 4
  },
  {
    title: 'Caramel Heaven',
    category: 'Premium',
    tag: 'Premium',
    sizes: '6, 8, 10 inches',
    layers: '3-4 layers',
    priceLabel: 'From ₦13,500',
    summary: 'Salted caramel indulgence',
    description: 'Decadent caramel sponge drizzled with homemade salted caramel and finished with smooth caramel buttercream.',
    imageUrl: 'images/chocolate cake.jpg',
    featured: false,
    active: true,
    sortOrder: 5
  }
]

const defaultPromos = [
  {
    title: 'Weekend Celebration Offer',
    message: 'Book your celebration cake at least 48 hours ahead and enjoy priority scheduling for weekend pickups.',
    ctaLabel: 'Place an Order',
    ctaUrl: 'order.html',
    active: true,
    sortOrder: 0
  }
]

const defaultPosts = [
  {
    title: 'Fresh flavours are back in rotation',
    tag: 'Kitchen Update',
    excerpt: 'Our strawberry and caramel favourites are back in steady rotation after a busy run of custom orders.',
    body: '',
    imageUrl: '',
    active: true,
    sortOrder: 0,
    publishedAt: new Date().toISOString()
  },
  {
    title: 'Weekend slots fill fastest',
    tag: 'Planning Tip',
    excerpt: 'Weekend celebration cakes move quickly, so we recommend booking a little earlier when you can.',
    body: '',
    imageUrl: '',
    active: true,
    sortOrder: 1,
    publishedAt: new Date().toISOString()
  }
]

const placeholderClasses = ['grad-choc', 'grad-van', 'grad-red', 'grad-straw', 'grad-loaf', 'grad-cara']

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatPublishedDate(value) {
  const date = value ? new Date(value) : new Date()
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getFallbackContent() {
  return {
    galleryItems: defaultGalleryItems,
    promos: defaultPromos,
    posts: defaultPosts
  }
}

async function loadPublicContent() {
  try {
    const data = await apiGetPublicContent()
    return {
      galleryItems: data.galleryItems?.length ? data.galleryItems : defaultGalleryItems,
      promos: data.promos?.length ? data.promos : defaultPromos,
      posts: data.posts?.length ? data.posts : defaultPosts
    }
  } catch (error) {
    console.error('Public content load failed:', error)
    return getFallbackContent()
  }
}

function renderHomePromos(promos) {
  const section = document.getElementById('promoSection')
  if (!section) return

  if (!promos.length) {
    section.style.display = 'none'
    return
  }

  section.innerHTML = promos.slice(0, 2).map((promo, index) => `
    <article class="promo-card ${index === 0 ? 'primary' : ''}">
      <p class="promo-label">Promo</p>
      <h3 class="promo-title">${escapeHtml(promo.title)}</h3>
      <p class="promo-text">${escapeHtml(promo.message)}</p>
      ${promo.ctaLabel && promo.ctaUrl ? `<a class="promo-link" href="${escapeHtml(promo.ctaUrl)}">${escapeHtml(promo.ctaLabel)} →</a>` : ''}
    </article>
  `).join('')

  section.style.display = 'grid'
}

function featuredItems(items) {
  const active = items.filter(item => item.active !== false)
  const picked = active.filter(item => item.featured).slice(0, 3)
  return (picked.length ? picked : active).slice(0, 3)
}

function thumbVariant(index) {
  if (index === 1) return 'cake-thumb-b'
  if (index === 2) return 'cake-thumb-c'
  return ''
}

function backgroundStyle(item) {
  if (!item.imageUrl) return ''
  const url = escapeHtml(item.imageUrl)
  return `background-image:linear-gradient(rgba(20,12,8,0.15), rgba(20,12,8,0.35)), url('${url}');background-size:cover;background-position:center;`
}

function renderHomeFeatured(items) {
  const grid = document.getElementById('featuredCakesGrid')
  if (!grid) return

  const featured = featuredItems(items)
  grid.innerHTML = featured.map((item, index) => `
    <article class="cake-card">
      <div class="cake-thumb ${thumbVariant(index)}" style="${backgroundStyle(item)}">
        <div class="cake-overlay">
          <div class="cake-name">${escapeHtml(item.title)}</div>
          <div class="cake-desc">${escapeHtml(item.summary || item.description)}</div>
        </div>
      </div>
      <div class="cake-info">
        <span class="cake-price">${escapeHtml(item.priceLabel || 'Custom pricing')}</span>
        <span class="cake-tag">${escapeHtml(item.tag || item.category)}</span>
      </div>
    </article>
  `).join('')
}

function renderHomePosts(posts) {
  const section = document.getElementById('updatesSection')
  const grid = document.getElementById('updatesGrid')
  if (!section || !grid) return

  if (!posts.length) {
    section.style.display = 'none'
    return
  }

  grid.innerHTML = posts.slice(0, 3).map(post => `
    <article class="update-card">
      <div class="update-meta">
        <span class="update-tag">${escapeHtml(post.tag || 'Sweet Delights')}</span>
        <span class="update-date">${formatPublishedDate(post.publishedAt)}</span>
      </div>
      <h3 class="update-title">${escapeHtml(post.title)}</h3>
      <p class="update-excerpt">${escapeHtml(post.excerpt)}</p>
    </article>
  `).join('')

  section.style.display = 'block'
}

let galleryItemsState = []
let currentFilter = 'all'

function modalPlaceholderClass(index) {
  return placeholderClasses[index % placeholderClasses.length]
}

function renderGalleryTabs(items) {
  const tabsWrap = document.getElementById('filterTabs')
  if (!tabsWrap) return

  const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))]
  tabsWrap.innerHTML = categories.map(category => `
    <button class="filter-tab ${category === currentFilter ? 'active' : ''}" data-filter="${escapeHtml(category)}">
      ${category === 'all' ? 'All' : escapeHtml(category)}
    </button>
  `).join('')

  tabsWrap.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.dataset.filter
      renderGalleryTabs(items)
      renderGalleryCards()
    })
  })
}

function renderGalleryCards() {
  const grid = document.getElementById('galleryGrid')
  const countDisplay = document.getElementById('countDisplay')
  if (!grid || !countDisplay) return

  const filtered = currentFilter === 'all'
    ? galleryItemsState
    : galleryItemsState.filter(item => item.category === currentFilter)

  countDisplay.textContent = filtered.length

  if (!filtered.length) {
    grid.innerHTML = `<div class="gallery-empty">No cakes match this filter right now.</div>`
    return
  }

  grid.innerHTML = filtered.map((item, index) => {
    const placeholderClass = modalPlaceholderClass(index)
    const imageUrl = item.imageUrl ? escapeHtml(item.imageUrl) : ''
    return `
      <article class="cake-card"
        data-category="${escapeHtml(item.category)}"
        data-name="${escapeHtml(item.title)}"
        data-tag="${escapeHtml(item.tag || item.category)}"
        data-sizes="${escapeHtml(item.sizes || 'Custom sizes available')}"
        data-layers="${escapeHtml(item.layers || 'Custom layers available')}"
        data-price="${escapeHtml(item.priceLabel || 'Custom pricing')}"
        data-desc="${escapeHtml(item.description)}"
        data-img="${imageUrl}"
        data-grad="${placeholderClass}">
        <div class="card-img-wrap">
          ${imageUrl
            ? `<img class="card-img" src="${imageUrl}" alt="${escapeHtml(item.title)}">`
            : `<div class="card-img-placeholder ${placeholderClass}" style="display:flex;">${escapeHtml(item.title)}</div>`}
          ${imageUrl ? `<div class="card-img-placeholder ${placeholderClass}" style="display:none;">${escapeHtml(item.title)}</div>` : ''}
          <div class="card-overlay"><span class="card-overlay-btn">View Details</span></div>
        </div>
        <div class="card-body">
          <div>
            <div class="card-name">${escapeHtml(item.title)}</div>
            <div class="card-meta">${escapeHtml(item.priceLabel || 'Custom pricing')} · ${escapeHtml(item.sizes || 'Custom sizes')}</div>
          </div>
          <span class="card-tag">${escapeHtml(item.tag || item.category)}</span>
        </div>
      </article>
    `
  }).join('')

  grid.querySelectorAll('.cake-card').forEach((card, index) => {
    const img = card.querySelector('.card-img')
    const placeholder = card.querySelector('.card-img-placeholder')
    if (img && placeholder) {
      img.addEventListener('error', () => {
        img.style.display = 'none'
        placeholder.style.display = 'flex'
      })
    }

    card.addEventListener('click', () => openGalleryModal(card, index))
  })
}

function openGalleryModal(card, index) {
  const modalBackdrop = document.getElementById('modalBackdrop')
  if (!modalBackdrop) return

  document.getElementById('modalTitle').textContent = card.dataset.name
  document.getElementById('modalTag').textContent = card.dataset.tag
  document.getElementById('modalDesc').textContent = card.dataset.desc
  document.getElementById('modalSizes').textContent = card.dataset.sizes
  document.getElementById('modalLayers').textContent = card.dataset.layers
  document.getElementById('modalPrice').textContent = card.dataset.price

  const img = document.getElementById('modalImg')
  const placeholder = document.getElementById('modalImgPlaceholder')
  const grad = card.dataset.grad || modalPlaceholderClass(index)
  const src = card.dataset.img

  if (src) {
    img.src = src
    img.alt = card.dataset.name
    img.style.display = ''
    placeholder.style.display = 'none'
  } else {
    img.style.display = 'none'
    placeholder.style.display = 'flex'
  }

  placeholder.className = `modal-img-placeholder ${grad}`
  placeholder.textContent = card.dataset.name

  modalBackdrop.classList.add('show')
  document.body.style.overflow = 'hidden'
}

window.closeModal = function closeModal() {
  const modalBackdrop = document.getElementById('modalBackdrop')
  if (!modalBackdrop) return
  modalBackdrop.classList.remove('show')
  document.body.style.overflow = ''
}

function setupGalleryModal() {
  const modalBackdrop = document.getElementById('modalBackdrop')
  if (!modalBackdrop || modalBackdrop.dataset.bound === 'true') return

  modalBackdrop.dataset.bound = 'true'
  modalBackdrop.addEventListener('click', event => {
    if (event.target === event.currentTarget) window.closeModal()
  })

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') window.closeModal()
  })
}

function renderGalleryPage(items) {
  galleryItemsState = items.filter(item => item.active !== false)
  renderGalleryTabs(galleryItemsState)
  renderGalleryCards()
  setupGalleryModal()
}

function pageHas(id) {
  return Boolean(document.getElementById(id))
}

async function init() {
  const content = await loadPublicContent()

  if (pageHas('featuredCakesGrid')) {
    renderHomePromos(content.promos)
    renderHomeFeatured(content.galleryItems)
    renderHomePosts(content.posts)
  }

  if (pageHas('galleryGrid')) {
    renderGalleryPage(content.galleryItems)
  }
}

init()
