'use client'

import React, { useState, useEffect } from 'react'
import { KompasMessage, InteractiveArea, PrimaryButton } from '../ui'
import { useOnboarding } from '../OnboardingContext'

export default function Welcome() {
  const { data, setData, nextStep } = useOnboarding()
  const [name, setName] = useState(data.name || '')

  // Keep form in sync when chat updates name
  useEffect(() => { setName(data.name || '') }, [data.name])

  const handleSubmit = () => {
    if (!name.trim()) return
    setData('name', name.trim())
    nextStep()
  }

  return (
    <>
      <KompasMessage>
        <p>
          Hi there! I'm <strong>Joel</strong>, your setup assistant.
        </p>
        <p className="mt-2 text-lh-text-secondary">
          I'll walk you through getting your hotel up and running on Lighthouse.
          It should take about <strong>15-20 minutes</strong> — and I'll do most of the heavy lifting.
        </p>
        <p className="mt-2 text-lh-text-secondary">
          Let's start simple — what's your name?
        </p>
      </KompasMessage>
      <InteractiveArea>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. Maria"
            autoFocus
            className="flex-1 max-w-xs px-4 py-2.5 rounded-xl border border-lh-border bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-kompas-indigo/30 focus:border-kompas-indigo
              placeholder:text-lh-text-muted transition-all"
          />
          <PrimaryButton onClick={handleSubmit} disabled={!name.trim()}>
            Continue
          </PrimaryButton>
        </div>
      </InteractiveArea>
    </>
  )
}
