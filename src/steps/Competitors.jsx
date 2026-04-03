'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { KompasMessage, InteractiveArea, PrimaryButton } from '../ui'
import { useOnboarding, ContinuePortal } from '../OnboardingContext'
import { getMockCompetitors } from '../mockData'

export default function Competitors() {
  const { data, setData, nextStep } = useOnboarding()
  const city = data.property?.city || 'your area'
  const competitors = useMemo(() => getMockCompetitors(city), [city])

  // Initialize selected from context (match by name so chat-added competitors work)
  const [selected, setSelected] = useState(() => {
    const savedNames = new Set((data.competitors || []).map(c => c.name?.toLowerCase()))
    return new Set(competitors.filter(c => savedNames.has(c.name.toLowerCase())).map(c => c.id))
  })

  // Keep selection in sync when chat updates data.competitors
  useEffect(() => {
    const savedNames = new Set((data.competitors || []).map(c => c.name?.toLowerCase()))
    setSelected(new Set(competitors.filter(c => savedNames.has(c.name.toLowerCase())).map(c => c.id)))
  }, [data.competitors, competitors])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleContinue = () => {
    const picked = competitors.filter(c => selected.has(c.id))
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
      </KompasMessage>
      <InteractiveArea>
        <div className="max-w-lg space-y-2">
          {competitors.map(comp => {
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
