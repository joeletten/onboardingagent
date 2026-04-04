'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react'
import ReactDOM from 'react-dom'

const STORAGE_KEY = 'lighthouse_onboarding'

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: 'smile' },
  { id: 'role', label: 'About You', icon: 'user' },
  { id: 'property', label: 'My Hotel', icon: 'building' },
  { id: 'channelConnect', label: 'Connect Channels', icon: 'link2' },
  { id: 'pms', label: 'PMS Connection', icon: 'plug' },
  { id: 'rooms', label: 'Rooms', icon: 'bed' },
  { id: 'extras', label: 'Extras & Discounts', icon: 'tag' },
  { id: 'ratePlans', label: 'Rate Plans', icon: 'layers' },
  { id: 'ota', label: 'Channels', icon: 'globe' },
  { id: 'distribution', label: 'Distribution', icon: 'grid' },
  { id: 'competitors', label: 'Competitors', icon: 'star' },
  { id: 'complete', label: 'All Set!', icon: 'check' },
]

const initialData = {
  name: '',
  role: '',
  property: null,
  settings: null,
  channelConnect: null,
  pms: null,
  otas: [],
  rooms: [],
  extras: [],
  ratePlans: [],
  distribution: {},
  competitors: [],
}

const initialState = {
  currentStep: 0,
  maxStep: 0,
  data: { ...initialData },
  isTyping: false,
  stepReady: false,
  resetId: 0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      // Only allow navigating to completed steps or the current frontier (maxStep + 1)
      if (action.step > state.maxStep + 1) return state
      return { ...state, currentStep: action.step, isTyping: true, stepReady: false }
    case 'NEXT_STEP': {
      const next = state.currentStep + 1
      // maxStep tracks the highest step completed — the current step is now done
      return { ...state, currentStep: next, maxStep: Math.max(state.maxStep, state.currentStep), isTyping: true, stepReady: false }
    }
    case 'SET_DATA':
      return { ...state, data: { ...state.data, [action.key]: action.value } }
    case 'SET_TYPING':
      return { ...state, isTyping: action.value }
    case 'SET_STEP_READY':
      return { ...state, stepReady: true, isTyping: false }
    case 'RESET':
      return { ...initialState, resetId: state.resetId + 1 }
    case 'HYDRATE':
      return { ...state, ...action.payload, maxStep: Math.max(state.maxStep, action.payload.maxStep ?? action.payload.currentStep ?? 0), isTyping: true, stepReady: false }
    default:
      return state
  }
}

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Portal target for continue buttons — rendered in Chat.jsx after chat messages
  const continuePortalRef = useRef(null)

  // Agent highlight system — tracks which data keys were recently modified by the agent
  // Keys map to timestamp of when they were highlighted; auto-clears after 2s
  const [highlights, setHighlights] = useState({})
  const highlightTimers = useRef({})

  const highlightKeys = useCallback((keys) => {
    const now = Date.now()
    const newHighlights = {}
    for (const key of keys) {
      newHighlights[key] = now
      // Clear any existing timer for this key
      if (highlightTimers.current[key]) clearTimeout(highlightTimers.current[key])
      // Auto-clear after 2s
      highlightTimers.current[key] = setTimeout(() => {
        setHighlights(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        delete highlightTimers.current[key]
      }, 2000)
    }
    setHighlights(prev => ({ ...prev, ...newHighlights }))
  }, [])

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // maxStep = highest completed step; for old data where maxStep wasn't stored, derive from currentStep
        const hydratedMax = parsed.maxStep ?? Math.max(0, (parsed.currentStep || 0) - 1)
        dispatch({ type: 'HYDRATE', payload: { currentStep: parsed.currentStep, maxStep: hydratedMax, data: parsed.data } })
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Persist to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStep: state.currentStep,
        maxStep: state.maxStep,
        data: state.data,
      }))
    } catch (e) {
      // ignore
    }
  }, [state.currentStep, state.maxStep, state.data])

  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), [])
  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', step }), [])
  const setData = useCallback((key, value) => dispatch({ type: 'SET_DATA', key, value }), [])
  const setTyping = useCallback((value) => dispatch({ type: 'SET_TYPING', value }), [])
  const setStepReady = useCallback(() => dispatch({ type: 'SET_STEP_READY' }), [])
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHighlights({})
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <OnboardingContext.Provider value={{
      ...state,
      steps: STEPS,
      nextStep,
      setStep,
      setData,
      setTyping,
      setStepReady,
      reset,
      highlights,
      highlightKeys,
      continuePortalRef,
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}

/**
 * Hook to check if a specific data key is currently highlighted by the agent.
 * Returns true if the key was recently modified via chat.
 */
export function useAgentHighlight(key) {
  const { highlights } = useOnboarding()
  return !!highlights[key]
}

/**
 * Renders children into the continue-button portal target in Chat.jsx,
 * so the continue button always appears after chat messages.
 */
export function ContinuePortal({ children }) {
  const { continuePortalRef } = useOnboarding()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted || !continuePortalRef.current) return null
  return ReactDOM.createPortal(
    <div className="mt-4 ml-11">{children}</div>,
    continuePortalRef.current
  )
}
