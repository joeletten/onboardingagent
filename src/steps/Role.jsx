'use client'

import React, { useState, useRef, useEffect } from 'react'
import { KompasMessage, InteractiveArea, SelectCard, Button } from '../ui'
import { useOnboarding } from '../OnboardingContext'
import { ROLE_OPTIONS } from '../mockData'

export default function Role() {
  const { data, setData, nextStep } = useOnboarding()
  const [otherValue, setOtherValue] = useState('')
  const [showOther, setShowOther] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (showOther) inputRef.current?.focus()
  }, [showOther])

  const handleSelect = (role) => {
    if (role.id === 'other') {
      setShowOther(true)
      setData('role', '')
    } else {
      setShowOther(false)
      setData('role', role.label)
      setTimeout(() => nextStep(), 350)
    }
  }

  const handleOtherSubmit = () => {
    const val = otherValue.trim()
    if (!val) return
    setData('role', val)
    setTimeout(() => nextStep(), 350)
  }

  return (
    <>
      <KompasMessage>
        Nice to meet you, <strong>{data.name}</strong>! What's your role at the hotel?
      </KompasMessage>
      <InteractiveArea>
        <div className="space-y-3 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(role => (
              <SelectCard
                key={role.id}
                selected={role.id === 'other' ? showOther : data.role === role.label}
                onClick={() => handleSelect(role)}
              >
                <p className="font-semibold text-sm">{role.label}</p>
                <p className="text-xs text-lh-text-muted mt-0.5">{role.desc}</p>
              </SelectCard>
            ))}
          </div>

          {showOther && (
            <div className="flex items-center gap-2 pt-1">
              <input
                ref={inputRef}
                className="flex-1 px-3 py-2 rounded-lg border border-[#e6e9ef] bg-white text-[13px] text-[#1f2124]
                  focus:outline-none focus:ring-2 focus:ring-[#125fe3]/20 focus:border-[#125fe3] transition-all placeholder:text-[#a8b0bd]"
                placeholder="e.g. Operations Manager, Consultant…"
                value={otherValue}
                onChange={e => setOtherValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleOtherSubmit()}
              />
              <Button onClick={handleOtherSubmit} disabled={!otherValue.trim()}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </InteractiveArea>
    </>
  )
}
