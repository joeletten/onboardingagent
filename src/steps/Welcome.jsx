'use client'

import React, { useState, useEffect } from 'react'
import { KompasMessage, InteractiveArea, PrimaryButton } from '../ui'
import { useOnboarding, useAgentHighlight, ContinuePortal } from '../OnboardingContext'
import { validateFullName } from '../validation'

export default function Welcome() {
  const { data, setData, nextStep } = useOnboarding()
  const nameHighlighted = useAgentHighlight('name')
  const [name, setName] = useState(data.name || '')
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)

  // Keep form in sync when chat updates name
  useEffect(() => { setName(data.name || '') }, [data.name])

  const handleBlur = () => {
    setTouched(true)
    if (name.trim()) setError(validateFullName(name))
  }

  const handleSubmit = () => {
    const err = validateFullName(name)
    if (err) { setError(err); setTouched(true); return }
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
          Let's start simple — what's your full name?
        </p>
      </KompasMessage>
      <InteractiveArea>
        <div className="max-w-xs">
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); if (touched) setError(validateFullName(e.target.value)) }}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. Maria Gonzalez"
            autoFocus
            className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm
              focus:outline-none focus:ring-2 transition-all
              placeholder:text-lh-text-muted
              ${error && touched
                ? 'border-[#d93025] focus:ring-[#d93025]/20 focus:border-[#d93025]'
                : nameHighlighted
                  ? 'agent-highlight'
                  : 'border-lh-border focus:ring-kompas-indigo/30 focus:border-kompas-indigo'
              }`}
          />
          {error && touched && (
            <p className="flex items-center gap-1 text-[12px] text-[#d93025] mt-1 leading-4">
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10.5a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </InteractiveArea>

      <ContinuePortal>
        <PrimaryButton onClick={handleSubmit} disabled={!name.trim() || !!validateFullName(name)}>
          Continue
        </PrimaryButton>
      </ContinuePortal>
    </>
  )
}
