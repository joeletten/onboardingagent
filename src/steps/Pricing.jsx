import React, { useState } from 'react'
import { KompasMessage, InteractiveArea, SelectCard, PrimaryButton } from '../ui'
import { useOnboarding } from '../OnboardingContext'

const STRATEGIES = [
  {
    id: 'conservative',
    label: 'Conservative',
    desc: 'Smaller, safer price changes. Great if you prefer stability.',
    emoji: '🛡️',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    desc: 'A mix of caution and opportunity. Recommended for most hotels.',
    emoji: '⚖️',
    recommended: true,
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    desc: 'Bigger swings to maximize revenue. Best for dynamic markets.',
    emoji: '🚀',
  },
]

export default function Pricing() {
  const { data, setData, nextStep } = useOnboarding()
  const [strategy, setStrategy] = useState(data.pricing?.strategy || '')
  const [minPrice, setMinPrice] = useState(data.pricing?.min || 80)
  const [maxPrice, setMaxPrice] = useState(data.pricing?.max || 350)

  const handleContinue = () => {
    setData('pricing', { min: minPrice, max: maxPrice, strategy })
    nextStep()
  }

  // Suggest price range based on rooms
  const baseRoom = data.rooms?.find(r => r.isBase)
  const suggestedMin = baseRoom ? Math.round(baseRoom.baseRate * 0.6) : 80
  const suggestedMax = baseRoom ? Math.round(baseRoom.baseRate * 3) : 350

  return (
    <>
      <KompasMessage>
        <p>
          Almost there! Let's set up your pricing strategy.
        </p>
        <p className="mt-2 text-lh-text-secondary">
          I need to know your price range and how aggressively you'd like me to adjust rates.
          Don't worry — you can always change this later.
        </p>
      </KompasMessage>
      <InteractiveArea>
        <div className="max-w-lg space-y-6">
          {/* Price range */}
          <div>
            <p className="text-xs font-semibold text-lh-text-muted uppercase tracking-wider mb-3">
              Price range (base room per night)
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-lh-text-muted mb-1 block">Minimum</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-lh-text-muted">€</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-lh-border bg-white text-sm
                      focus:outline-none focus:ring-2 focus:ring-kompas-indigo/30 focus:border-kompas-indigo"
                  />
                </div>
              </div>
              <span className="text-lh-text-muted mt-5">—</span>
              <div className="flex-1">
                <label className="text-xs text-lh-text-muted mb-1 block">Maximum</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-lh-text-muted">€</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-lh-border bg-white text-sm
                      focus:outline-none focus:ring-2 focus:ring-kompas-indigo/30 focus:border-kompas-indigo"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Strategy */}
          <div>
            <p className="text-xs font-semibold text-lh-text-muted uppercase tracking-wider mb-3">
              Pricing stance
            </p>
            <div className="space-y-2">
              {STRATEGIES.map(s => (
                <SelectCard
                  key={s.id}
                  selected={strategy === s.id}
                  onClick={() => setStrategy(s.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{s.label}</p>
                        {s.recommended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-kompas-indigo/10 text-kompas-indigo uppercase">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-lh-text-muted mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                </SelectCard>
              ))}
            </div>
          </div>

          <PrimaryButton onClick={handleContinue} disabled={!strategy}>
            Continue
          </PrimaryButton>
        </div>
      </InteractiveArea>
    </>
  )
}
