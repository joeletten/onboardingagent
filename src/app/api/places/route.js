export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return Response.json([])
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 })
  }

  try {
    // Text Search — finds hotels matching the query
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', query + ' hotel')
    url.searchParams.set('type', 'lodging')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString())
    const json = await res.json()

    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
      return Response.json({ error: json.error_message || json.status }, { status: 502 })
    }

    const results = (json.results || []).slice(0, 6).map(place => {
      // Extract city and country from address_components if available
      const address = place.formatted_address || ''
      const parts = address.split(',').map(s => s.trim())
      const country = parts[parts.length - 1] || ''
      const city    = parts[parts.length - 2] || ''

      return {
        id:      place.place_id,
        name:    place.name,
        address: address.replace(`, ${country}`, '').trim(),
        city,
        country,
        placeId: place.place_id,
      }
    })

    return Response.json(results)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
