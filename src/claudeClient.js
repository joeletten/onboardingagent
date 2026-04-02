// ── Tools ─────────────────────────────────────────────────────────────────────

export const TOOLS = [
  // ── Navigation ──────────────────────────────────────────────────────────────
  {
    name: 'advance_step',
    description: `Move the user to the next onboarding step.
Use this when:
- The user explicitly says they are done, ready to continue, or wants to move on
- You have just collected and saved all required information for the current step
- The user says "skip", "next", "continue", or similar
Do NOT use this automatically after adding a single item — only advance when the step feels genuinely complete.`,
    input_schema: { type: 'object', properties: {} },
  },

  // ── User identity ────────────────────────────────────────────────────────────
  {
    name: 'set_user_info',
    description: 'Save the user\'s name and/or role. Call this as soon as the user provides either.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'First name or full name of the person doing onboarding' },
        role: { type: 'string', description: 'Their role at the property (e.g. General Manager, Owner, Revenue Manager, Front Office Manager)' },
      },
    },
  },

  // ── Property & settings ───────────────────────────────────────────────────────
  {
    name: 'set_property_info',
    description: `Save property details, contact info, and/or localization settings. Call this whenever the user provides any of these details. You can pass only the fields you have — omit fields you don't know yet.`,
    input_schema: {
      type: 'object',
      properties: {
        // Hotel details
        name:        { type: 'string', description: 'Hotel/property name' },
        address:     { type: 'string', description: 'Street address' },
        country:     { type: 'string', description: 'Country name' },
        checkIn:     { type: 'string', description: 'Default check-in time, e.g. "15:00"' },
        checkOut:    { type: 'string', description: 'Default check-out time, e.g. "11:00"' },
        stars:       { type: 'number', description: 'Star rating 1-5' },
        totalRooms:  { type: 'number', description: 'Total number of rooms in the property' },
        market:      { type: 'string', description: 'City or market name for comp-set purposes' },
        // Contact
        contactName: { type: 'string', description: 'Name of the contact person' },
        phone:       { type: 'string', description: 'Contact phone number' },
        email:       { type: 'string', description: 'Contact email address' },
        website:     { type: 'string', description: 'Property website URL' },
        // Localization
        currency:    { type: 'string', description: 'ISO currency code, e.g. EUR, GBP, USD' },
        timezone:    { type: 'string', description: 'IANA timezone, e.g. Europe/Amsterdam' },
        vatRate:     { type: 'number', description: 'Default VAT/tax rate as a percentage, e.g. 10' },
      },
    },
  },

  // ── Rate plans ───────────────────────────────────────────────────────────────
  {
    name: 'add_rate_plan',
    description: 'Add a rate plan. Root plans have their own floor price; derived plans are offset from a parent plan.',
    input_schema: {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name:            { type: 'string', description: 'Rate plan name, e.g. "Flexible Rate", "Non-Refundable"' },
        type:            { type: 'string', enum: ['root', 'derived'], description: '"root" = standalone rate, "derived" = offset from a parent' },
        floorPrice:      { type: 'number', description: 'Minimum sellable rate (root plans only)' },
        parentName:      { type: 'string', description: 'Name of the parent rate plan (derived plans only)' },
        offsetDirection: { type: 'string', enum: ['+', '-'], description: 'Whether derived plan is higher or lower than parent' },
        offsetType:      { type: 'string', enum: ['percentage', 'fixed'], description: 'Percentage or fixed amount offset' },
        offsetValue:     { type: 'number', description: 'Offset amount' },
        channels:        { type: 'string', enum: ['all', 'direct'], description: 'Which channels this plan is available on' },
      },
    },
  },
  {
    name: 'update_rate_plan',
    description: 'Update fields on an existing rate plan.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name:            { type: 'string', description: 'Current name to match (partial OK)' },
        newName:         { type: 'string' },
        floorPrice:      { type: 'number' },
        offsetDirection: { type: 'string', enum: ['+', '-'] },
        offsetType:      { type: 'string', enum: ['percentage', 'fixed'] },
        offsetValue:     { type: 'number' },
        channels:        { type: 'string', enum: ['all', 'direct'] },
      },
    },
  },
  {
    name: 'remove_rate_plan',
    description: 'Remove a rate plan by name.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string', description: 'Partial match is fine' } },
    },
  },

  // ── Distribution ─────────────────────────────────────────────────────────────
  {
    name: 'set_distribution',
    description: 'Set which rate plans are published on which channel, optionally scoped to specific room types. Use this when the user specifies distribution assignments.',
    input_schema: {
      type: 'object',
      required: ['channelId', 'ratePlanName'],
      properties: {
        channelId:     { type: 'string', description: 'Channel identifier, e.g. "direct", "booking_com", "expedia"' },
        ratePlanName:  { type: 'string', description: 'Name of the rate plan to assign (partial match OK)' },
        roomTypeNames: { type: 'array', items: { type: 'string' }, description: 'Room type names to assign. If omitted, applies to all room types.' },
        enabled:       { type: 'boolean', description: 'true to publish, false to unpublish. Defaults to true.' },
      },
    },
  },

  // ── Extras / fees / discounts ────────────────────────────────────────────────
  {
    name: 'add_extra',
    description: 'Add an extra service, fee, or discount to the property.',
    input_schema: {
      type: 'object',
      required: ['itemType', 'name', 'channels', 'availability'],
      properties: {
        itemType:    { type: 'string', enum: ['extra', 'fee', 'discount'], description: 'extra = optional add-on, fee = mandatory charge, discount = % reduction' },
        name:        { type: 'string' },
        price:       { type: 'number', description: 'In property currency. Required for extras and fees.' },
        vatRate:     { type: 'number', description: 'VAT percentage. Default 10 for extras, 20 for fees.' },
        chargeBasis: { type: 'string', enum: ['per_room_night', 'per_room_stay', 'per_person_night', 'per_person_stay'], description: 'Required for extras and fees.' },
        percentage:  { type: 'number', description: 'Discount %, 1-100. Required for discounts.' },
        channels:    { type: 'string', enum: ['all', 'direct'] },
        availability:{ type: 'string', enum: ['always', 'season', 'custom'] },
        customFrom:  { type: 'string', description: 'YYYY-MM-DD, only for custom availability' },
        customTo:    { type: 'string', description: 'YYYY-MM-DD, only for custom availability' },
      },
    },
  },
  {
    name: 'remove_extra',
    description: 'Remove an extra, fee, or discount by name.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string', description: 'Partial match is fine' } },
    },
  },
  {
    name: 'update_extra',
    description: 'Update any field on an existing extra, fee, or discount.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name:        { type: 'string', description: 'Current name to match (partial OK)' },
        newName:     { type: 'string' },
        price:       { type: 'number' },
        vatRate:     { type: 'number' },
        chargeBasis: { type: 'string', enum: ['per_room_night', 'per_room_stay', 'per_person_night', 'per_person_stay'] },
        percentage:  { type: 'number' },
        channels:    { type: 'string', enum: ['all', 'direct'] },
        availability:{ type: 'string', enum: ['always', 'season', 'custom'] },
        customFrom:  { type: 'string' },
        customTo:    { type: 'string' },
      },
    },
  },

  // ── Rooms ────────────────────────────────────────────────────────────────────
  {
    name: 'add_room',
    description: `Add a room type. The FIRST room added automatically becomes the base room.
All subsequent rooms need offsetDirection, offsetType, and offsetValue relative to the base.`,
    input_schema: {
      type: 'object',
      required: ['name', 'count'],
      properties: {
        name:            { type: 'string', description: 'e.g. "Standard Double", "Deluxe King"' },
        count:           { type: 'number', description: 'Number of rooms of this type' },
        baseRate:        { type: 'number', description: 'Reference rate in property currency (for the base room only)' },
        offsetDirection: { type: 'string', enum: ['+', '-'], description: 'For non-base rooms: price direction vs base' },
        offsetType:      { type: 'string', enum: ['percentage', 'fixed'], description: 'Percentage or fixed amount' },
        offsetValue:     { type: 'number', description: 'Amount of offset (e.g. 20 for 20% or €20)' },
        defaultGuests:   { type: 'number' },
        minGuests:       { type: 'number' },
        maxGuests:       { type: 'number' },
        maxKids:         { type: 'number' },
        maxBabies:       { type: 'number' },
        bookableOnline:  { type: 'boolean' },
      },
    },
  },
  {
    name: 'remove_room',
    description: 'Remove a room type by name.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string' } },
    },
  },
  {
    name: 'update_room',
    description: 'Update fields on an existing room type.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name:            { type: 'string', description: 'Current name to match' },
        newName:         { type: 'string' },
        count:           { type: 'number' },
        baseRate:        { type: 'number' },
        offsetDirection: { type: 'string', enum: ['+', '-'] },
        offsetType:      { type: 'string', enum: ['percentage', 'fixed'] },
        offsetValue:     { type: 'number' },
        defaultGuests:   { type: 'number' },
        maxGuests:       { type: 'number' },
        maxKids:         { type: 'number' },
        maxBabies:       { type: 'number' },
        bookableOnline:  { type: 'boolean' },
      },
    },
  },

  // ── Competitors ──────────────────────────────────────────────────────────────
  {
    name: 'add_competitor',
    description: 'Add a competitor hotel to the tracking list.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name:  { type: 'string', description: 'Hotel name' },
        city:  { type: 'string' },
        stars: { type: 'number' },
      },
    },
  },
  {
    name: 'remove_competitor',
    description: 'Remove a competitor hotel by name.',
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string' } },
    },
  },

  // ── PMS & channels ───────────────────────────────────────────────────────────
  {
    name: 'set_pms',
    description: `Mark a PMS as connected. Use when the user tells you which PMS they use.
Known PMS options: Mews, Cloudbeds, Opera Cloud. For any other, use the exact name they give.`,
    input_schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: 'PMS name' },
      },
    },
  },
  {
    name: 'connect_channel',
    description: 'Mark a distribution channel as connected.',
    input_schema: {
      type: 'object',
      required: ['channelName'],
      properties: {
        channelName: { type: 'string', description: 'e.g. "Booking.com", "Expedia Group", "Airbnb"' },
        stepKey: {
          type: 'string',
          enum: ['channelConnect', 'ota'],
          description: '"channelConnect" for the Connect Channels step, "ota" for the Channels distribution step',
        },
      },
    },
  },
]

// ── System prompt ─────────────────────────────────────────────────────────────

export function buildSystemPrompt(data, currentStep, allSteps) {
  const property  = data.settings?.hotelDetails || data.property || {}
  const loc       = data.settings?.localization  || {}
  const rooms     = data.rooms     || []
  const extras    = data.extras    || []
  const otas      = data.otas      || []
  const comps     = data.competitors || []
  const channels  = data.channelConnect || []
  const currency  = loc.currency || 'EUR'
  const sym       = { EUR: '€', GBP: '£', USD: '$', CHF: 'Fr.', SEK: 'kr', NOK: 'kr', DKK: 'kr' }[currency] || currency

  const propName    = property.name  || data.property?.name
  const totalRooms  = property.rooms || data.property?.rooms
  const stars       = property.stars || data.property?.stars
  const market      = loc.market

  const connectedChannels = [
    ...channels.filter(c => c.connected).map(c => c.name),
    ...otas.filter(o => o.connected).map(o => o.name),
  ]

  // ── Gap analysis: one line per piece of information ──────────────────────────
  const lines = []

  // Helper to mark items
  const done    = (label) => `  ✅ ${label}`
  const missing = (label) => `  ❌ ${label}`
  const partial = (label) => `  ⚠️  ${label}`

  // Welcome
  lines.push('### Identity')
  lines.push(data.name ? done(`Name: "${data.name}"`) : missing('Name not provided'))
  lines.push(data.role ? done(`Role: "${data.role}"`) : missing('Role not provided'))

  // Property
  lines.push('\n### Property')
  lines.push(propName   ? done(`Hotel name: ${propName}`) : missing('Hotel name unknown'))
  lines.push(totalRooms ? done(`Total rooms: ${totalRooms}`) : missing('Total room count unknown'))
  lines.push(stars      ? done(`Star rating: ${stars}★`)  : missing('Star rating not set'))
  lines.push(market     ? done(`Market/city: ${market}`)  : missing('Market/city not set'))
  lines.push(           done(`Currency: ${currency}`))

  // PMS
  lines.push('\n### PMS')
  lines.push(data.pms?.connected
    ? done(`PMS: ${data.pms.name} (connected)`)
    : missing('No PMS connected (manual room setup)'))

  // Channels
  lines.push('\n### Distribution channels connected')
  if (connectedChannels.length > 0) {
    connectedChannels.forEach(c => lines.push(done(c)))
  } else {
    lines.push(missing('No channels connected yet'))
  }

  // Rooms
  lines.push('\n### Room types')
  if (rooms.length === 0) {
    lines.push(missing('No room types configured — this is required'))
  } else {
    rooms.forEach(r => {
      const pricing = r.isBase
        ? `base, ref ${sym}${r.baseRate || '?'}`
        : `${r.offsetDirection || '+'}${r.offsetValue || '?'}${r.offsetType === 'percentage' ? '%' : sym} vs base`
      lines.push(done(`${r.name}: ${r.count} rooms, ${pricing}, max ${r.maxGuests || 2} guests`))
    })
    // Check for base room missing rate
    const base = rooms.find(r => r.isBase)
    if (base && !base.baseRate) lines.push(partial('Base room has no reference rate set'))
    // Check non-base rooms missing offsets
    const missingOffset = rooms.filter(r => !r.isBase && !r.offsetValue)
    if (missingOffset.length > 0) lines.push(partial(`${missingOffset.map(r => r.name).join(', ')} missing price offset`))
  }

  // Extras
  lines.push('\n### Extras, fees & discounts')
  if (extras.length === 0) {
    lines.push(partial('None added yet (optional but recommended for completeness)'))
    lines.push(partial('Common items: Breakfast, Cleaning fee, Early check-in, Late check-out, Parking, Cot rental'))
  } else {
    extras.forEach(e => {
      if (e.itemType === 'discount') {
        lines.push(done(`${e.name}: ${e.percentage}% off, ${e.channels === 'direct' ? 'direct only' : 'all channels'}, ${e.availability}`))
      } else {
        lines.push(done(`${e.name} (${e.itemType}): ${sym}${e.price} ${(e.chargeBasis || '').replace(/_/g, ' ')}, ${e.vatRate}% VAT, ${e.channels === 'direct' ? 'direct only' : 'all channels'}`))
      }
    })
  }

  // Competitors
  lines.push('\n### Competitors')
  if (comps.length === 0) {
    lines.push(partial('None added — recommend 3-5 direct competitors'))
  } else {
    comps.forEach(c => lines.push(done(c.name || JSON.stringify(c))))
  }

  // Current step
  const stepLabel   = currentStep?.label || 'Unknown'
  const stepId      = currentStep?.id    || ''
  const stepIndex   = allSteps ? allSteps.findIndex(s => s.id === stepId) : -1
  const totalSteps  = allSteps ? allSteps.length - 1 : '?'

  // Step-specific guidance
  const stepGuidance = {
    welcome:        'Ask for the user\'s name if not already provided. Use set_user_info to save it immediately when they provide it.',
    role:           'Ask what their role is at the hotel (e.g. General Manager, Revenue Manager, Owner). Use set_user_info to save it immediately.',
    property:       'Make sure we have hotel name, total rooms, star rating, city/market, currency, and timezone. Use set_property_info as soon as they give you any of these details.',
    channelConnect: 'Help the user connect Booking.com and/or Expedia. Use connect_channel if they tell you which they use.',
    pms:            'Ask which PMS they use. Use set_pms when they tell you. If they don\'t have one, that\'s fine.',
    rooms:          'Help set up all room types. We need at least 1. The first one is the base room (needs a reference rate). Others are priced relative to it. If they mention room names, counts, or rates, use add_room immediately.',
    extras:         'Help add all extras, fees, and discounts. Common ones: Breakfast (per person/night), Cleaning fee (per stay), Early check-in, Late check-out, Parking, Pet fee. Use add_extra immediately when they describe one.',
    ratePlans:      'Help the user create rate plans. A root plan has its own floor price. Derived plans offset from a root. Use add_rate_plan for each they describe. Common plans: Flexible Rate, Non-Refundable (10-15% cheaper), Early Bird, Last Minute.',
    ota:            'Help connect distribution channels (Booking.com, Expedia, Airbnb, Agoda). Use connect_channel for each they confirm.',
    distribution:   'Help the user assign rate plans to channels. Use set_distribution for each assignment. Ask which plans should be visible on which channels.',
    competitors:    'Ask which hotels they compete with directly. Aim for 3-5. Use add_competitor for each they name.',
    complete:       'Onboarding is done! Summarise what was set up and congratulate them.',
  }[stepId] || 'Help the user complete this step.'

  return `You are Joel, the friendly onboarding assistant for Lighthouse — a hotel revenue management and market intelligence platform. You are having a live conversation with ${data.name || 'a hotelier'} to complete their property setup.

## Onboarding progress (step ${stepIndex + 1} of ${totalSteps}: ${stepLabel})

${lines.join('\n')}

---

## Your focus right now: "${stepLabel}"

${stepGuidance}

---

## How to behave

**Be proactive and conversational.** Don't wait for the user to volunteer everything — ask specific questions about what's missing for the current step. When they answer, immediately use the appropriate tool to save it, then either ask the next question or (if the step is complete) invite them to continue.

**Ask before acting if details are missing.** If a tool needs specific information you don't yet have (e.g., you need a room name AND count to add a room, a price to add an extra, or an email to set contact info), ask for exactly what's missing in one clear question before calling the tool. Once you have all required fields, execute immediately.

**Act first, confirm briefly.** When the user provides enough information, use the tool right away. No need to ask "are you sure?" — just do it and confirm in one sentence.

**Drive completeness.** After filling in the current step, if something else is clearly missing (e.g. no competitors, no breakfast extra), mention it gently in one sentence. Don't overwhelm — one gap at a time.

**Advance the flow.** When the current step is complete or the user says "next", "continue", "done", "skip", or similar — call advance_step. This moves the UI to the next step.

**Be concise and warm.** 2–4 sentences max unless they ask for more. Use first person. Skip filler phrases like "Certainly!" or "Great question!".

**Full context awareness.** You can see everything that's been set up. Reference it naturally — "I see you've connected Booking.com already" or "Since you have 3 room types, you might want a cleaning fee per stay".`
}

// ── API call ──────────────────────────────────────────────────────────────────

export async function callClaude(messages, data, currentStep, allSteps) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(data, currentStep, allSteps),
      tools: TOOLS,
      messages,
    }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`)
  return json
}

// ── Tool execution ────────────────────────────────────────────────────────────
// Pure function — returns { data, result, sideEffect? }
// sideEffect: 'advance_step' tells Chat.jsx to call nextStep()

export function executeTool(name, input, currentData) {
  const d = {
    ...currentData,
    extras:      [...(currentData.extras      || [])],
    rooms:       [...(currentData.rooms       || [])],
    competitors: [...(currentData.competitors || [])],
    channelConnect: [...(currentData.channelConnect || [])],
    otas:        [...(currentData.otas        || [])],
  }

  switch (name) {

    // ── Navigation ──────────────────────────────────────────────────────────
    case 'advance_step':
      return { data: d, result: { success: true, message: 'Advancing to next step' }, sideEffect: 'advance_step' }

    // ── User identity ────────────────────────────────────────────────────────
    case 'set_user_info': {
      if (input.name != null) d.name = input.name
      if (input.role != null) d.role = input.role
      const parts = []
      if (input.name) parts.push(`name: "${input.name}"`)
      if (input.role) parts.push(`role: "${input.role}"`)
      return { data: d, result: { success: true, message: `Saved ${parts.join(', ')}` } }
    }

    // ── Property & settings ──────────────────────────────────────────────────
    case 'set_property_info': {
      // Merge into data.property for legacy reads
      const existingProperty = d.property || {}
      const updatedProperty = { ...existingProperty }
      if (input.name       != null) updatedProperty.name    = input.name
      if (input.address    != null) updatedProperty.address = input.address
      if (input.country    != null) updatedProperty.country = input.country
      if (input.stars      != null) updatedProperty.stars   = input.stars
      if (input.totalRooms != null) updatedProperty.rooms   = input.totalRooms
      if (input.market     != null) updatedProperty.city    = input.market
      d.property = updatedProperty

      // Also merge into data.settings (which is the canonical source for payload.js)
      const existingSettings = d.settings || {}
      const hotelDetails = { ...(existingSettings.hotelDetails || {}) }
      const contact      = { ...(existingSettings.contact      || {}) }
      const localization = { ...(existingSettings.localization || {}) }

      if (input.name     != null) hotelDetails.name     = input.name
      if (input.address  != null) hotelDetails.address  = input.address
      if (input.country  != null) hotelDetails.country  = input.country
      if (input.checkIn  != null) hotelDetails.checkIn  = input.checkIn
      if (input.checkOut != null) hotelDetails.checkOut = input.checkOut

      if (input.contactName != null) contact.contactName = input.contactName
      if (input.phone       != null) contact.phone       = input.phone
      if (input.email       != null) contact.email       = input.email
      if (input.website     != null) contact.website     = input.website

      if (input.currency != null) localization.currency = input.currency
      if (input.timezone != null) localization.timezone = input.timezone
      if (input.vatRate  != null) localization.vatRate  = String(input.vatRate)

      d.settings = { hotelDetails, contact, localization }
      return { data: d, result: { success: true, message: `Property info updated` } }
    }

    // ── Rate plans ───────────────────────────────────────────────────────────
    case 'add_rate_plan': {
      const ratePlans = [...(d.ratePlans || [])]
      let parentId = null
      if (input.parentName) {
        const parent = ratePlans.find(p => p.name.toLowerCase().includes(input.parentName.toLowerCase()))
        parentId = parent ? parent.id : null
      }
      const plan = {
        id:              Date.now() + Math.random(),
        name:            input.name,
        type:            input.type || 'root',
        floorPrice:      input.floorPrice  != null ? String(input.floorPrice)  : '',
        parentId:        parentId,
        offsetDirection: input.offsetDirection || '-',
        offsetType:      input.offsetType || 'percentage',
        offsetValue:     input.offsetValue != null ? String(input.offsetValue) : '',
        channels:        input.channels || 'all',
        roomIds:         [],
        extraIds:        [],
      }
      ratePlans.push(plan)
      d.ratePlans = ratePlans
      return { data: d, result: { success: true, message: `Added rate plan "${plan.name}"` } }
    }

    case 'update_rate_plan': {
      const ratePlans = [...(d.ratePlans || [])]
      const idx = ratePlans.findIndex(p => p.name.toLowerCase().includes(input.name.toLowerCase()))
      if (idx === -1) return { data: d, result: { success: false, message: `No rate plan matching "${input.name}"` } }
      const u = { ...ratePlans[idx] }
      if (input.newName        != null) u.name           = input.newName
      if (input.floorPrice     != null) u.floorPrice     = String(input.floorPrice)
      if (input.offsetDirection)        u.offsetDirection = input.offsetDirection
      if (input.offsetType)             u.offsetType     = input.offsetType
      if (input.offsetValue    != null) u.offsetValue    = String(input.offsetValue)
      if (input.channels)               u.channels       = input.channels
      ratePlans[idx] = u
      d.ratePlans = ratePlans
      return { data: d, result: { success: true, message: `Updated rate plan "${u.name}"` } }
    }

    case 'remove_rate_plan': {
      const ratePlans = [...(d.ratePlans || [])]
      const idx = ratePlans.findIndex(p => p.name.toLowerCase().includes(input.name.toLowerCase()))
      if (idx === -1) return { data: d, result: { success: false, message: `No rate plan matching "${input.name}"` } }
      const [rem] = ratePlans.splice(idx, 1)
      d.ratePlans = ratePlans
      return { data: d, result: { success: true, message: `Removed rate plan "${rem.name}"` } }
    }

    // ── Distribution ─────────────────────────────────────────────────────────
    case 'set_distribution': {
      const dist = { ...(d.distribution || {}) }
      const channelId = input.channelId
      const enabled   = input.enabled !== false

      // Find the matching rate plan
      const ratePlans = d.ratePlans || []
      const plan = ratePlans.find(p => p.name.toLowerCase().includes(input.ratePlanName.toLowerCase()))
      if (!plan) return { data: d, result: { success: false, message: `No rate plan matching "${input.ratePlanName}"` } }

      // Find matching room type ids
      const rooms = d.rooms || []
      let roomIds
      if (input.roomTypeNames && input.roomTypeNames.length > 0) {
        roomIds = rooms
          .filter(r => input.roomTypeNames.some(n => r.name.toLowerCase().includes(n.toLowerCase())))
          .map(r => String(r.id))
      } else {
        roomIds = rooms.map(r => String(r.id))
      }

      if (!dist[channelId]) dist[channelId] = {}
      if (enabled) {
        dist[channelId][String(plan.id)] = roomIds
      } else {
        delete dist[channelId][String(plan.id)]
      }
      d.distribution = dist
      return { data: d, result: { success: true, message: `Distribution updated for ${channelId}` } }
    }

    // ── Extras ──────────────────────────────────────────────────────────────
    case 'add_extra': {
      const item = {
        itemType:    input.itemType,
        name:        input.name,
        channels:    input.channels    || 'all',
        availability:input.availability|| 'always',
        customFrom:  input.customFrom  || '',
        customTo:    input.customTo    || '',
        price:       input.price   != null ? String(input.price)   : '',
        vatRate:     input.vatRate != null ? Number(input.vatRate) : 10,
        chargeBasis: input.chargeBasis || 'per_room_night',
        percentage:  input.percentage  != null ? String(input.percentage) : '',
        id: Date.now() + Math.random(),
      }
      d.extras.push(item)
      return { data: d, result: { success: true, message: `Added "${item.name}"` } }
    }

    case 'remove_extra': {
      const idx = d.extras.findIndex(e => e.name.toLowerCase().includes(input.name.toLowerCase()))
      if (idx === -1) return { data: d, result: { success: false, message: `No item matching "${input.name}"` } }
      const [rem] = d.extras.splice(idx, 1)
      return { data: d, result: { success: true, message: `Removed "${rem.name}"` } }
    }

    case 'update_extra': {
      const idx = d.extras.findIndex(e => e.name.toLowerCase().includes(input.name.toLowerCase()))
      if (idx === -1) return { data: d, result: { success: false, message: `No item matching "${input.name}"` } }
      const u = { ...d.extras[idx] }
      if (input.newName    != null) u.name        = input.newName
      if (input.price      != null) u.price       = String(input.price)
      if (input.vatRate    != null) u.vatRate      = Number(input.vatRate)
      if (input.chargeBasis)        u.chargeBasis  = input.chargeBasis
      if (input.percentage != null) u.percentage   = String(input.percentage)
      if (input.channels)           u.channels     = input.channels
      if (input.availability)       u.availability = input.availability
      if (input.customFrom != null) u.customFrom   = input.customFrom
      if (input.customTo   != null) u.customTo     = input.customTo
      d.extras[idx] = u
      return { data: d, result: { success: true, message: `Updated "${u.name}"` } }
    }

    // ── Rooms ────────────────────────────────────────────────────────────────
    case 'add_room': {
      const isFirst = d.rooms.length === 0
      const room = {
        bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2,
        maxKids: 1, maxBabies: 1, offsetDirection: '+', offsetType: 'percentage',
        ...input,
        id:          Date.now() + Math.random(),
        isBase:      isFirst,
        count:       String(input.count),
        baseRate:    input.baseRate    != null ? String(input.baseRate)    : '',
        offsetValue: input.offsetValue != null ? String(input.offsetValue) : '',
      }
      d.rooms.push(room)
      return { data: d, result: { success: true, message: `Added room "${room.name}"` } }
    }

    case 'remove_room': {
      const idx = d.rooms.findIndex(r => r.name.toLowerCase().includes(input.name.toLowerCase()))
      if (idx === -1) return { data: d, result: { success: false, message: `No room matching "${input.name}"` } }
      const [rem] = d.rooms.splice(idx, 1)
      if (rem.isBase && d.rooms.length > 0) d.rooms[0] = { ...d.rooms[0], isBase: true }
      return { data: d, result: { success: true, message: `Removed "${rem.name}"` } }
    }

    case 'update_room': {
      const idx = d.rooms.findIndex(r => r.name.toLowerCase().includes(input.name.toLowerCase()))
      if (idx === -1) return { data: d, result: { success: false, message: `No room matching "${input.name}"` } }
      const u = { ...d.rooms[idx] }
      if (input.newName        != null) u.name           = input.newName
      if (input.count          != null) u.count          = String(input.count)
      if (input.baseRate       != null) u.baseRate       = String(input.baseRate)
      if (input.offsetDirection)        u.offsetDirection = input.offsetDirection
      if (input.offsetType)             u.offsetType     = input.offsetType
      if (input.offsetValue    != null) u.offsetValue    = String(input.offsetValue)
      if (input.defaultGuests  != null) u.defaultGuests  = input.defaultGuests
      if (input.maxGuests      != null) u.maxGuests      = input.maxGuests
      if (input.maxKids        != null) u.maxKids        = input.maxKids
      if (input.maxBabies      != null) u.maxBabies      = input.maxBabies
      if (input.bookableOnline != null) u.bookableOnline = input.bookableOnline
      d.rooms[idx] = u
      return { data: d, result: { success: true, message: `Updated "${u.name}"` } }
    }

    // ── Competitors ──────────────────────────────────────────────────────────
    case 'add_competitor': {
      const comp = { id: Date.now() + Math.random(), name: input.name, city: input.city || '', stars: input.stars || null }
      d.competitors.push(comp)
      return { data: d, result: { success: true, message: `Added competitor "${comp.name}"` } }
    }

    case 'remove_competitor': {
      const idx = d.competitors.findIndex(c => (c.name || '').toLowerCase().includes(input.name.toLowerCase()))
      if (idx === -1) return { data: d, result: { success: false, message: `No competitor matching "${input.name}"` } }
      const [rem] = d.competitors.splice(idx, 1)
      return { data: d, result: { success: true, message: `Removed "${rem.name}"` } }
    }

    // ── PMS ──────────────────────────────────────────────────────────────────
    case 'set_pms': {
      // Map common names to known IDs
      const idMap = { mews: 'mews', cloudbeds: 'cloudbeds', opera: 'opera', 'opera cloud': 'opera' }
      const id = idMap[input.name.toLowerCase()] || 'other'
      d.pms = { id, name: input.name, connected: true }
      return { data: d, result: { success: true, message: `Set PMS to ${input.name}` } }
    }

    // ── Channel connections ──────────────────────────────────────────────────
    case 'connect_channel': {
      const name = input.channelName
      const stepKey = input.stepKey || 'channelConnect'
      const lc = name.toLowerCase()

      if (stepKey === 'channelConnect') {
        // Update or append in channelConnect array
        const idx = d.channelConnect.findIndex(c => c.name.toLowerCase().includes(lc) || lc.includes(c.id))
        if (idx !== -1) {
          d.channelConnect[idx] = { ...d.channelConnect[idx], connected: true }
        } else {
          d.channelConnect.push({ id: lc.replace(/\s+/g, '_'), name, connected: true, brand: lc.split('.')[0] })
        }
      } else {
        // OTA step
        const idx = d.otas.findIndex(o => o.name.toLowerCase().includes(lc) || lc.includes(o.id))
        if (idx !== -1) {
          d.otas[idx] = { ...d.otas[idx], connected: true }
        } else {
          d.otas.push({ id: lc.replace(/\s+/g, '_'), name, connected: true })
        }
      }
      return { data: d, result: { success: true, message: `Marked ${name} as connected` } }
    }

    default:
      return { data: d, result: { success: false, message: `Unknown tool: ${name}` } }
  }
}
