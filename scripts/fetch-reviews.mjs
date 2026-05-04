import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '..', 'public', 'reviews.json')

const apiKey = process.env.GOOGLE_PLACES_API_KEY
const placeId = process.env.VITE_GOOGLE_PLACE_ID

if (!apiKey || !placeId) {
  console.warn(
    '[fetch-reviews] Missing GOOGLE_PLACES_API_KEY or VITE_GOOGLE_PLACE_ID. ' +
      'Skipping fetch and keeping any existing public/reviews.json.',
  )
  process.exit(0)
}

const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
const fieldMask = [
  'displayName',
  'rating',
  'userRatingCount',
  'googleMapsUri',
  'reviews',
].join(',')

const response = await fetch(url, {
  headers: {
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': fieldMask,
  },
})

if (!response.ok) {
  const body = await response.text()
  console.error(`[fetch-reviews] Places API error ${response.status}: ${body}`)
  process.exit(1)
}

const data = await response.json()

const payload = {
  fetchedAt: new Date().toISOString(),
  displayName: data.displayName?.text ?? null,
  rating: data.rating ?? null,
  userRatingCount: data.userRatingCount ?? null,
  googleMapsUri: data.googleMapsUri ?? null,
  reviews: (data.reviews ?? []).map((r) => ({
    name: r.name,
    rating: r.rating,
    text: r.text?.text ?? r.originalText?.text ?? '',
    relativePublishTimeDescription: r.relativePublishTimeDescription ?? null,
    publishTime: r.publishTime ?? null,
    author: {
      displayName: r.authorAttribution?.displayName ?? 'Anonymous',
      photoUri: r.authorAttribution?.photoUri ?? null,
      uri: r.authorAttribution?.uri ?? null,
    },
  })),
}

await mkdir(dirname(OUT_PATH), { recursive: true })
await writeFile(OUT_PATH, JSON.stringify(payload, null, 2))

console.log(
  `[fetch-reviews] Wrote ${payload.reviews.length} reviews for "${payload.displayName}" → ${OUT_PATH}`,
)
