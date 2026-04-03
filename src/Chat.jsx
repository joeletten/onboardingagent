'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnboarding } from './OnboardingContext'
import { TypingIndicator, KompasOrb } from './ui'
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
  Welcome, Role, PropertyAndSettings, ChannelConnect, PMS,
  Rooms, Extras, RatePlans, OTA, Distribution, Competitors, Complete,
]

// ── Icon for tool action type ────────────────────────────────────────────────

function ActionIcon({ toolName }) {
  const isAdd    = toolName.startsWith('add_') || toolName === 'connect_channel' || toolName === 'set_pms'
  const isRemove = toolName.startsWith('remove_')
  const isNav    = toolName === 'advance_step' || toolName === 'navigate_to_step'

  if (isNav) return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
  if (isRemove) return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 12h14" />
    </svg>
  )
  if (isAdd) return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ── Chat message components ──────────────────────────────────────────────────

function ChatUserBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end mb-2"
    >
      <div className="bg-[#125fe3] text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
        <p className="text-[13px] leading-relaxed">{text}</p>
      </div>
    </motion.div>
  )
}

function ChatAgentBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5 mb-2"
    >
      <div className="flex-shrink-0 mt-0.5">
        <KompasOrb size="xs" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] shadow-sm border border-[#e6e9ef]">
        <p className="text-[13px] leading-relaxed text-[#2e3d4b]">{text}</p>
      </div>
    </motion.div>
  )
}

function ChatActionCard({ label, toolName, success }) {
  const isNav = toolName === 'advance_step' || toolName === 'navigate_to_step'
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2 mb-2 ml-[30px]"
    >
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium ${
        isNav
          ? 'bg-[#f0f4ff] text-[#125fe3] border border-[#125fe3]/15'
          : success
            ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]'
            : 'bg-[#fff0f0] text-[#b91c1c] border border-[#fecaca]'
      }`}>
        <ActionIcon toolName={toolName} />
        <span>{label}</span>
      </div>
    </motion.div>
  )
}

function ChatThinking() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2.5 mb-2"
    >
      <div className="flex-shrink-0">
        <KompasOrb size="xs" />
      </div>
      <div className="flex gap-1 px-3 py-2">
        <span className="typing-dot w-1.5 h-1.5 bg-[#a8b0bd] rounded-full inline-block" />
        <span className="typing-dot w-1.5 h-1.5 bg-[#a8b0bd] rounded-full inline-block" />
        <span className="typing-dot w-1.5 h-1.5 bg-[#a8b0bd] rounded-full inline-block" />
      </div>
    </motion.div>
  )
}

function ChatError({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 mb-2 ml-[30px]"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] bg-[#fff0f0] text-[#b91c1c] border border-[#fecaca]">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{text}</span>
      </div>
    </motion.div>
  )
}

// ── Chat input bar ────────────────────────────────────────────────────────────

function ChatInputBar({ onSend, isProcessing, currentStepId }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)
  const hasInteracted = useRef(false)

  useEffect(() => {
    if (hasInteracted.current && !isProcessing && inputRef.current) inputRef.current.focus()
  }, [isProcessing])

  const placeholders = {
    welcome: 'Tell me your name…',
    role: 'What\'s your role at the hotel?',
    property: 'Tell me about your property…',
    channelConnect: 'Which channels do you use?',
    pms: 'Which PMS do you use?',
    rooms: 'Describe your room types…',
    extras: 'Add extras, fees & discounts…',
    ratePlans: 'Describe your rate plans…',
    ota: 'Which OTA channels should we connect?',
    distribution: 'How should we distribute your rates?',
    competitors: 'Name your competitor hotels…',
    complete: 'Anything you\'d like to adjust?',
  }
  const placeholder = placeholders[currentStepId] || 'Type a message…'

  const submit = () => {
    const text = value.trim()
    if (!text || isProcessing) return
    hasInteracted.current = true
    onSend(text)
    setValue('')
  }

  return (
    <div className="flex-shrink-0 px-6 pb-4 pt-2">
      <div className="max-w-2xl mx-auto">
        <div className={`flex items-center gap-2 bg-[#f9fafb] border rounded-2xl px-4 py-2.5 transition-all ${
          isProcessing ? 'border-[#125fe3]/30' : 'border-[#e6e9ef] focus-within:border-[#125fe3] focus-within:ring-2 focus-within:ring-[#125fe3]/10'
        }`}>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-[13px] text-[#1f2124] placeholder:text-[#a8b0bd] outline-none"
            placeholder={isProcessing ? 'Joel is thinking…' : placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={submit}
            disabled={isProcessing || !value.trim()}
            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              value.trim() && !isProcessing
                ? 'bg-[#125fe3] text-white hover:bg-[#0e4fbd]'
                : 'text-[#a8b0bd]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Chat() {
  const { steps, currentStep, isTyping, stepReady, setStepReady, data, setData, nextStep, setStep, resetId, highlightKeys, continuePortalRef } = useOnboarding()
  const scrollRef = useRef(null)
  const bottomRef = useRef(null)

  // Full Anthropic conversation history — [{role, content}]
  const [history, setHistory]               = useState([])
  // UI-visible chat messages — displayed inline in the conversation
  const [chatMessages, setChatMessages]     = useState([])
  const [chatProcessing, setChatProcessing] = useState(false)
  const [isThinking, setIsThinking_chat]    = useState(false)

  const msgIdRef = useRef(0)
  const nextMsgId = () => `msg-${++msgIdRef.current}`

  const addChatMessage = useCallback((msg) => {
    setChatMessages(prev => [...prev, { ...msg, id: nextMsgId() }])
  }, [])

  // Clear chat messages when the step changes (form-driven or agent-driven)
  useEffect(() => {
    setChatMessages([])
  }, [currentStep])

  // Clear everything on reset
  useEffect(() => {
    if (resetId > 0) { setHistory([]); setChatMessages([]) }
  }, [resetId])

  // Ref so async handlers always see the latest data without stale closures
  const dataRef  = useRef(data)
  const stepsRef = useRef(steps)
  const stepRef  = useRef(currentStep)
  useEffect(() => { dataRef.current  = data         }, [data])
  useEffect(() => { stepsRef.current = steps        }, [steps])
  useEffect(() => { stepRef.current  = currentStep  }, [currentStep])

  // Simulate typing delay on step change
  useEffect(() => {
    if (isTyping) {
      const delay = currentStep === 0 ? 1200 : 800
      const t = setTimeout(() => setStepReady(), delay)
      return () => clearTimeout(t)
    }
  }, [isTyping, currentStep, setStepReady])

  // Unified auto-scroll — scroll to bottom when new content appears
  const isNearBottom = useCallback(() => {
    if (!scrollRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    return scrollHeight - scrollTop - clientHeight < 200
  }, [])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  // Scroll on step change (always) and on new messages (if near bottom)
  useEffect(() => {
    const t = setTimeout(scrollToBottom, 120)
    return () => clearTimeout(t)
  }, [currentStep, stepReady, scrollToBottom])

  useEffect(() => {
    if (isNearBottom()) {
      const t = setTimeout(scrollToBottom, 80)
      return () => clearTimeout(t)
    }
  }, [chatMessages, isThinking, isNearBottom, scrollToBottom])

  const CurrentStepComponent = STEP_COMPONENTS[currentStep]
  const currentStepDef = steps[currentStep]

  // ── Send handler ────────────────────────────────────────────────────────────

  const handleChatSend = async (text) => {
    addChatMessage({ type: 'user', text })
    setChatProcessing(true)
    setIsThinking_chat(true)

    let workingData = { ...dataRef.current }
    const currentStepSnapshot = stepsRef.current[stepRef.current]
    const allSteps = stepsRef.current

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
      let response = await callClaude(newMessages, workingData, currentStepSnapshot, allSteps)
      let updatedMessages = [...newMessages, { role: 'assistant', content: response.content }]

      let shouldAdvance = false
      let navigateTarget = null

      const showAgentText = (content) => {
        const textBlocks = (content || []).filter(b => b.type === 'text' && b.text.trim())
        for (const block of textBlocks) {
          addChatMessage({ type: 'agent-text', text: block.text })
        }
      }

      let iterations = 0
      while (response.stop_reason === 'tool_use' && iterations < 8) {
        iterations++
        const toolUses    = response.content.filter(b => b.type === 'tool_use')
        const toolResults = []

        showAgentText(response.content)

        for (const tu of toolUses) {
          const { data: nextData, result, sideEffect } = executeTool(tu.name, tu.input, workingData)
          workingData = nextData
          if (sideEffect === 'advance_step') shouldAdvance = true
          if (sideEffect === 'navigate_to_step') navigateTarget = result.targetStep

          const label = labelForTool(tu.name, tu.input)
          if (tu.name !== 'advance_step' && tu.name !== 'navigate_to_step') {
            addChatMessage({
              type: 'agent-action',
              label,
              toolName: tu.name,
              success: result.success !== false,
            })
          }

          // Persist each item immediately so individual adds are never lost
          const toolChangedKeys = []
          Object.keys(workingData).forEach(key => {
            if (JSON.stringify(workingData[key]) !== JSON.stringify(dataRef.current[key])) {
              setData(key, workingData[key])
              toolChangedKeys.push(key)
            }
          })
          if (toolChangedKeys.length > 0) highlightKeys(toolChangedKeys)

          toolResults.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            content: JSON.stringify(result),
          })
        }

        updatedMessages.push({ role: 'user', content: toolResults })

        setIsThinking_chat(true)
        response = await callClaude(updatedMessages, workingData, currentStepSnapshot, allSteps)
        updatedMessages.push({ role: 'assistant', content: response.content })
      }

      setIsThinking_chat(false)
      showAgentText(response.content)
      setHistory(updatedMessages)

      if (navigateTarget != null) {
        const targetLabel = steps[navigateTarget]?.label || 'step'
        addChatMessage({
          type: 'agent-action',
          label: `Navigating to ${targetLabel}`,
          toolName: 'navigate_to_step',
          success: true,
        })
        setTimeout(() => setStep(navigateTarget), 1400)
      } else if (shouldAdvance) {
        addChatMessage({
          type: 'agent-action',
          label: 'Moving to next step…',
          toolName: 'advance_step',
          success: true,
        })
        setTimeout(() => nextStep(), 1400)
      }

    } catch (err) {
      setIsThinking_chat(false)
      const errText = err.message?.includes('ANTHROPIC_API_KEY')
        ? 'API key not configured — add ANTHROPIC_API_KEY to .env.local'
        : `Something went wrong: ${err.message}`
      addChatMessage({ type: 'error', text: errText })
    } finally {
      setChatProcessing(false)
      setIsThinking_chat(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

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

      {/* Single unified scrollable area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-lh-bg">
        <div className="max-w-2xl mx-auto px-6 py-6">

          {/* Active step — renders KompasMessage + InteractiveArea */}
          <AnimatePresence mode="wait">
            {isTyping && !stepReady ? (
              <TypingIndicator key="typing" />
            ) : (
              CurrentStepComponent && <CurrentStepComponent key={steps[currentStep]?.id} />
            )}
          </AnimatePresence>

          {/* Latest chat message only — history is visible in the sidebar */}
          {chatMessages.length > 0 && (() => {
            const last = chatMessages[chatMessages.length - 1]
            return (
              <div className="mt-4">
                {last.type === 'user' && <ChatUserBubble key={last.id} text={last.text} />}
                {last.type === 'agent-text' && <ChatAgentBubble key={last.id} text={last.text} />}
                {last.type === 'agent-action' && <ChatActionCard key={last.id} label={last.label} toolName={last.toolName} success={last.success} />}
                {last.type === 'error' && <ChatError key={last.id} text={last.text} />}
              </div>
            )
          })()}

          {/* Thinking indicator */}
          <AnimatePresence>
            {isThinking && <ChatThinking key="thinking" />}
          </AnimatePresence>

          {/* Continue button portal target — step components render their continue buttons here */}
          <div ref={continuePortalRef} />

          {/* Scroll anchor */}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {/* Chat input — pinned at bottom */}
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
    case 'add_room':          return `Room added: "${input.name}"`
    case 'update_room':       return `Room updated: "${input.name}"`
    case 'remove_room':       return `Room removed: "${input.name}"`
    case 'add_extra':         return `Added: "${input.name}"`
    case 'update_extra':      return `Updated: "${input.name}"`
    case 'remove_extra':      return `Removed: "${input.name}"`
    case 'add_rate_plan':     return `Rate plan added: "${input.name}"`
    case 'update_rate_plan':  return `Rate plan updated: "${input.name}"`
    case 'remove_rate_plan':  return `Rate plan removed: "${input.name}"`
    case 'set_distribution':  return `Distribution updated`
    case 'set_pms':           return `PMS connected: ${input.name}`
    case 'connect_channel':   return `Channel connected: ${input.channelName}`
    case 'add_competitor':    return `Competitor added: "${input.name}"`
    case 'remove_competitor': return `Competitor removed: "${input.name}"`
    case 'advance_step':      return `Moving to next step…`
    case 'navigate_to_step':  return `Navigating to ${input.stepId}`
    default:                  return 'Changes applied'
  }
}
