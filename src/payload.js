/**
 * Onboarding Payload Builder
 *
 * Transforms raw onboarding context data into a clean, backend-ready JSON payload.
 * This is the source of truth submitted to the backend on completion, and used by
 * the AI agent to understand what has and hasn't been collected.
 */

// ── Payload builder ───────────────────────────────────────────────────────────

export function buildPayload(data, steps, currentStep) {
  // Merge OTAs from both channelConnect and otas steps, deduplicating by id
  const connectedChannelIds = new Set(
    (data.channelConnect || []).filter(c => c.connected).map(c => c.id)
  )
  const allOtas = [
    ...(data.channelConnect || [])
      .filter(c => c.connected)
      .map(c => ({ id: c.id, name: c.name })),
    ...(data.otas || [])
      .filter(o => o.connected && !connectedChannelIds.has(o.id))
      .map(o => ({ id: o.id, name: o.name })),
  ]

  const hotelDetails = data.settings?.hotelDetails || {}
  const contact      = data.settings?.contact      || {}
  const localization = data.settings?.localization || {}

  const completedSteps = steps.slice(0, currentStep).map(s => s.id)
  const totalSteps     = steps.length - 1 // exclude the "complete" step
  const completionPct  = Math.round((Math.min(currentStep, totalSteps) / totalSteps) * 100)

  return {
    _meta: {
      schema_version: '1.0.0',
      status: currentStep >= steps.length - 1 ? 'complete' : 'in_progress',
      current_step: steps[currentStep]?.id ?? null,
      completed_steps: completedSteps,
      completion_pct: completionPct,
    },

    user: {
      name: data.name || null,
      role: data.role || null,
    },

    property: {
      name:          hotelDetails.name    || data.property?.name    || null,
      address:       hotelDetails.address || data.property?.address || null,
      country:       hotelDetails.country || data.property?.country || null,
      star_rating:   data.property?.stars ?? null,
      check_in_time:  hotelDetails.checkIn  || null,
      check_out_time: hotelDetails.checkOut || null,
    },

    contact: {
      name:    contact.contactName || null,
      phone:   contact.phone       || null,
      email:   contact.email       || null,
      website: contact.website     || null,
    },

    localization: {
      currency: localization.currency || null,
      timezone: localization.timezone || null,
      vat_rate: localization.vatRate  ?? null,
    },

    pms: data.pms
      ? { id: data.pms.id, name: data.pms.name, connected: true }
      : null,

    channels: {
      direct_booking: { enabled: true },
      otas: allOtas,
    },

    room_types: (data.rooms || []).map(r => ({
      id:                  String(r.id),
      name:                r.name || null,
      count:               parseInt(r.count) || null,
      is_base_room:        Boolean(r.isBase),
      base_rate_reference: r.isBase ? (parseFloat(r.baseRate) || null) : null,
      price_offset:        !r.isBase ? {
        direction: r.offsetDirection || '+',
        value:     parseFloat(r.offsetValue) || null,
        type:      r.offsetType || 'percentage',
      } : null,
      guests: {
        default: parseInt(r.defaultGuests) || null,
        min:     parseInt(r.minGuests)     || null,
        max:     parseInt(r.maxGuests)     || null,
        max_children: parseInt(r.maxKids)   || null,
        max_babies:   parseInt(r.maxBabies) || null,
      },
      bookable_online: r.bookableOnline !== false,
    })),

    extras: (data.extras || []).map(e => ({
      id:                  String(e.id),
      name:                e.name || null,
      type:                e.itemType,
      price:               e.itemType !== 'discount' ? (parseFloat(e.price) || null) : null,
      discount_percentage: e.itemType === 'discount'  ? (parseFloat(e.percentage) || null) : null,
      vat_rate_pct:        e.itemType !== 'discount' ? (parseFloat(e.vatRate) || null) : null,
      charge_basis:        e.itemType !== 'discount' ? (e.chargeBasis || null) : null,
      channels:            e.channels    || 'all',
      availability:        e.availability || 'always',
      availability_from:   e.availability === 'custom' ? (e.customFrom || null) : null,
      availability_to:     e.availability === 'custom' ? (e.customTo   || null) : null,
    })),

    rate_plans: (data.ratePlans || []).map(p => ({
      id:                 String(p.id),
      name:               p.name || null,
      type:               p.type,
      parent_rate_plan_id: p.type === 'derived' ? (String(p.parentId) || null) : null,
      floor_price:        p.type === 'root' ? (parseFloat(p.floorPrice) || null) : null,
      price_offset:       p.type === 'derived' ? {
        direction: p.offsetDirection || '+',
        value:     parseFloat(p.offsetValue) || null,
        type:      p.offsetType || 'percentage',
      } : null,
      channel_availability: p.channels || 'all',
      room_type_ids:        (p.roomIds  || []).map(String),
      extra_ids:            (p.extraIds || []).map(String),
    })),

    distribution: Object.entries(data.distribution || {}).map(([channelId, plans]) => ({
      channel_id: channelId,
      assignments: Object.entries(plans).map(([planId, roomIds]) => ({
        rate_plan_id:  String(planId),
        room_type_ids: (roomIds || []).map(String),
      })),
    })),

    competitors: (data.competitors || []).map(c => ({
      id:          String(c.id),
      name:        c.name  || null,
      star_rating: c.stars ?? null,
      distance_km: parseFloat(c.dist) || null,
    })),
  }
}

// ── Missing fields checker ────────────────────────────────────────────────────

/**
 * Returns an array of missing fields.
 * Each entry: { path, label, required: true | false }
 * required = true  → blocks submission
 * required = false → recommended but not blocking
 */
export function getMissingFields(payload) {
  const missing = []

  const req  = (path, label) => missing.push({ path, label, required: true })
  const rec  = (path, label) => missing.push({ path, label, required: false })

  // ── Required ──────────────────────────────────────────────────────────────
  if (!payload.user.name)              req('user.name',              'Your name')
  if (!payload.user.role)              req('user.role',              'Your role')
  if (!payload.property.name)          req('property.name',          'Property name')
  if (!payload.localization.currency)  req('localization.currency',  'Currency')
  if (payload.room_types.length === 0) req('room_types',             'At least one room type')

  // ── Recommended ───────────────────────────────────────────────────────────
  if (!payload.property.country)           rec('property.country',          'Property country')
  if (!payload.property.star_rating)       rec('property.star_rating',      'Star rating')
  if (!payload.localization.timezone)      rec('localization.timezone',      'Timezone')
  if (!payload.localization.vat_rate)      rec('localization.vat_rate',      'Default VAT rate')
  if (!payload.contact.email)              rec('contact.email',              'Contact email')
  if (!payload.pms)                        rec('pms',                        'PMS connection')
  if (payload.channels.otas.length === 0)  rec('channels.otas',              'OTA channels')
  if (payload.extras.length === 0)         rec('extras',                     'Extras & fees')
  if (payload.rate_plans.length === 0)     rec('rate_plans',                 'Rate plans')
  if (payload.distribution.length === 0)   rec('distribution',               'Distribution matrix')
  if (payload.competitors.length === 0)    rec('competitors',                'Competitors')

  return missing
}
