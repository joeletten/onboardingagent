'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

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
  data: { ...initialData },
  isTyping: false,
  stepReady: false,
  resetId: 0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step, isTyping: true, stepReady: false }
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1, isTyping: true, stepReady: false }
    case 'SET_DATA':
      return { ...state, data: { ...state.data, [action.key]: action.value } }
    case 'SET_TYPING':
      return { ...state, isTyping: action.value }
    case 'SET_STEP_READY':
      return { ...state, stepReady: true, isTyping: false }
    case 'RESET':
      return { ...initialState, resetId: state.resetId + 1 }
    case 'HYDRATE':
      return { ...state, ...action.payload, isTyping: true, stepReady: false }
    default:
      return state
  }
}

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'HYDRATE', payload: { currentStep: parsed.currentStep, data: parsed.data } })
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
        data: state.data,
      }))
    } catch (e) {
      // ignore
    }
  }, [state.currentStep, state.data])

  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), [])
  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', step }), [])
  const setData = useCallback((key, value) => dispatch({ type: 'SET_DATA', key, value }), [])
  const setTyping = useCallback((value) => dispatch({ type: 'SET_TYPING', value }), [])
  const setStepReady = useCallback(() => dispatch({ type: 'SET_STEP_READY' }), [])
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
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
