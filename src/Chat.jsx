'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnboarding } from './OnboardingContext'
import { TypingIndicator, KompasOrb, UserMessage } from './ui'
import { callClaude, executeTool } from './claudeClient'

import Welcome from './steps/Welcome'
import Role from './steps/Role'
import PropertyAndSettings from './steps/PropertyAndSettings'
import ChannelConnect from './steps/ChannelConnect'
import PMS from './steps/PMS'
import Rooms from './steps/Rooms'
import Extras from './steps/Extras'
import RatePlans from './steps/RatePlans'
import OTA from './steps/OTA'
import Distribution from './steps/Distribution'
import Competitors from './steps/Competitors'
import Complete from './steps/Complete'

const STEP_COMPONENTS = [
  Welcome,
  Role,
  PropertyAndSettings,
  ChannelConnect,
  PMS,
  Rooms,
  Extras,
  RatePlans,
  OTA,
  Distribution,
  Competitors,
  Complete,
]

function getUserResponse(stepId, data) {
  switch (stepId) {
    case 'welcome': return data.name
    case 'role': return data.role
    case 'property': {
      const h = data.settings?.hotelDetails
      const l = data.settings?.localization
      return h?.name ? `${h.name} · ${l?.currency || ''}` : data.property?.name
    }
    case 'pms': return data.pms ? `Connected to ${data.pms.name}` : 'No PMS — manual setup'
    case 'ota': {
      const c = data.otas?.filter(o => o.connected) || []
      return c.length > 0 ? c.map(o => o.name).join(' & ') : 'Skipped'
    }
    case 'rooms': return `${data.rooms?.length || 0} room types confirmed`
    case 'extras': return data.extras?.length > 0 ? `${data.extras.length} extras & discounts added` : 'No extras added'
    case 'ratePlans': {
      const total = data.ratePlans?.length || 0
      return total > 0 ? `${total} rate plan${total !== 1 ? 's' : ''}` : 'No rate plans'
    }
    case 'distribution': {
      const channelCount = Object.keys(data.distribution || {}).length
      return channelCount > 0 ? `${channelCount} channel${channelCount !== 1 ? 's' : ''} configured` : 'Configured'
    }
    case 'competitors': return `Tracking ${data.competitors?.length || 0} competitors`
    case 'channelConnect': {
      const c = data.channelConnect?.filter(c => c.connected) || []
      return c.length > 0 ? `Connected ${c.map(c => c.name).join(' & ')}` : 'Skipped channels'
    }
    default: return ''
  }
}

// ── Status strip ──────────────────────────────────────────────────────────────

function StatusStrip({ status }) {
  if (!status) return null

  const isThinking = status.type === 'thinking'
  const isError    = status.type === 'error'

  return (
    <motion.div
      key={status.text}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
      className="flex items-center gap-2 px-4 py-2 mx-6 mb-2 rounded-xl text-[12px]"
      style={{
        background: isError ? '#fff0f0' : isThinking ? '#f2f4f8' : '#f0fdf4',
        border: `1px solid ${isError ? '#fecaca' : isThinking ? '#e6e9ef' : '#bbf7d0'}`,
        color: isError ? '#b91c1c' : isThinking ? '#52647a' : '#15803d',
      }}
    >
      {isThinking ? (
        <>
          <span className="flex gap-0.5">
            <span className="typing-dot w-1.5 h-1.5 bg-[#a8b0bd] rounded-full inline-block" />
            <span className="typing-dot w-1.5 h-1.5 bg-[#a8b0bd] rounded-full inline-block" />
            <span className="typing-dot w-1.5 h-1.5 bg-[#a8b0bd] rounded-full inline-block" />
          </span>
          <span>{status.text}</span>
        </>
      ) : (
        <>
          <span>{isError ? '⚠' : '✓'}</span>
          <span>{status.text}</span>
        </>
      )}
    </motion.div>
  )
}

// ── Chat input bar ────────────────────────────────────────────────────────────

function ChatInputBar({ onSend, isProcessing, currentStepId }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const placeholder = currentStepId === 'extras'
    ? 'Add or edit extras, fees & discounts…'
    : 'Ask Joel anything or request changes…'

  const submit = () => {
    const text = value.trim()
    if (!text || isProcessing) return
    onSend(text)
    setValue('')
  }

  return (
    <div className="flex-shrink-0 px-6 pb-4 pt-2">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-white border border-[#e6e9ef] rounded-2xl px-4 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] focus-within:border-[#125fe3] focus-within:ring-2 focus-within:ring-[#125fe3]/15 transition-all">
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-[13px] text-[#1f2124] placeholder:text-[#a8b0bd] outline-none"
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
            disabled={isProcessing}
          />
          {/* Voice (dummy) */}
          <button
            type="button"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#a8b0bd] hover:text-[#52647a] hover:bg-[#f2f4f8] transition-colors"
            title="Voice input (coming soon)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" />
            </svg>
          </button>
          {/* Send */}
          {value.trim() && (
            <button
              onClick={submit}
              disabled={isProcessing}
              className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#125fe3] flex items-center justify-center text-white hover:bg-[#0f4fc2] transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Chat() {
  const { steps, currentStep, isTyping, stepReady, setStepReady, data, setData, nextStep, resetId } = useOnboarding()
  const scrollRef = useRef(null)

  // Full Anthropic conversation history — [{role, content}]
  const [history, setHistory]               = useState([])
  const [chatProcessing, setChatProcessing] = useState(false)
  // Status strip: { text, type: 'thinking'|'success'|'error' } | null
  const [status, setStatus]                 = useState(null)
  const statusTimerRef                      = useRef(null)

  // Clear history when the user resets the onboarding
  useEffect(() => {
    if (resetId > 0) { setHistory([]); setStatus(null) }
  }, [resetId])

  // Ref so async handlers always see the latest data without stale closures
  const dataRef    = useRef(data)
  const stepsRef   = useRef(steps)
  const stepRef    = useRef(currentStep)
  useEffect(() => { dataRef.current  = data    }, [data])
  useEffect(() => { stepsRef.current = steps   }, [steps])
  useEffect(() => { stepRef.current  = currentStep }, [currentStep])

  // Simulate typing delay on step change
  useEffect(() => {
    if (isTyping) {
      const delay = currentStep === 0 ? 1200 : 800
      const t = setTimeout(() => setStepReady(), delay)
      return () => clearTimeout(t)
    }
  }, [isTyping, currentStep, setStepReady])

  // Auto-scroll on step change
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [currentStep, stepReady])

  const showStatus = useCallback((text, type, autoDismissMs = 0) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    setStatus({ text, type })
    if (autoDismissMs > 0) {
      statusTimerRef.current = setTimeout(() => setStatus(null), autoDismissMs)
    }
  }, [])

  const CurrentStepComponent = STEP_COMPONENTS[currentStep]
  const currentStepDef = steps[currentStep]

  // ── Send handler ────────────────────────────────────────────────────────────

  const handleChatSend = async (text) => {
    setChatProcessing(true)
    showStatus('Thinking…', 'thinking')

    let workingData = { ...dataRef.current }
    const currentStepSnapshot = stepsRef.current[stepRef.current]
    const allSteps = stepsRef.current

    // Prepend a brief context note if history is empty
    let baseHistory = history
    if (history.length === 0 && Object.values(workingData).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) {
      baseHistory = [{
        role: 'user',
        content: '[System: The user is continuing an onboarding session. All data above reflects what has already been collected.]',
      }, {
        role: 'assistant',
        content: [{ type: 'text', text: `I can see your progress so far. What would you like to adjust?` }],
      }]
    }

    const newMessages = [...baseHistory, { role: 'user', content: text }]

    try {
      // First call
      let response = await callClaude(newMessages, workingData, currentStepSnapshot, allSteps)
      let updatedMessages = [...newMessages, { role: 'assistant', content: response.content }]

      let shouldAdvance = false
      let actionLabel   = ''

      if (response.stop_reason === 'tool_use') {
        const toolUses    = response.content.filter(b => b.type === 'tool_use')
        const toolResults = []

        for (const tu of toolUses) {
          const { data: nextData, result, sideEffect } = executeTool(tu.name, tu.input, workingData)
          workingData = nextData
          if (sideEffect === 'advance_step') shouldAdvance = true
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            content: JSON.stringify(result),
          })
          // Derive a human-readable action label from the tool name
          if (!actionLabel) actionLabel = labelForTool(tu.name, tu.input)
        }

        // Commit all data mutations
        Object.keys(workingData).forEach(key => {
          if (JSON.stringify(workingData[key]) !== JSON.stringify(dataRef.current[key])) {
            setData(key, workingData[key])
          }
        })

        // Second call for final reply
        updatedMessages.push({ role: 'user', content: toolResults })
        response = await callClaude(updatedMessages, workingData, currentStepSnapshot, allSteps)
        updatedMessages.push({ role: 'assistant', content: response.content })
      }

      setHistory(updatedMessages)

      if (shouldAdvance) {
        showStatus('Moving to next step…', 'success')
        setTimeout(() => {
          setStatus(null)
          nextStep()
        }, 1500)
      } else {
        const successLabel = actionLabel || 'Done'
        showStatus(successLabel, 'success', 3000)
      }

    } catch (err) {
      const errText = err.message?.includes('ANTHROPIC_API_KEY')
        ? 'API key not configured — add ANTHROPIC_API_KEY to .env.local'
        : `Something went wrong: ${err.message}`
      showStatus(errText, 'error', 6000)
    } finally {
      setChatProcessing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 h-[60px] border-b border-lh-border-light bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <KompasOrb size="sm" />
          <div>
            <p className="text-[13px] font-semibold text-lh-text-primary leading-tight">Joel</p>
            <p className="text-[11px] text-lh-text-secondary leading-tight">
              {currentStep < steps.length - 1
                ? `Step ${currentStep + 1} of ${steps.length - 1}`
                : 'Setup complete'}
            </p>
          </div>
        </div>
        <button
          className="text-[12px] font-medium text-lh-text-secondary hover:text-lh-text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-lh-border-light"
          onClick={() => alert('In the full version, this would connect you with a Lighthouse onboarding specialist.')}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Need a human?
        </button>
      </header>

      {/* Scrollable step area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-lh-bg">
        <div className="max-w-2xl mx-auto px-6 py-8">

          {/* Completed steps */}
          {steps.slice(0, currentStep).map(step => {
            const response = getUserResponse(step.id, data)
            if (!response) return null
            return (
              <div key={step.id} className="mb-4 opacity-60 hover:opacity-80 transition-opacity">
                <UserMessage>{response}</UserMessage>
              </div>
            )
          })}

          {/* Active step */}
          <AnimatePresence mode="wait">
            {isTyping && !stepReady ? (
              <TypingIndicator key="typing" />
            ) : (
              CurrentStepComponent && <CurrentStepComponent key={steps[currentStep]?.id} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status strip — shown above the input bar */}
      <AnimatePresence>
        {status && <StatusStrip key="status" status={status} />}
      </AnimatePresence>

      {/* Command bar */}
      <ChatInputBar
        onSend={handleChatSend}
        isProcessing={chatProcessing}
        currentStepId={currentStepDef?.id}
      />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function labelForTool(name, input) {
  switch (name) {
    case 'set_user_info':     return input.name && input.role
                                ? `Saved name & role`
                                : input.name ? `Name saved: "${input.name}"` : `Role saved: "${input.role}"`
    case 'set_property_info': return `Property info saved`
    case 'add_room':          return `Room type added: "${input.name}"`
    case 'update_room':       return `Room type updated`
    case 'remove_room':       return `Room type removed`
    case 'add_extra':         return `Extra added: "${input.name}"`
    case 'update_extra':      return `Extra updated`
    case 'remove_extra':      return `Extra removed`
    case 'add_rate_plan':     return `Rate plan added: "${input.name}"`
    case 'update_rate_plan':  return `Rate plan updated`
    case 'remove_rate_plan':  return `Rate plan removed`
    case 'set_distribution':  return `Distribution updated`
    case 'set_pms':           return `PMS connected: ${input.name}`
    case 'connect_channel':   return `Channel connected: ${input.channelName}`
    case 'add_competitor':    return `Competitor added: "${input.name}"`
    case 'remove_competitor': return `Competitor removed`
    case 'advance_step':      return `Moving to next step…`
    default:                  return 'Changes applied'
  }
}
