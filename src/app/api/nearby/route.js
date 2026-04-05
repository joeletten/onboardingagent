export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const name = searchParams.get('name') // property name to exclude from results

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 })
  }

  try {
    let latitude = parseFloat(lat)
    let longitude = parseFloat(lng)

    // If no lat/lng provided but we have a placeId, look it up
    if ((!latitude || !longitude) && placeId) {
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
      detailsUrl.searchParams.set('place_id', placeId)
      detailsUrl.searchParams.set('fields', 'geometry')
      detailsUrl.searchParams.set('key', apiKey)

      const detailsRes = await fetch(detailsUrl.toString())
      const detailsJson = await detailsRes.json()

      if (detailsJson.result?.geometry?.location) {
        latitude = detailsJson.result.geometry.location.lat
        longitude = detailsJson.result.geometry.location.lng
      }
    }

    if (!latitude || !longitude) {
      return Response.json({ error: 'Could not determine property location' }, { status: 400 })
    }

    // Nearby Search — find lodging within 5km radius
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${latitude},${longitude}`)
    url.searchParams.set('radius', '5000')
    url.searchParams.set('type', 'lodging')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString())
    const json = await res.json()

    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
      return Response.json({ error: json.error_message || json.status }, { status: 502 })
    }

    const propertyName = (name || '').toLowerCase()

    const results = (json.results || [])
      // Exclude the user's own property
      .filter(place => place.name.toLowerCase() !== propertyName)
      // Sort by rating (highest first) as a proxy for relevance
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8)
      .map(place => {
        const address = place.vicinity || place.formatted_address || ''

        // Approximate distance from the property
        const dLat = (place.geometry.location.lat - latitude) * 111.32
        const dLng = (place.geometry.location.lng - longitude) * 111.32 * Math.cos(latitude * Math.PI / 180)
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng)

        return {
          id: place.place_id,
          name: place.name,
          address,
          dist: distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)} km`,
        }
      })

    return Response.json(results)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
