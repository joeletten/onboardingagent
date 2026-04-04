'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { KompasMessage, InteractiveArea, PrimaryButton, Button, Input } from '../ui'
import { useOnboarding, ContinuePortal } from '../OnboardingContext'
import { getMockCompetitors } from '../mockData'

export default function Competitors() {
  const { data, setData, nextStep } = useOnboarding()
  const city = data.property?.city || 'your area'
  const suggested = useMemo(() => getMockCompetitors(city), [city])

  // Custom competitors added via search
  const [custom, setCustom] = useState(() => {
    const suggestedNames = new Set(suggested.map(c => c.name.toLowerCase()))
    return (data.competitors || []).filter(c => !suggestedNames.has(c.name?.toLowerCase()))
  })

  // All competitors = suggested + custom
  const allCompetitors = useMemo(() => [...suggested, ...custom], [suggested, custom])

  // Selected IDs
  const [selected, setSelected] = useState(() => {
    const savedNames = new Set((data.competitors || []).map(c => c.name?.toLowerCase()))
    return new Set(allCompetitors.filter(c => savedNames.has(c.name.toLowerCase())).map(c => c.id))
  })

  // Keep selection in sync when chat updates data.competitors
  useEffect(() => {
    const savedNames = new Set((data.competitors || []).map(c => c.name?.toLowerCase()))
    setSelected(new Set(allCompetitors.filter(c => savedNames.has(c.name.toLowerCase())).map(c => c.id)))
  }, [data.competitors, allCompetitors])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Search state ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(searchQuery)}`)
        const json = await res.json()
        setSearchResults(Array.isArray(json) ? json : [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  const addFromSearch = (hotel) => {
    // Don't add duplicates
    const exists = allCompetitors.some(c => c.name.toLowerCase() === hotel.name.toLowerCase())
    if (exists) {
      // Just select the existing one
      const existing = allCompetitors.find(c => c.name.toLowerCase() === hotel.name.toLowerCase())
      if (existing) setSelected(prev => new Set(prev).add(existing.id))
    } else {
      const newComp = {
        id: `custom-${Date.now()}`,
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        stars: hotel.rating ? Math.round(hotel.rating) : 0,
        dist: hotel.city === data.property?.city ? 'Nearby' : hotel.city || '',
      }
      setCustom(prev => [...prev, newComp])
      setSelected(prev => new Set(prev).add(newComp.id))
    }
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
  }

  const removeCustom = (id) => {
    setCustom(prev => prev.filter(c => c.id !== id))
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleContinue = () => {
    const picked = allCompetitors.filter(c => selected.has(c.id))
    setData('competitors', picked)
    nextStep()
  }

  return (
    <>
      <KompasMessage>
        <p>
          I found some hotels near <strong>{data.property?.name || 'your property'}</strong> in {city}.
          Pick the ones you consider your competitors — I'll track their rates to help you price smarter.
        </p>
        <p className="mt-2 text-[#52647a]">
          Don't see a competitor? Use the search below to find and add any hotel.
        </p>
      </KompasMessage>
      <InteractiveArea>
        <div className="max-w-lg space-y-2">
          {/* Suggested competitors */}
          {suggested.map(comp => {
            const isSelected = selected.has(comp.id)
            return (
              <button
                key={comp.id}
                onClick={() => toggle(comp.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-kompas-indigo bg-kompas-indigo/5'
                    : 'border-lh-border bg-white hover:border-lh-text-muted/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-kompas-indigo bg-kompas-indigo' : 'border-lh-border'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{comp.name}</p>
                    <p className="text-xs text-lh-text-muted">{comp.dist} away</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: comp.stars }).map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </button>
            )
          })}

          {/* Custom-added competitors */}
          {custom.map(comp => {
            const isSelected = selected.has(comp.id)
            return (
              <div key={comp.id} className={`flex items-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-kompas-indigo bg-kompas-indigo/5'
                  : 'border-lh-border bg-white'
              }`}>
                <button onClick={() => toggle(comp.id)} className="flex items-center gap-3 flex-1 text-left">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected ? 'border-kompas-indigo bg-kompas-indigo' : 'border-lh-border'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{comp.name}</p>
                    <p className="text-xs text-lh-text-muted">{comp.dist || comp.city || 'Custom'}</p>
                  </div>
                </button>
                {comp.stars > 0 && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {Array.from({ length: comp.stars }).map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => removeCustom(comp.id)}
                  className="p-1.5 rounded text-[#a8b0bd] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            )
          })}

          {/* Search to add */}
          {showSearch ? (
            <div className="relative">
              <Input
                placeholder="Search for a hotel to add..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                size="sm"
                autoFocus
              />
              {/* Results dropdown */}
              {searching && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e9ef] rounded-lg shadow-md z-20 p-4 flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-[#125fe3]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  <p className="text-[13px] text-[#a8b0bd]">Searching…</p>
                </div>
              )}
              {!searching && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e9ef] rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.10)] z-20 overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((h, i) => (
                    <button
                      key={h.id || i}
                      onClick={() => addFromSearch(h)}
                      className="w-full text-left px-4 py-3 hover:bg-[#f9fafb] transition-colors border-b border-[#e6e9ef] last:border-0"
                    >
                      <p className="text-[13px] font-semibold text-[#1f2124]">{h.name}</p>
                      <p className="text-[12px] text-[#a8b0bd]">{h.city}{h.city && h.country ? ', ' : ''}{h.country}{h.rating ? ` · ★ ${h.rating}` : ''}</p>
                    </button>
                  ))}
                </div>
              )}
              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e9ef] rounded-lg shadow-md z-20 p-4">
                  <p className="text-[13px] text-[#a8b0bd]">No hotels found. Try a different name.</p>
                </div>
              )}
              <button
                onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]) }}
                className="mt-2 text-[12px] text-[#a8b0bd] hover:text-[#52647a] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[#e6e9ef]
                text-[13px] font-medium text-[#52647a] hover:text-[#125fe3] hover:border-[rgba(18,95,227,0.3)] hover:bg-[rgba(18,95,227,0.03)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              Search & add a competitor
            </button>
          )}
        </div>
      </InteractiveArea>

      <ContinuePortal>
        <div className="flex items-center gap-3">
          <PrimaryButton onClick={handleContinue} disabled={selected.size === 0}>
            Track {selected.size} competitor{selected.size !== 1 ? 's' : ''}
          </PrimaryButton>
          {selected.size === 0 && (
            <p className="text-xs text-lh-text-muted">Select at least one</p>
          )}
        </div>
      </ContinuePortal>
    </>
  )
}
