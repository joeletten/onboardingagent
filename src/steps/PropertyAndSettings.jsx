'use client'

import React, { useState, useEffect, useRef } from 'react'
import { KompasMessage, InteractiveArea, PropertyCard, Button, Input, Select, Card } from '../ui'
import { useOnboarding } from '../OnboardingContext'

const COUNTRY_DEFAULTS = {
  Netherlands:      { timezone: 'Europe/Amsterdam', currency: 'EUR', vatRate: '9' },
  France:           { timezone: 'Europe/Paris',     currency: 'EUR', vatRate: '10' },
  Italy:            { timezone: 'Europe/Rome',      currency: 'EUR', vatRate: '10' },
  Spain:            { timezone: 'Europe/Madrid',    currency: 'EUR', vatRate: '10' },
  Austria:          { timezone: 'Europe/Vienna',    currency: 'EUR', vatRate: '10' },
  Switzerland:      { timezone: 'Europe/Zurich',    currency: 'CHF', vatRate: '3.8' },
  'United Kingdom': { timezone: 'Europe/London',    currency: 'GBP', vatRate: '20' },
  Greece:           { timezone: 'Europe/Athens',    currency: 'EUR', vatRate: '13' },
}

const TIMEZONES = [
  'Europe/Amsterdam', 'Europe/Athens', 'Europe/Berlin', 'Europe/Dublin',
  'Europe/Helsinki', 'Europe/Lisbon', 'Europe/London', 'Europe/Madrid',
  'Europe/Paris', 'Europe/Prague', 'Europe/Rome', 'Europe/Stockholm',
  'Europe/Vienna', 'Europe/Warsaw', 'Europe/Zurich',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'UTC',
].map(tz => ({ value: tz, label: tz }))

const CURRENCIES = ['EUR', 'GBP', 'CHF', 'USD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK']
  .map(c => ({ value: c, label: c }))

const TABS = [
  { id: 'hotel', label: 'Hotel Details' },
  { id: 'contact', label: 'Contact Details' },
  { id: 'localization', label: 'Regional Settings' },
]

export default function PropertyAndSettings() {
  const { data, setData, nextStep } = useOnboarding()

  // 'search' → user finds property; 'settings' → user fills in account details
  const [phase, setPhase] = useState(data.property ? 'settings' : 'search')

  // ── Property search ──────────────────────────────────────────────────────
  const [query, setQuery] = useState(data.property?.name || '')
  const [selected, setSelected] = useState(data.property || null)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSelect = (hotel) => {
    setSelected(hotel)
    setQuery(hotel.name)
    setShowResults(false)
  }

  const handleConfirmProperty = () => {
    if (!selected) return
    setData('property', selected)
    setHotelDetails(h => ({
      ...h,
      name:    selected.name    || h.name,
      address: selected.address || h.address,
      country: selected.country || h.country,
    }))
    const defaults = COUNTRY_DEFAULTS[selected.country] || { timezone: 'UTC', currency: 'EUR', vatRate: '10' }
    if (!data.settings?.localization) {
      setLocalization(defaults)
    }
    setPhase('settings')
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  const property = selected || data.property
  const countryDefaults = COUNTRY_DEFAULTS[property?.country] || { timezone: 'UTC', currency: 'EUR', vatRate: '10' }

  const [activeTab, setActiveTab] = useState('hotel')
  const [hotelDetails, setHotelDetails] = useState({
    name:    data.settings?.hotelDetails?.name    || property?.name    || '',
    address: data.settings?.hotelDetails?.address || property?.address || '',
    country: data.settings?.hotelDetails?.country || property?.country || '',
  })
  const [contact, setContact] = useState({
    contactName: data.settings?.contact?.contactName || '',
    phone:       data.settings?.contact?.phone       || '',
    email:       data.settings?.contact?.email       || '',
    website:     data.settings?.contact?.website     || '',
  })
  const [localization, setLocalization] = useState({
    timezone: data.settings?.localization?.timezone || countryDefaults.timezone,
    currency: data.settings?.localization?.currency || countryDefaults.currency,
    vatRate:  data.settings?.localization?.vatRate  || countryDefaults.vatRate,
  })

  const localizationFromCountry = !data.settings?.localization

  // When chat sets property info directly, switch from search phase to settings
  useEffect(() => {
    const chatSetProperty = data.property?.name || data.settings?.hotelDetails?.name
    if (chatSetProperty && phase === 'search') {
      if (data.property && !selected) setSelected(data.property)
      setPhase('settings')
    }
  }, [data.property?.name, data.settings?.hotelDetails?.name])

  // Keep forms in sync when chat updates context
  useEffect(() => {
    setHotelDetails({
      name:    data.settings?.hotelDetails?.name    || property?.name    || '',
      address: data.settings?.hotelDetails?.address || property?.address || '',
      country: data.settings?.hotelDetails?.country || property?.country || '',
    })
  }, [
    data.settings?.hotelDetails?.name,
    data.settings?.hotelDetails?.address,
    data.settings?.hotelDetails?.country,
  ])

  useEffect(() => {
    setContact({
      contactName: data.settings?.contact?.contactName || '',
      phone:       data.settings?.contact?.phone       || '',
      email:       data.settings?.contact?.email       || '',
      website:     data.settings?.contact?.website     || '',
    })
  }, [
    data.settings?.contact?.contactName,
    data.settings?.contact?.phone,
    data.settings?.contact?.email,
    data.settings?.contact?.website,
  ])

  useEffect(() => {
    if (!data.settings?.localization) return
    setLocalization({
      timezone: data.settings.localization.timezone || countryDefaults.timezone,
      currency: data.settings.localization.currency || countryDefaults.currency,
      vatRate:  data.settings.localization.vatRate  || countryDefaults.vatRate,
    })
  }, [
    data.settings?.localization?.timezone,
    data.settings?.localization?.currency,
    data.settings?.localization?.vatRate,
  ])

  const tabComplete = {
    hotel: !!(hotelDetails.name && hotelDetails.address && hotelDetails.country),
    contact: !!(contact.contactName && contact.email),
    localization: !!(localization.timezone && localization.currency),
  }

  const handleSave = () => {
    setData('settings', { hotelDetails, contact, localization })
    setTimeout(() => nextStep(), 300)
  }

  const roleGreeting = data.role === 'Owner'
    ? "Since you own the place, you know it best!"
    : `As the ${data.role}, you'll love having everything in one place.`

  return (
    <>
      {/* ── Phase 1: Property search ───────────────────────────────── */}
      <KompasMessage>
        <p>Great choice! {roleGreeting}</p>
        <p className="mt-2 text-[#52647a]">
          Let's start by finding your property. Search by hotel name, city, or country.
        </p>
      </KompasMessage>

      <InteractiveArea>
        {phase === 'search' ? (
          <div className="max-w-lg space-y-4">
            <div className="relative">
              <Input
                placeholder="Start typing your hotel name..."
                value={query}
                onChange={e => { setQuery(e.target.value); setShowResults(true); setSelected(null) }}
                onFocus={() => setShowResults(true)}
                autoFocus
                size="sm"
              />
              {showResults && searching && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e9ef] rounded-lg shadow-md z-20 p-4 flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-[#125fe3]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  <p className="text-[13px] text-[#a8b0bd]">Searching…</p>
                </div>
              )}
              {showResults && !searching && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e9ef] rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.10)] z-20 overflow-hidden">
                  {results.map((h, i) => (
                    <button
                      key={h.id || i}
                      onClick={() => handleSelect(h)}
                      className="w-full text-left px-4 py-3 hover:bg-[#f9fafb] transition-colors border-b border-[#e6e9ef] last:border-0"
                    >
                      <p className="text-[13px] font-semibold text-[#1f2124]">{h.name}</p>
                      <p className="text-[12px] text-[#a8b0bd]">{h.city}{h.city && h.country ? ', ' : ''}{h.country}{h.rating ? ` · ★ ${h.rating}` : ''}</p>
                    </button>
                  ))}
                </div>
              )}
              {showResults && !searching && query.length >= 2 && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e9ef] rounded-lg shadow-md z-20 p-4">
                  <p className="text-[13px] text-[#a8b0bd]">No results found. Try a different name or enter details manually.</p>
                </div>
              )}
            </div>

            {selected && (
              <div className="animate-fade-in">
                <p className="text-[11px] font-bold text-[#a8b0bd] uppercase tracking-widest mb-2">Found your property</p>
                <PropertyCard property={selected} />
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleConfirmProperty}>Looks good!</Button>
                  <Button variant="ghost" onClick={() => { setSelected(null); setQuery('') }}>Not my hotel</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-lg">
            <PropertyCard property={property} />
          </div>
        )}
      </InteractiveArea>

      {/* ── Phase 2: Settings (appears after property confirmed) ───── */}
      {phase === 'settings' && (
        <>
          <KompasMessage delay={0.1}>
            <p>Got it! Let's fill in the remaining details for <strong>{hotelDetails.name || 'your hotel'}</strong>.</p>
            <p className="mt-2 text-[#52647a]">
              Fields pulled from the search are pre-filled — fill in the rest to continue.
            </p>
          </KompasMessage>

          <InteractiveArea delay={0.25}>
            <div className="max-w-lg">
              {/* Tabs */}
              <div className="flex gap-1 bg-[#f2f4f8] rounded-lg p-1 mb-4 border border-[#e6e9ef]">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-1.5 text-[12.5px] font-semibold rounded transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-[#125fe3] shadow-sm border border-[#e6e9ef]'
                        : 'text-[#a8b0bd] hover:text-[#2e3d4b]'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {tab.label}
                      {tabComplete[tab.id] && (
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <Card>
                <Card.Content className="space-y-4">
                  {activeTab === 'hotel' && (
                    <>
                      <Input
                        label="Hotel Name"
                        prefilled={!!property?.name}
                        size="sm"
                        value={hotelDetails.name}
                        onChange={e => setHotelDetails(h => ({ ...h, name: e.target.value }))}
                        placeholder="e.g. Maison Proust"
                      />
                      <Input
                        label="Address"
                        prefilled={!!property?.address}
                        size="sm"
                        value={hotelDetails.address}
                        onChange={e => setHotelDetails(h => ({ ...h, address: e.target.value }))}
                        placeholder="e.g. 7 Rue Marcel Proust, Paris"
                      />
                      <Input
                        label="Country"
                        prefilled={!!property?.country}
                        size="sm"
                        value={hotelDetails.country}
                        onChange={e => setHotelDetails(h => ({ ...h, country: e.target.value }))}
                        placeholder="e.g. France"
                      />
                    </>
                  )}

                  {activeTab === 'contact' && (
                    <>
                      <Input
                        label="Contact Name"
                        size="sm"
                        value={contact.contactName}
                        onChange={e => setContact(c => ({ ...c, contactName: e.target.value }))}
                        placeholder="e.g. Sophie Laurent"
                      />
                      <Input
                        label="Phone Number"
                        size="sm"
                        value={contact.phone}
                        onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                        placeholder="e.g. +33 1 23 45 67 89"
                      />
                      <Input
                        label="Email"
                        type="email"
                        size="sm"
                        value={contact.email}
                        onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                        placeholder="e.g. info@hotel.com"
                      />
                      <Input
                        label="Website"
                        size="sm"
                        value={contact.website}
                        onChange={e => setContact(c => ({ ...c, website: e.target.value }))}
                        placeholder="e.g. www.hotel.com"
                      />
                    </>
                  )}

                  {activeTab === 'localization' && (
                    <>
                      {localizationFromCountry && (
                        <p className="text-[12px] text-[#a8b0bd]">Auto-detected from your country — adjust if needed.</p>
                      )}
                      <Select
                        label="Timezone"
                        prefilled={localizationFromCountry}
                        size="md"
                        value={localization.timezone}
                        onChange={e => setLocalization(l => ({ ...l, timezone: e.target.value }))}
                        options={TIMEZONES}
                      />
                      <Select
                        label="Currency"
                        prefilled={localizationFromCountry}
                        size="md"
                        value={localization.currency}
                        onChange={e => setLocalization(l => ({ ...l, currency: e.target.value }))}
                        options={CURRENCIES}
                      />
                      <div>
                        <Input
                          label="VAT Rate"
                          prefilled={localizationFromCountry}
                          size="sm"
                          value={localization.vatRate}
                          onChange={e => setLocalization(l => ({ ...l, vatRate: e.target.value }))}
                          placeholder="e.g. 10"
                        />
                        <p className="text-[11px] text-[#a8b0bd] mt-1">Percentage (%)</p>
                      </div>
                    </>
                  )}
                </Card.Content>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1.5">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        activeTab === tab.id ? 'bg-[#125fe3] w-4' : 'bg-[#e6e9ef] w-1.5'
                      }`}
                    />
                  ))}
                </div>
                {activeTab !== 'localization' ? (
                  <button
                    onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}
                    className="text-[13px] font-semibold text-[#125fe3] hover:text-[#0e4fc4] transition-colors flex items-center gap-1"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                ) : (
                  <Button
                    onClick={handleSave}
                    disabled={!hotelDetails.name || !contact.email || !localization.timezone}
                  >
                    Save & Continue
                  </Button>
                )}
              </div>
            </div>
          </InteractiveArea>
        </>
      )}
    </>
  )
}
