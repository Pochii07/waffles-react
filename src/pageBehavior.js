export function initPage() {
  const cleanups = []

  const addListener = (target, event, handler, options) => {
    if (!target) return
    target.addEventListener(event, handler, options)
    cleanups.push(() => target.removeEventListener(event, handler, options))
  }

  const cursor = document.getElementById('cursor')
  const cursorRing = document.getElementById('cursor-ring')
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches

  if (cursor && cursorRing && !isTouchLike) {
    let mx = 0
    let my = 0
    let rx = 0
    let ry = 0
    let rafId = 0

    const mouseMoveHandler = (event) => {
      mx = event.clientX
      my = event.clientY
      cursor.style.left = `${mx}px`
      cursor.style.top = `${my}px`
    }

    addListener(document, 'mousemove', mouseMoveHandler)

    const animRing = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      cursorRing.style.left = `${rx}px`
      cursorRing.style.top = `${ry}px`
      rafId = requestAnimationFrame(animRing)
    }

    animRing()
    cleanups.push(() => cancelAnimationFrame(rafId))

    document.querySelectorAll('a,button,.menu-card,.delivery-card').forEach((element) => {
      const onEnter = () => cursorRing.classList.add('expand')
      const onLeave = () => cursorRing.classList.remove('expand')
      addListener(element, 'mouseenter', onEnter)
      addListener(element, 'mouseleave', onLeave)
    })
  } else {
    if (cursor) cursor.style.display = 'none'
    if (cursorRing) cursorRing.style.display = 'none'
  }

  const dotPattern = document.getElementById('dotPattern')
  if (dotPattern) {
    for (let i = 0; i < 48; i += 1) {
      const dot = document.createElement('span')
      dotPattern.appendChild(dot)
    }
  }

  const reveals = document.querySelectorAll('.reveal')
  let observer = null

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    reveals.forEach((element) => observer.observe(element))
  } else {
    reveals.forEach((element) => element.classList.add('visible'))
  }

  document.querySelectorAll('.tab-btn').forEach((button) => {
    const onClick = () => {
      document.querySelectorAll('.tab-btn').forEach((tab) => tab.classList.remove('active'))
      button.classList.add('active')
      document.querySelectorAll('.menu-panel').forEach((panel) => panel.classList.remove('active'))
      const panel = document.getElementById(`tab-${button.dataset.tab}`)
      if (panel) panel.classList.add('active')
    }

    addListener(button, 'click', onClick)
  })

  const navToggle = document.getElementById('navToggle')
  const primaryNav = document.getElementById('primaryNav')

  if (navToggle && primaryNav) {
    const closeNav = () => {
      primaryNav.classList.remove('open')
      navToggle.classList.remove('active')
      navToggle.setAttribute('aria-expanded', 'false')
      document.body.classList.remove('nav-open')
    }

    const onToggleClick = () => {
      const isOpen = primaryNav.classList.toggle('open')
      navToggle.classList.toggle('active', isOpen)
      navToggle.setAttribute('aria-expanded', String(isOpen))
      document.body.classList.toggle('nav-open', isOpen)
    }

    addListener(navToggle, 'click', onToggleClick)

    primaryNav.querySelectorAll('a').forEach((link) => {
      addListener(link, 'click', closeNav)
    })

    const onResize = () => {
      if (window.innerWidth > 860) closeNav()
    }

    const onEscape = (event) => {
      if (event.key === 'Escape') closeNav()
    }

    addListener(window, 'resize', onResize)
    addListener(document, 'keydown', onEscape)
  }

  initReviews()
  initLocationMap()

  return () => {
    if (observer) observer.disconnect()
    cleanups.forEach((dispose) => dispose())
  }
}

async function initReviews() {
  const grid = document.getElementById('reviewsGrid')
  const summary = document.getElementById('reviewsSummary')
  const link = document.getElementById('reviewsGoogleLink')

  if (!grid) return

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}reviews.json`, { cache: 'no-cache' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()

    if (link && data.googleMapsUri) {
      link.href = data.googleMapsUri
    }

    if (summary && data.rating != null) {
      const filled = '★'.repeat(Math.round(data.rating))
      const empty = '☆'.repeat(5 - Math.round(data.rating))
      const count = data.userRatingCount
        ? ` · ${data.userRatingCount.toLocaleString()} reviews`
        : ''
      summary.innerHTML = `
        <span class="summary-stars" aria-hidden="true">${filled}${empty}</span>
        <span class="summary-rating">${data.rating.toFixed(1)} / 5</span>
        <span>${count}</span>
      `
    }

    grid.innerHTML = ''
    const reviews = Array.isArray(data.reviews) ? data.reviews : []
    reviews.slice(0, 6).forEach((review, index) => {
      grid.appendChild(createReviewCard(review, index))
    })
  } catch (error) {
    console.warn('[reviews] Unable to load reviews.json', error)
    if (grid && !grid.children.length) {
      grid.innerHTML =
        '<p class="reviews-fallback" style="grid-column:1/-1; text-align:center; color:var(--gray);">' +
        'Reviews are unavailable right now. Visit our Google listing to read what people are saying.' +
        '</p>'
    }
  }
}

function createReviewCard(review, index) {
  const card = document.createElement('div')
  card.className = `review-card review-card-google reveal${index ? ` reveal-delay-${Math.min(index, 2)}` : ''} visible`

  const author = review.author ?? {}
  const displayName = author.displayName || 'Anonymous'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const avatarHtml = author.photoUri
    ? `<img class="review-avatar" src="${escapeAttr(author.photoUri)}" alt="${escapeAttr(displayName)}" loading="lazy" referrerpolicy="no-referrer" width="44" height="44" />`
    : `<div class="review-avatar-fallback" aria-hidden="true">${escapeText(initials || 'WA')}</div>`

  const nameHtml = author.uri
    ? `<a href="${escapeAttr(author.uri)}" target="_blank" rel="noopener">${escapeText(displayName)}</a>`
    : escapeText(displayName)

  const rating = Number(review.rating) || 5
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const dateLabel = review.relativePublishTimeDescription
    || (review.publishTime ? new Date(review.publishTime).toLocaleDateString() : '')

  card.innerHTML = `
    <div class="review-author-row">
      ${avatarHtml}
      <div>
        <div class="reviewer-name">${nameHtml}</div>
        <div class="reviewer-date">${escapeText(dateLabel)}</div>
      </div>
    </div>
    <div class="review-meta">
      <div class="stars" aria-label="${rating} out of 5 stars">${stars}</div>
      <div class="review-source">Google</div>
    </div>
    <p class="review-text">${escapeText(review.text || '')}</p>
  `
  return card
}

function initLocationMap() {
  const iframe = document.getElementById('locationMap')
  if (!iframe) return

  const key = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID

  if (key && placeId) {
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=place_id:${encodeURIComponent(placeId)}`
  } else {
    iframe.removeAttribute('src')
    iframe.style.display = 'none'
  }
}

function escapeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, '&quot;')
}
