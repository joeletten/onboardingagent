'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KompasMessage, InteractiveArea, Button } from '../ui'
import { useOnboarding, ContinuePortal } from '../OnboardingContext'
import IconBrand from '../IconBrand'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getActiveChannels(data) {
  const channels = [{ id: 'direct', name: 'Direct Booking', brand: null }]
  const seen = new Set(['direct'])
  for (const ch of [
    ...(data.channelConnect || []).filter(c => c.connected),
    ...(data.otas || []).filter(o => o.connected),
  ]) {
    if (!seen.has(ch.id)) {
      seen.add(ch.id)
      channels.push({ id: ch.id, name: ch.name, brand: ch.brand || ch.id })
    }
  }
  return channels
}

function getEffectiveChannels(plan, allPlans) {
  if (plan.type === 'root') return plan.channels || 'all'
  const parent = allPlans.find(p => String(p.id) === String(plan.parentId))
  return parent ? getEffectiveChannels(parent, allPlans) : 'all'
}

function planAppliesToChannel(plan, channelId, allPlans) {
  const ch = getEffectiveChannels(plan, allPlans)
  return ch === 'all' || channelId === 'direct'
}

// Build initial distribution matrix
// For each channel × plan, default = all assigned rooms enabled
function buildDefaultMatrix(data) {
  const existing = data.distribution || {}
  const plans = data.ratePlans || []
  const channels = getActiveChannels(data)
  const matrix = {}

  for (const ch of channels) {
    matrix[ch.id] = {}
    for (const plan of plans) {
      if (planAppliesToChannel(plan, ch.id, plans)) {
        const saved = existing[ch.id]?.[plan.id]
        matrix[ch.id][plan.id] = saved !== undefined
          ? [...saved]
          : [...(plan.roomIds || [])]
      }
    }
  }
  return matrix
}

// ── Channel icon ──────────────────────────────────────────────────────────────

function ChannelIcon({ channel, size = 28 }) {
  if (channel.id === 'direct') {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-[rgba(18,95,227,0.1)] flex items-center justify-center flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5 text-[#125fe3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
    )
  }
  return <IconBrand name={channel.brand || channel.id} size={size} />
}

// ── Matrix cell ───────────────────────────────────────────────────────────────

function MatrixCell({ enabled, applicable, onClick }) {
  if (!applicable) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-4 h-px bg-[#e6e9ef]" />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        enabled
          ? 'bg-[#125fe3] hover:bg-[#0f4fc2]'
          : 'bg-[#f2f4f8] hover:bg-[#e6e9ef] border border-[#e6e9ef]'
      }`}
    >
      {enabled ? (
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <div className="w-2 h-2 rounded-sm border border-[#c8d0da]" />
      )}
    </button>
  )
}

// ── Distribution matrix for one channel ──────────────────────────────────────

function ChannelMatrix({ channel, plans, rooms, matrix, onChange, onBatchChange }) {
  const allPlansForChannel = plans.filter(p => planAppliesToChannel(p, channel.id, plans))
  const directOnlyPlans = plans.filter(p => !planAppliesToChannel(p, channel.id, plans))

  const toggleCell = (planId, roomId) => {
    const current = matrix[planId] || []
    const next = current.includes(roomId)
      ? current.filter(r => r !== roomId)
      : [...current, roomId]
    onChange(planId, next)
  }

  const toggleRow = (plan) => {
    const current = matrix[plan.id] || []
    const applicable = plan.roomIds || []
    // If all applicable rooms are already enabled → clear all, else enable all
    const allEnabled = applicable.every(r => current.includes(r))
    onChange(plan.id, allEnabled ? [] : [...applicable])
  }

  const toggleColumn = (room) => {
    const anyEnabled = allPlansForChannel.some(plan =>
      (plan.roomIds || []).includes(room.id) && (matrix[plan.id] || []).includes(room.id)
    )
    const updates = {}
    for (const plan of allPlansForChannel) {
      if (!(plan.roomIds || []).includes(room.id)) continue
      const current = matrix[plan.id] || []
      updates[plan.id] = anyEnabled
        ? current.filter(r => r !== room.id)
        : current.includes(room.id) ? current : [...current, room.id]
    }
    onBatchChange(updates)
  }

  if (allPlansForChannel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <svg className="w-8 h-8 text-[#a8b0bd] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <p className="text-[13px] font-medium text-[#52647a]">No rate plans available for this channel</p>
        <p className="text-[11px] text-[#a8b0bd] mt-1">All your rate plans are set to "Direct only".</p>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <p className="text-[13px] text-[#a8b0bd] italic py-4">No rooms have been set up yet.</p>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full border-collapse" style={{ minWidth: `${180 + rooms.length * 72}px` }}>
        <thead>
          <tr>
            {/* Rate plan label column */}
            <th className="text-left pb-3 pr-4" style={{ width: 180 }}>
              <span className="text-[10px] font-bold text-[#a8b0bd] uppercase tracking-widest">Rate Plan</span>
            </th>
            {/* Room columns */}
            {rooms.map(room => (
              <th key={room.id} className="pb-3" style={{ width: 72 }}>
                <button
                  type="button"
                  onClick={() => toggleColumn(room)}
                  className="flex flex-col items-center gap-1 group w-full"
                  title={`Toggle all for ${room.name}`}
                >
                  <span className="text-[11px] font-semibold text-[#52647a] group-hover:text-[#125fe3] transition-colors leading-tight text-center max-w-[60px] truncate block">
                    {room.name}
                  </span>
                  {room.isBase && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[rgba(18,95,227,0.08)] text-[#125fe3] uppercase tracking-wide">
                      Base
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allPlansForChannel.map((plan, rowIdx) => {
            const enabledRooms = matrix[plan.id] || []
            const applicableCount = (plan.roomIds || []).length
            const enabledCount = (plan.roomIds || []).filter(r => enabledRooms.includes(r)).length
            const isIndented = plan.type === 'derived'

            return (
              <tr
                key={plan.id}
                className={`border-t border-[#f2f4f8] ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}`}
              >
                {/* Plan name cell */}
                <td className="py-3 pr-4">
                  <div className={`flex items-center gap-2 ${isIndented ? 'pl-4' : ''}`}>
                    {isIndented && (
                      <div className="flex-shrink-0 w-3 h-3 border-l-2 border-b-2 border-[#d0d7e2] rounded-bl-sm -mt-2" />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleRow(plan)}
                      className="text-left group flex-1 min-w-0"
                      title="Toggle all rooms for this plan"
                    >
                      <p className="text-[13px] font-semibold text-[#1f2124] group-hover:text-[#125fe3] transition-colors truncate">
                        {plan.name}
                      </p>
                      <p className="text-[11px] text-[#a8b0bd] mt-0.5">
                        {enabledCount}/{applicableCount} room{applicableCount !== 1 ? 's' : ''}
                      </p>
                    </button>
                  </div>
                </td>
                {/* Room cells */}
                {rooms.map(room => {
                  const inPlan = (plan.roomIds || []).includes(room.id)
                  const enabled = enabledRooms.includes(room.id)
                  return (
                    <td key={room.id} className="py-3">
                      <div className="flex items-center justify-center">
                        <MatrixCell
                          enabled={enabled}
                          applicable={inPlan}
                          onClick={() => inPlan && toggleCell(plan.id, room.id)}
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}

          {/* Direct-only plans row (greyed out for non-direct channels) */}
          {channel.id !== 'direct' && directOnlyPlans.length > 0 && (
            <tr className="border-t border-[#f2f4f8] opacity-40">
              <td className="py-3 pr-4" colSpan={rooms.length + 1}>
                <p className="text-[12px] text-[#a8b0bd] italic">
                  {directOnlyPlans.map(p => p.name).join(', ')} — Direct only (not published here)
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Distribution() {
  const { data, setData, nextStep } = useOnboarding()

  const channels = useMemo(() => getActiveChannels(data), [data.channelConnect, data.otas])
  const plans = data.ratePlans || []
  const rooms = data.rooms || []

  // Local matrix state — synced to context on continue
  const [matrix, setMatrix] = useState(() => buildDefaultMatrix(data))
  const [activeChannelIdx, setActiveChannelIdx] = useState(0)

  const activeChannel = channels[activeChannelIdx]

  // Single plan update
  const updateCell = (planId, roomIds) => {
    setMatrix(prev => ({
      ...prev,
      [activeChannel.id]: { ...prev[activeChannel.id], [planId]: roomIds },
    }))
  }

  // Batch update for column toggles (multiple plans at once)
  const updateBatch = (updates) => {
    setMatrix(prev => ({
      ...prev,
      [activeChannel.id]: { ...prev[activeChannel.id], ...updates },
    }))
  }

  const handleContinue = () => {
    setData('distribution', matrix)
    nextStep()
  }

  const isLast = activeChannelIdx === channels.length - 1

  const emptyState = plans.length === 0 || rooms.length === 0

  return (
    <>
      <KompasMessage>
        <p>Now let's set up your <strong>distribution matrix</strong>.</p>
        <p className="mt-2 text-[#52647a]">
          For each channel, choose which rate plans and rooms to publish. Click a cell to toggle availability. Click a room name or plan name to toggle the entire column or row.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-3xl space-y-4">

          {emptyState ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#e6e9ef] rounded-xl text-center">
              <svg className="w-8 h-8 text-[#a8b0bd] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              <p className="text-[13px] font-medium text-[#52647a]">
                {plans.length === 0 ? 'No rate plans set up yet' : 'No rooms set up yet'}
              </p>
              <p className="text-[11px] text-[#a8b0bd] mt-1">
                Go back and set up {plans.length === 0 ? 'rate plans' : 'rooms'} first, then configure distribution here.
              </p>
            </div>
          ) : (
            <>
              {/* Channel tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {channels.map((ch, i) => {
                  const isActive = i === activeChannelIdx
                  const chMatrix = matrix[ch.id] || {}
                  const configured = Object.keys(chMatrix).length > 0

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChannelIdx(i)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                        isActive
                          ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)] shadow-sm'
                          : 'border-[#e6e9ef] bg-white hover:border-[#125fe3]/30 hover:bg-[rgba(18,95,227,0.02)]'
                      }`}
                    >
                      <ChannelIcon channel={ch} size={24} />
                      <span className={`text-[13px] font-medium ${isActive ? 'text-[#125fe3]' : 'text-[#52647a]'}`}>
                        {ch.name}
                      </span>
                      {configured && !isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Matrix panel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChannel.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white rounded-xl border border-[#e6e9ef] shadow-sm overflow-hidden"
                >
                  {/* Panel header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f2f4f8]">
                    <ChannelIcon channel={activeChannel} size={32} />
                    <div>
                      <p className="text-[14px] font-semibold text-[#1f2124]">{activeChannel.name}</p>
                      <p className="text-[11px] text-[#a8b0bd]">
                        {activeChannel.id === 'direct'
                          ? 'Your own website & booking engine'
                          : 'Online travel agency'}
                      </p>
                    </div>

                    {/* Legend */}
                    <div className="ml-auto flex items-center gap-3 text-[11px] text-[#a8b0bd]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-[#125fe3] flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span>Published</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-[#f2f4f8] border border-[#e6e9ef] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-sm border border-[#c8d0da]" />
                        </div>
                        <span>Not published</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-px bg-[#e6e9ef]" />
                        <span>Not applicable</span>
                      </div>
                    </div>
                  </div>

                  {/* Matrix */}
                  <div className="px-5 py-4">
                    <ChannelMatrix
                      channel={activeChannel}
                      plans={plans}
                      rooms={rooms}
                      matrix={matrix[activeChannel.id] || {}}
                      onChange={updateCell}
                      onBatchChange={updateBatch}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

            </>
          )}
        </div>
      </InteractiveArea>

      {/* Navigation — portaled after chat messages */}
      {!emptyState && (
        <ContinuePortal>
          <div>
            <div className="flex items-center gap-3">
              {!isLast ? (
                <>
                  <Button onClick={() => setActiveChannelIdx(i => i + 1)}>
                    Next: {channels[activeChannelIdx + 1]?.name} →
                  </Button>
                  <button
                    onClick={handleContinue}
                    className="text-[12px] text-[#a8b0bd] hover:text-[#52647a] transition-colors"
                  >
                    Save & finish all →
                  </button>
                </>
              ) : (
                <Button onClick={handleContinue}>Save distribution & continue</Button>
              )}
            </div>
            <p className="text-[11px] text-[#a8b0bd] mt-1">
              Channel {activeChannelIdx + 1} of {channels.length}
              {' · '}
              {plans.filter(p => planAppliesToChannel(p, activeChannel.id, plans)).length} applicable rate plan{plans.length !== 1 ? 's' : ''}
            </p>
          </div>
        </ContinuePortal>
      )}

      {emptyState && (
        <ContinuePortal>
          <button
            onClick={handleContinue}
            className="text-[12px] text-[#a8b0bd] hover:text-[#52647a] transition-colors"
          >
            Skip for now →
          </button>
        </ContinuePortal>
      )}
    </>
  )
}
