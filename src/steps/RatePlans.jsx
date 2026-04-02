'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KompasMessage, InteractiveArea, Button } from '../ui'
import { useOnboarding } from '../OnboardingContext'

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS = { EUR: '€', GBP: '£', CHF: 'Fr.', USD: '$', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč' }

function getCurrSymbol(c) { return CURRENCY_SYMBOLS[c] || '€' }

const WIZARD_STEPS = ['Basics', 'Pricing', 'Distribution', 'Rooms', 'Extras']

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyPlan() {
  return {
    id: Date.now() + Math.random(),
    name: '',
    type: 'root',
    parentId: null,
    floorPrice: '',
    offsetDirection: '+',
    offsetType: 'percentage',
    offsetValue: '',
    channels: 'all',
    roomIds: [],
    extraIds: [],
  }
}

function computeDerivedFloor(parent, plan) {
  const base = parseFloat(parent?.floorPrice) || 0
  if (!base) return null
  const val = parseFloat(plan.offsetValue) || 0
  const dir = plan.offsetDirection === '-' ? -1 : 1
  if (plan.offsetType === 'percentage') return Math.round(base * (1 + dir * val / 100))
  return Math.round(base + dir * val)
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = `w-full px-3 py-2 rounded-lg border border-[#e6e9ef] bg-white text-[13px] text-[#1f2124]
  focus:outline-none focus:ring-2 focus:ring-[#125fe3]/20 focus:border-[#125fe3] transition-all placeholder:text-[#a8b0bd]`
const labelCls = 'text-[11px] font-bold text-[#1f2124] uppercase tracking-wide block mb-1.5'
const optBtn = (active) =>
  `flex-1 py-2 px-3 rounded-lg text-[12px] font-medium border text-center transition-all ${
    active
      ? 'bg-[rgba(18,95,227,0.06)] border-[#125fe3] text-[#125fe3]'
      : 'bg-white border-[#e6e9ef] text-[#52647a] hover:border-[#125fe3]/30'
  }`

// ── Wizard step components ─────────────────────────────────────────────────────

function StepBasics({ form, onChange, existingRoots }) {
  const hasRoots = existingRoots.length > 0
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Rate plan name</label>
        <input
          className={inputCls}
          placeholder="e.g. Flexible Rate, Non-refundable, Breakfast Included"
          value={form.name}
          onChange={e => onChange('name', e.target.value)}
          autoFocus
        />
      </div>

      {hasRoots ? (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Plan type</label>
            <div className="flex gap-2">
              {[
                ['root', 'Root rate', 'Has its own floor price'],
                ['derived', 'Derived rate', 'Offsets from an existing root rate'],
              ].map(([val, title, desc]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange('type', val)}
                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                    form.type === val
                      ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)]'
                      : 'border-[#e6e9ef] bg-white hover:border-[#125fe3]/30'
                  }`}
                >
                  <p className={`text-[13px] font-semibold ${form.type === val ? 'text-[#125fe3]' : 'text-[#1f2124]'}`}>{title}</p>
                  <p className="text-[11px] text-[#a8b0bd] mt-0.5 leading-snug">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.type === 'derived' && (
            <div>
              <label className={labelCls}>Derive from</label>
              <select
                className={inputCls}
                value={form.parentId || ''}
                onChange={e => onChange('parentId', e.target.value)}
              >
                <option value="">Select a root rate…</option>
                {existingRoots.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-start gap-2.5 p-3 bg-[rgba(18,95,227,0.05)] rounded-lg border border-[rgba(18,95,227,0.15)]">
          <svg className="w-4 h-4 text-[#125fe3] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <p className="text-[12px] text-[#125fe3] leading-relaxed">
            Your first rate plan will be a <strong>root rate</strong> — the foundation all other plans derive from.
          </p>
        </div>
      )}
    </div>
  )
}

function StepPricing({ form, onChange, currSymbol, parentPlan }) {
  const isRoot = form.type === 'root'
  const derivedFloor = !isRoot ? computeDerivedFloor(parentPlan, form) : null

  return (
    <div className="space-y-4">
      {isRoot ? (
        <div>
          <label className={labelCls}>Minimum floor price per night</label>
          <p className="text-[11px] text-[#a8b0bd] mb-2 leading-relaxed">
            This is the lowest price this plan can ever be sold at — a safety net below your dynamic pricing.
          </p>
          <div className="relative max-w-[140px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#a8b0bd] pointer-events-none">{currSymbol}</span>
            <input
              type="number"
              min={0}
              className={`${inputCls} pl-7`}
              placeholder="e.g. 80"
              value={form.floorPrice}
              onChange={e => onChange('floorPrice', e.target.value)}
              autoFocus
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Price offset from "{parentPlan?.name || 'root rate'}"</label>
            <p className="text-[11px] text-[#a8b0bd] mb-3 leading-relaxed">
              This plan will always be priced relative to its root rate.
            </p>
            <div className="flex items-center gap-2">
              {/* Direction */}
              <div className="flex rounded border border-[#e6e9ef] overflow-hidden">
                {['+', '-'].map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => onChange('offsetDirection', dir)}
                    className={`px-3.5 h-11 text-[14px] font-bold transition-colors ${
                      form.offsetDirection === dir
                        ? 'bg-[#125fe3] text-white'
                        : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
              {/* Value */}
              <input
                type="number"
                min={0}
                className="px-2.5 h-11 rounded border border-[#e6e9ef] bg-white text-[14px] text-[#1f2124] w-20 text-center
                  hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20 outline-none transition-all"
                placeholder="10"
                value={form.offsetValue}
                onChange={e => onChange('offsetValue', e.target.value)}
              />
              {/* Type */}
              <div className="flex rounded border border-[#e6e9ef] overflow-hidden">
                {[['percentage', '%'], ['fixed', currSymbol]].map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onChange('offsetType', val)}
                    className={`px-3.5 h-11 text-[14px] font-semibold transition-colors ${
                      form.offsetType === val
                        ? 'bg-[#125fe3] text-white'
                        : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {parentPlan?.floorPrice && (
            <div className="rounded-lg border border-[#e6e9ef] bg-[#f9fafb] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#a8b0bd]">Floor of "{parentPlan.name}"</span>
                <span className="text-[12px] font-bold text-[#1f2124]">
                  {currSymbol}{parentPlan.floorPrice}
                  {form.offsetValue ? (
                    <span className="ml-1.5 text-[12px] font-normal text-[#a8b0bd]">
                      → <strong className="text-[#1f2124]">{currSymbol}{derivedFloor}</strong>
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StepDistribution({ form, onChange }) {
  const isRoot = form.type === 'root'
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Channel availability</label>
        {isRoot ? (
          <>
            <p className="text-[11px] text-[#a8b0bd] mb-3 leading-relaxed">
              Choose where this rate plan can be booked. Derived plans inherit this setting.
            </p>
            <div className="flex gap-2">
              {[
                ['all', 'All channels', 'Available on OTAs and direct booking'],
                ['direct', 'Direct only', 'Exclusively for your direct booking channel'],
              ].map(([val, title, desc]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange('channels', val)}
                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                    form.channels === val
                      ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)]'
                      : 'border-[#e6e9ef] bg-white hover:border-[#125fe3]/30'
                  }`}
                >
                  <p className={`text-[13px] font-semibold ${form.channels === val ? 'text-[#125fe3]' : 'text-[#1f2124]'}`}>{title}</p>
                  <p className="text-[11px] text-[#a8b0bd] mt-0.5 leading-snug">{desc}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-[#e6e9ef] bg-[#f9fafb]">
            <svg className="w-4 h-4 text-[#a8b0bd] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <p className="text-[12px] text-[#52647a]">
              Channel availability is <strong>inherited from the root rate</strong>. Derived plans cannot override this.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StepRooms({ form, onChange, rooms }) {
  const toggleRoom = (id) => {
    const ids = form.roomIds.includes(id)
      ? form.roomIds.filter(r => r !== id)
      : [...form.roomIds, id]
    onChange('roomIds', ids)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Applicable rooms</label>
        <p className="text-[11px] text-[#a8b0bd] mb-3 leading-relaxed">
          Select which room types this rate plan applies to.
        </p>
        {rooms.length === 0 ? (
          <p className="text-[13px] text-[#a8b0bd] italic">No rooms set up yet — you can assign rooms later.</p>
        ) : (
          <div className="space-y-2">
            {rooms.map(room => {
              const selected = form.roomIds.includes(room.id)
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => toggleRoom(room.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    selected
                      ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)]'
                      : 'border-[#e6e9ef] bg-white hover:border-[#125fe3]/30'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                    selected ? 'bg-[#125fe3] border-[#125fe3]' : 'border-[#d0d7e2]'
                  }`}>
                    {selected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium ${selected ? 'text-[#125fe3]' : 'text-[#1f2124]'}`}>{room.name}</p>
                    {room.count && <p className="text-[11px] text-[#a8b0bd]">{room.count} room{room.count !== '1' ? 's' : ''}</p>}
                  </div>
                  {room.isBase && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(18,95,227,0.08)] text-[#125fe3] uppercase tracking-wide flex-shrink-0">Base</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StepExtras({ form, onChange, extras }) {
  const toggleExtra = (id) => {
    const ids = form.extraIds.includes(id)
      ? form.extraIds.filter(e => e !== id)
      : [...form.extraIds, id]
    onChange('extraIds', ids)
  }

  const typeColors = {
    extra: 'bg-blue-50 text-blue-700',
    fee: 'bg-amber-50 text-amber-700',
    discount: 'bg-green-50 text-green-700',
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Included extras</label>
        <p className="text-[11px] text-[#a8b0bd] mb-3 leading-relaxed">
          Optionally bundle extras, fees, or discounts with this rate plan.
        </p>
        {extras.length === 0 ? (
          <p className="text-[13px] text-[#a8b0bd] italic">No extras set up yet — you can add them later.</p>
        ) : (
          <div className="space-y-2">
            {extras.map(extra => {
              const selected = form.extraIds.includes(extra.id)
              return (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    selected
                      ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)]'
                      : 'border-[#e6e9ef] bg-white hover:border-[#125fe3]/30'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                    selected ? 'bg-[#125fe3] border-[#125fe3]' : 'border-[#d0d7e2]'
                  }`}>
                    {selected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium ${selected ? 'text-[#125fe3]' : 'text-[#1f2124]'}`}>{extra.name}</p>
                    <p className="text-[11px] text-[#a8b0bd]">
                      {extra.itemType === 'discount' ? `−${extra.percentage}%` : `€${extra.price}`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${typeColors[extra.itemType] || typeColors.extra}`}>
                    {extra.itemType}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Wizard container ───────────────────────────────────────────────────────────

function RatePlanWizard({ existingPlans, rooms, extras, currSymbol, onSave, onCancel }) {
  const [step, setStep] = useState(0) // 0-indexed
  const [form, setForm] = useState(emptyPlan)

  const existingRoots = existingPlans.filter(p => p.type === 'root')
  const parentPlan = existingRoots.find(r => String(r.id) === String(form.parentId))

  const onChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const canNext = [
    // Step 0 — Basics
    form.name.trim() && (form.type === 'root' || form.parentId),
    // Step 1 — Pricing
    form.type === 'root' ? !!form.floorPrice : !!form.offsetValue,
    // Step 2 — Distribution
    true,
    // Step 3 — Rooms
    true,
    // Step 4 — Extras (final)
    true,
  ][step]

  const isLast = step === WIZARD_STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onSave({ ...form, id: Date.now() + Math.random() })
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-xl border-2 border-dashed border-[rgba(18,95,227,0.25)] overflow-hidden"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-1.5 px-5 pt-4 pb-3 border-b border-[#f2f4f8]">
        {WIZARD_STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-[#125fe3] text-white' :
                'bg-[#f2f4f8] text-[#a8b0bd]'
              }`}>
                {i < step ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${
                i === step ? 'text-[#125fe3]' : i < step ? 'text-green-600' : 'text-[#a8b0bd]'
              }`}>{label}</span>
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-px transition-all ${i < step ? 'bg-green-300' : 'bg-[#e6e9ef]'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {step === 0 && <StepBasics form={form} onChange={onChange} existingRoots={existingRoots} />}
            {step === 1 && <StepPricing form={form} onChange={onChange} currSymbol={currSymbol} parentPlan={parentPlan} />}
            {step === 2 && <StepDistribution form={form} onChange={onChange} />}
            {step === 3 && <StepRooms form={form} onChange={onChange} rooms={rooms} />}
            {step === 4 && <StepExtras form={form} onChange={onChange} extras={extras} />}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#f2f4f8]">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>
          )}
          <Button onClick={handleNext} disabled={!canNext}>
            {isLast ? 'Add rate plan' : 'Next →'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Rate plan card ─────────────────────────────────────────────────────────────

function PlanCard({ plan, isRoot, parentPlan, rooms, extras, currSymbol, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const assignedRooms = rooms.filter(r => plan.roomIds.includes(r.id))
  const assignedExtras = extras.filter(e => plan.extraIds.includes(e.id))

  const effectiveChannels = isRoot ? plan.channels : parentPlan?.channels || plan.channels
  const derivedFloor = !isRoot && parentPlan ? computeDerivedFloor(parentPlan, plan) : null

  const offsetLabel = !isRoot && plan.offsetValue
    ? `${plan.offsetDirection === '-' ? '−' : '+'}${plan.offsetValue}${plan.offsetType === 'percentage' ? '%' : currSymbol}`
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-lg border border-[#e6e9ef] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04),0px_1px_3px_0px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isRoot ? 'bg-[rgba(18,95,227,0.08)]' : 'bg-[#f2f4f8]'
        }`}>
          <svg className={`w-4 h-4 ${isRoot ? 'text-[#125fe3]' : 'text-[#a8b0bd]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isRoot
              ? <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              : <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            }
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-[#1f2124]">{plan.name}</p>
            {isRoot && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(18,95,227,0.08)] text-[#125fe3] uppercase tracking-wide">
                Root
              </span>
            )}
            {!isRoot && offsetLabel && (
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                plan.offsetDirection === '-' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
              }`}>
                {offsetLabel}
              </span>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              effectiveChannels === 'direct' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {effectiveChannels === 'direct' ? 'Direct only' : 'All channels'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 text-[12px] text-[#a8b0bd] flex-wrap">
            {isRoot && plan.floorPrice && (
              <span>Floor {currSymbol}{plan.floorPrice}/night</span>
            )}
            {!isRoot && derivedFloor && plan.floorPrice !== '' && (
              <span>Floor → {currSymbol}{derivedFloor}/night</span>
            )}
            {assignedRooms.length > 0 && (
              <>
                <span className="text-[#e6e9ef]">·</span>
                <span>{assignedRooms.length} room{assignedRooms.length !== 1 ? 's' : ''}</span>
              </>
            )}
            {assignedExtras.length > 0 && (
              <>
                <span className="text-[#e6e9ef]">·</span>
                <span>{assignedExtras.length} extra{assignedExtras.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {(assignedRooms.length > 0 || assignedExtras.length > 0) && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded text-[#a8b0bd] hover:text-[#52647a] hover:bg-[#f2f4f8] transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-[#a8b0bd] hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-[#f2f4f8] pt-3">
              {assignedRooms.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#a8b0bd] uppercase tracking-widest mb-1.5">Rooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedRooms.map(r => (
                      <span key={r.id} className="text-[11px] px-2 py-0.5 rounded bg-[#f2f4f8] text-[#52647a]">{r.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {assignedExtras.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#a8b0bd] uppercase tracking-widest mb-1.5">Extras</p>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedExtras.map(e => (
                      <span key={e.id} className="text-[11px] px-2 py-0.5 rounded bg-[#f2f4f8] text-[#52647a]">{e.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Plan tree renderer ─────────────────────────────────────────────────────────

function PlanTree({ plans, rooms, extras, currSymbol, onDelete }) {
  const roots = plans.filter(p => p.type === 'root')
  const derived = plans.filter(p => p.type === 'derived')
  // Plans with no valid parent still render at root level
  const orphans = derived.filter(p => !roots.find(r => String(r.id) === String(p.parentId)))

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {[...roots, ...orphans].map(root => (
          <div key={root.id}>
            <PlanCard
              plan={root}
              isRoot={root.type === 'root'}
              parentPlan={null}
              rooms={rooms}
              extras={extras}
              currSymbol={currSymbol}
              onDelete={() => onDelete(root.id)}
            />
            {/* Derived plans under this root */}
            {derived
              .filter(p => String(p.parentId) === String(root.id))
              .map(child => (
                <div key={child.id} className="ml-6 mt-2 relative">
                  {/* Connector */}
                  <div className="absolute -left-3 top-0 bottom-0 w-px bg-[#e6e9ef]" />
                  <div className="absolute -left-3 top-5 w-3 h-px bg-[#e6e9ef]" />
                  <PlanCard
                    plan={child}
                    isRoot={false}
                    parentPlan={root}
                    rooms={rooms}
                    extras={extras}
                    currSymbol={currSymbol}
                    onDelete={() => onDelete(child.id)}
                  />
                </div>
              ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RatePlans() {
  const { data, setData, nextStep } = useOnboarding()
  const [showWizard, setShowWizard] = useState(false)

  const plans = data.ratePlans || []
  const rooms = data.rooms || []
  const extras = data.extras || []
  const currency = data.settings?.localization?.currency || 'EUR'
  const currSymbol = getCurrSymbol(currency)

  const addPlan = (plan) => {
    setData('ratePlans', [...plans, plan])
    setShowWizard(false)
  }

  const deletePlan = (id) => {
    // Also remove any derived plans that depended on this one
    setData('ratePlans', plans.filter(p => p.id !== id && String(p.parentId) !== String(id)))
  }

  return (
    <>
      <KompasMessage>
        <p>Now let's set up your <strong>rate plans</strong>.</p>
        <p className="mt-2 text-[#52647a]">
          Rate plans are the conditions under which you offer a price — think "Flexible Rate", "Non-refundable", or "Breakfast Included". Start with a <strong>root rate</strong> (your base offering), then optionally derive others from it with a price offset.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-xl space-y-3">

          {/* Plan tree */}
          {plans.length > 0 && (
            <PlanTree
              plans={plans}
              rooms={rooms}
              extras={extras}
              currSymbol={currSymbol}
              onDelete={deletePlan}
            />
          )}

          {/* Empty state */}
          {plans.length === 0 && !showWizard && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#e6e9ef] rounded-lg">
              <svg className="w-8 h-8 text-[#a8b0bd] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <p className="text-[13px] font-medium text-[#52647a] mb-3">No rate plans yet</p>
              <Button onClick={() => setShowWizard(true)}>Create your first rate plan</Button>
            </div>
          )}

          {/* Wizard */}
          <AnimatePresence>
            {showWizard && (
              <RatePlanWizard
                key="wizard"
                existingPlans={plans}
                rooms={rooms}
                extras={extras}
                currSymbol={currSymbol}
                onSave={addPlan}
                onCancel={() => setShowWizard(false)}
              />
            )}
          </AnimatePresence>

          {/* Add another button */}
          {!showWizard && plans.length > 0 && (
            <button
              onClick={() => setShowWizard(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[#e6e9ef]
                text-[13px] font-medium text-[#52647a] hover:text-[#125fe3] hover:border-[rgba(18,95,227,0.3)] hover:bg-[rgba(18,95,227,0.03)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add another rate plan
            </button>
          )}

          {/* Continue */}
          {!showWizard && plans.length > 0 && (
            <div className="pt-2">
              <Button onClick={() => { setData('ratePlans', plans); nextStep() }}>
                Save rate plans & continue
              </Button>
              <p className="text-[12px] text-[#a8b0bd] mt-2">
                {plans.length} rate plan{plans.length !== 1 ? 's' : ''}
                {' · '}
                {plans.filter(p => p.type === 'root').length} root,{' '}
                {plans.filter(p => p.type === 'derived').length} derived
              </p>
            </div>
          )}

          {/* Skip */}
          {!showWizard && plans.length === 0 && (
            <>
              <div className="pt-1 border-t border-[#e6e9ef]" />
              <button
                onClick={() => { setData('ratePlans', []); nextStep() }}
                className="text-[12px] text-[#a8b0bd] hover:text-[#52647a] transition-colors"
              >
                Skip for now — set up rate plans later →
              </button>
            </>
          )}
        </div>
      </InteractiveArea>
    </>
  )
}
