import React, { useState, useMemo } from 'react'
import { KompasMessage, InteractiveArea, PropertyCard, PrimaryButton, GhostButton } from '../ui'
import { useOnboarding } from '../OnboardingContext'
import { MOCK_HOTELS } from '../mockData'

export default function Property() {
  const { data, setData, nextStep } = useOnboarding()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(data.property || null)
  const [showResults, setShowResults] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const results = useMemo(() => {
    if (query.length < 2) return []
    const q = query.toLowerCase()
    return MOCK_HOTELS.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [query])

  const handleSelect = (hotel) => {
    setSelected(hotel)
    setQuery(hotel.name)
    setShowResults(false)
  }

  const handleConfirm = () => {
    if (!selected) return
    setData('property', selected)
    setConfirmed(true)
    setTimeout(() => nextStep(), 400)
  }

  const roleGreeting = data.role === 'Owner'
    ? "Since you own the place, you know it best!"
    : `As the ${data.role}, you'll love having everything in one place.`

  return (
    <>
      <KompasMessage>
        <p>Great choice! {roleGreeting}</p>
        <p className="mt-2 text-lh-text-secondary">
          Now let's find your property. Start typing your hotel name and I'll look it up.
        </p>
      </KompasMessage>
      <InteractiveArea>
        {!confirmed ? (
          <div className="max-w-lg space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowResults(true); setSelected(null) }}
                onFocus={() => setShowResults(true)}
                placeholder="Start typing your hotel name..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-lh-border bg-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-kompas-indigo/30 focus:border-kompas-indigo
                  placeholder:text-lh-text-muted transition-all"
              />
              {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-lh-border rounded-xl shadow-lg z-20 overflow-hidden">
                  {results.map((hotel, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(hotel)}
                      className="w-full text-left px-4 py-3 hover:bg-lh-bg transition-colors border-b border-lh-border-light last:border-0"
                    >
                      <p className="text-sm font-medium text-lh-text-primary">{hotel.name}</p>
                      <p className="text-xs text-lh-text-muted">{hotel.city}, {hotel.country} &middot; {hotel.rooms} rooms</p>
                    </button>
                  ))}
                </div>
              )}
              {showResults && query.length >= 2 && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-lh-border rounded-xl shadow-lg z-20 p-4">
                  <p className="text-sm text-lh-text-muted">No results found. Try a different name or enter details manually.</p>
                </div>
              )}
            </div>

            {/* Selected property preview */}
            {selected && (
              <div className="animate-fade-in">
                <p className="text-xs font-semibold text-lh-text-muted uppercase tracking-wider mb-2">Found your property</p>
                <PropertyCard property={selected} />
                <div className="flex gap-3 mt-4">
                  <PrimaryButton onClick={handleConfirm}>
                    Looks good!
                  </PrimaryButton>
                  <GhostButton onClick={() => { setSelected(null); setQuery('') }}>
                    Not my hotel
                  </GhostButton>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-lg">
            <PropertyCard property={selected} />
          </div>
        )}
      </InteractiveArea>
    </>
  )
}
