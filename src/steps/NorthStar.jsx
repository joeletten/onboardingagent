import React, { useState } from 'react'
import { KompasMessage, InteractiveArea, SelectCard, PrimaryButton } from '../ui'
import { useOnboarding } from '../OnboardingContext'
import { NORTH_STAR_OPTIONS } from '../mockData'

export default function NorthStar() {
  const { data, setData, nextStep } = useOnboarding()
  const [selected, setSelected] = useState(data.northStar || '')

  const handleContinue = () => {
    setData('northStar', selected)
    nextStep()
  }

  return (
    <>
      <KompasMessage>
        <p>
          Last question, {data.name}! Which <strong>metric</strong> is your North Star?
        </p>
        <p className="mt-2 text-lh-text-secondary">
          This is the number I'll optimize everything around. All my pricing suggestions will be geared toward maximizing this.
        </p>
      </KompasMessage>
      <InteractiveArea>
        <div className="max-w-lg space-y-3">
          {/* Recommended option */}
          {NORTH_STAR_OPTIONS.filter(o => o.recommended).map(opt => (
            <SelectCard
              key={opt.id}
              selected={selected === opt.name}
              onClick={() => setSelected(opt.name)}
              className="bg-gradient-to-br from-kompas-indigo/5 to-kompas-purple/5"
            >
              <div className="text-center py-2">
                <span className="text-[10px] font-bold text-kompas-indigo uppercase tracking-widest">Recommended</span>
                <p className="text-xl font-bold mt-1">{opt.name}</p>
                <p className="text-xs text-lh-text-muted mt-1">{opt.desc}</p>
              </div>
            </SelectCard>
          ))}

          <p className="text-xs text-lh-text-muted text-center py-1">Or choose another metric</p>

          {NORTH_STAR_OPTIONS.filter(o => !o.recommended).map(opt => (
            <SelectCard
              key={opt.id}
              selected={selected === opt.name}
              onClick={() => setSelected(opt.name)}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${selected === opt.name ? 'border-kompas-indigo bg-kompas-indigo' : 'border-lh-border'}">
                  {selected === opt.name && (
                    <div className="w-2 h-2 rounded-full bg-kompas-indigo" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{opt.name}</p>
                  <p className="text-xs text-lh-text-muted">{opt.desc}</p>
                </div>
              </div>
            </SelectCard>
          ))}

          <div className="pt-2">
            <PrimaryButton onClick={handleContinue} disabled={!selected}>
              Confirm
            </PrimaryButton>
          </div>
        </div>
      </InteractiveArea>
    </>
  )
}
