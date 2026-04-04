'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KompasMessage, InteractiveArea, Button } from '../ui'
import { useOnboarding, ContinuePortal } from '../OnboardingContext'
import { validateMinLength, validateNumberRange } from '../validation'

// ── Constants ─────────────────────────────────────────────────────────────────

import { getCurrSymbol } from '../currency'

const WIZARD_STEPS = ['Basics', 'Pricing', 'Distribution', 'Rooms', 'Extras']

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyPlan() {
  return {
    id: Date.now() + Math.random(),
    name: '',
    type: 'root',
    parentId: null,
    refundable: true,
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

function StepBasics({ form, onChange, existingRoots, errors }) {
  const hasRoots = existingRoots.length > 0
  const nameErr = errors?.name
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Rate plan name</label>
        <input
          className={`${inputCls} ${nameErr ? '!border-[#d93025] focus:!ring-[#d93025]/20 focus:!border-[#d93025]' : ''}`}
          placeholder="e.g. Flexible Rate, Non-refundable, Breakfast Included"
          value={form.name}
          onChange={e => onChange('name', e.target.value)}
          autoFocus
        />
        {nameErr && (
          <p className="flex items-center gap-1 text-[12px] text-[#d93025] mt-1 leading-4">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10.5a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
            </svg>
            {nameErr}
          </p>
        )}
      </div>

      <div>
        <label className={labelCls}>Cancellation policy</label>
        <div className="flex gap-2">
          {[
            [true, 'Refundable', 'Guests can cancel for free'],
            [false, 'Non-refundable', 'No cancellations allowed'],
          ].map(([val, title, desc]) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => onChange('refundable', val)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                form.refundable === val
                  ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)]'
                  : 'border-[#e6e9ef] bg-white hover:border-[#125fe3]/30'
              }`}
            >
              <p className={`text-[13px] font-semibold ${form.refundable === val ? 'text-[#125fe3]' : 'text-[#1f2124]'}`}>{title}</p>
              <p className="text-[11px] text-[#a8b0bd] mt-0.5 leading-snug">{desc}</p>
            </button>
          ))}
        </div>
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

function StepPricing({ form, onChange, currSymbol, parentPlan, errors }) {
  const isRoot = form.type === 'root'
  const derivedFloor = !isRoot ? computeDerivedFloor(parentPlan, form) : null
  const floorErr = errors?.floorPrice
  const offsetErr = errors?.offsetValue

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
              className={`${inputCls} pl-7 ${floorErr ? '!border-[#d93025] focus:!ring-[#d93025]/20 focus:!border-[#d93025]' : ''}`}
              placeholder="e.g. 80"
              value={form.floorPrice}
              onChange={e => onChange('floorPrice', e.target.value)}
              autoFocus
            />
          </div>
          {floorErr && (
            <p className="flex items-center gap-1 text-[12px] text-[#d93025] mt-1 leading-4">
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10.5a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
              </svg>
              {floorErr}
            </p>
          )}
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
                ['all', 'OTAs + direct website', 'Distributed to Booking.com, Expedia, Airbnb, and other OTAs, as well as your own booking website'],
                ['direct', 'Direct website only', 'Exclusively on your own booking website — commission-free. Lighthouse can set one up for you.'],
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
              Channel availability is <strong>inherited from the root rate</strong>. Whether this plan appears on OTAs (Booking.com, Expedia, etc.) or only on your direct booking website is controlled by the root rate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function roomEffectivePrice(room) {
  if (room.isBase) return 100
  const value = parseFloat(room.offsetValue) || 0
  const dir = room.offsetDirection === '-' ? -1 : 1
  if (room.offsetType === 'percentage') return Math.round(100 * (1 + dir * value / 100))
  return Math.round(100 + dir * value)
}

function StepRooms({ form, onChange, rooms }) {
  const toggleRoom = (id) => {
    const ids = form.roomIds.includes(id)
      ? form.roomIds.filter(r => r !== id)
      : [...form.roomIds, id]
    onChange('roomIds', ids)
  }

  const sortedRooms = [...rooms].sort((a, b) => roomEffectivePrice(a) - roomEffectivePrice(b))

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
            {sortedRooms.map(room => {
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

function StepExtras({ form, onChange, extras, currSymbol }) {
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
                      {extra.itemType === 'discount' ? `−${extra.percentage}%` : `${currSymbol}${extra.price}`}
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
  const [stepErrors, setStepErrors] = useState({})

  const existingRoots = existingPlans.filter(p => p.type === 'root')
  const parentPlan = existingRoots.find(r => String(r.id) === String(form.parentId))

  const onChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setStepErrors(e => ({ ...e, [key]: null }))
  }

  const validateStep = (s) => {
    const errs = {}
    if (s === 0) {
      if (!form.name.trim()) errs.name = 'Rate plan name is required'
      else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
      if (form.type === 'derived' && !form.parentId) errs.parentId = 'Please select a root rate'
    }
    if (s === 1) {
      if (form.type === 'root') {
        if (!form.floorPrice) errs.floorPrice = 'Floor price is required'
        else if (parseFloat(form.floorPrice) <= 0) errs.floorPrice = 'Floor price must be greater than 0'
        else if (parseFloat(form.floorPrice) > 10000) errs.floorPrice = 'Floor price cannot exceed 10,000'
      } else {
        if (!form.offsetValue) errs.offsetValue = 'Offset value is required'
        else if (parseFloat(form.offsetValue) <= 0) errs.offsetValue = 'Offset must be greater than 0'
      }
    }
    setStepErrors(errs)
    return Object.keys(errs).length === 0
  }

  const canNext = [
    form.name.trim() && (form.type === 'root' || form.parentId),
    form.type === 'root' ? !!form.floorPrice : !!form.offsetValue,
    true,
    true,
    true,
  ][step]

  const isLast = step === WIZARD_STEPS.length - 1

  const handleNext = () => {
    if (!validateStep(step)) return
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
            {step === 0 && <StepBasics form={form} onChange={onChange} existingRoots={existingRoots} errors={stepErrors} />}
            {step === 1 && <StepPricing form={form} onChange={onChange} currSymbol={currSymbol} parentPlan={parentPlan} errors={stepErrors} />}
            {step === 2 && <StepDistribution form={form} onChange={onChange} />}
            {step === 3 && <StepRooms form={form} onChange={onChange} rooms={rooms} />}
            {step === 4 && <StepExtras form={form} onChange={onChange} extras={extras} currSymbol={currSymbol} />}
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

function PlanCard({ plan, isRoot, parentPlan, rooms, extras, currSymbol, onDelete, onEdit, isEditing, onSaveEdit, existingRoots }) {
  const [expanded, setExpanded] = useState(false)
  const [editForm, setEditForm] = useState(null)

  // Initialize edit form when entering edit mode
  React.useEffect(() => {
    if (isEditing) setEditForm({ ...plan })
    else setEditForm(null)
  }, [isEditing])

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
              plan.refundable === false ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {plan.refundable === false ? 'Non-refundable' : 'Refundable'}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              effectiveChannels === 'direct' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {effectiveChannels === 'direct' ? 'Direct website only' : 'OTAs + direct'}
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
          <Button variant="secondary" size="sm" onClick={onEdit}>
            {isEditing ? 'Close' : 'Edit'}
          </Button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-[#a8b0bd] hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && !isEditing && (
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

      {/* Inline edit form */}
      <AnimatePresence>
        {isEditing && editForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#f2f4f8] pt-3 space-y-3">
              {/* Name */}
              <div>
                <label className={labelCls}>Rate plan name</label>
                <input className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              {/* Refundable */}
              <div>
                <label className={labelCls}>Cancellation policy</label>
                <div className="flex gap-2">
                  {[[true, 'Refundable'], [false, 'Non-refundable']].map(([val, title]) => (
                    <button key={String(val)} type="button" onClick={() => setEditForm(f => ({ ...f, refundable: val }))}
                      className={`flex-1 py-2 rounded-lg border text-[12px] font-medium text-center transition-all ${
                        editForm.refundable === val ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)] text-[#125fe3]' : 'border-[#e6e9ef] bg-white text-[#52647a] hover:border-[#125fe3]/30'
                      }`}>{title}</button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              {isRoot ? (
                <div>
                  <label className={labelCls}>Floor price</label>
                  <div className="relative max-w-[140px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#a8b0bd]">{currSymbol}</span>
                    <input type="number" min={0} className={`${inputCls} pl-7`} value={editForm.floorPrice} onChange={e => setEditForm(f => ({ ...f, floorPrice: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <div>
                  <label className={labelCls}>Price offset</label>
                  <div className="flex items-center gap-1.5">
                    <div className="flex rounded border border-[#e6e9ef] overflow-hidden">
                      {['+', '-'].map(dir => (
                        <button key={dir} type="button" onClick={() => setEditForm(f => ({ ...f, offsetDirection: dir }))}
                          className={`px-3 h-9 text-[13px] font-bold transition-colors ${editForm.offsetDirection === dir ? 'bg-[#125fe3] text-white' : 'bg-white text-[#52647a]'}`}>{dir}</button>
                      ))}
                    </div>
                    <input type="number" min={0} className="px-2 h-9 rounded border border-[#e6e9ef] bg-white text-[13px] text-center w-16 outline-none focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20 transition-all"
                      value={editForm.offsetValue} onChange={e => setEditForm(f => ({ ...f, offsetValue: e.target.value }))} />
                    <div className="flex rounded border border-[#e6e9ef] overflow-hidden">
                      {[['percentage', '%'], ['fixed', currSymbol]].map(([val, lbl]) => (
                        <button key={val} type="button" onClick={() => setEditForm(f => ({ ...f, offsetType: val }))}
                          className={`px-3 h-9 text-[13px] font-semibold transition-colors ${editForm.offsetType === val ? 'bg-[#125fe3] text-white' : 'bg-white text-[#52647a]'}`}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Channels (root only) */}
              {isRoot && (
                <div>
                  <label className={labelCls}>Channel availability</label>
                  <div className="flex gap-2">
                    {[['all', 'OTAs + direct website'], ['direct', 'Direct website only']].map(([val, title]) => (
                      <button key={val} type="button" onClick={() => setEditForm(f => ({ ...f, channels: val }))}
                        className={`flex-1 py-2 rounded-lg border text-[12px] font-medium text-center transition-all ${
                          editForm.channels === val ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)] text-[#125fe3]' : 'border-[#e6e9ef] bg-white text-[#52647a] hover:border-[#125fe3]/30'
                        }`}>{title}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Room selection */}
              {rooms.length > 0 && (
                <div>
                  <label className={labelCls}>Rooms</label>
                  <div className="flex flex-wrap gap-1.5">
                    {rooms.map(room => {
                      const sel = editForm.roomIds.includes(room.id)
                      return (
                        <button key={room.id} type="button"
                          onClick={() => setEditForm(f => ({ ...f, roomIds: sel ? f.roomIds.filter(id => id !== room.id) : [...f.roomIds, room.id] }))}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                            sel ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)] text-[#125fe3]' : 'border-[#e6e9ef] bg-white text-[#52647a] hover:border-[#125fe3]/30'
                          }`}>{room.name}</button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Extras selection */}
              {extras.length > 0 && (
                <div>
                  <label className={labelCls}>Extras</label>
                  <div className="flex flex-wrap gap-1.5">
                    {extras.map(extra => {
                      const sel = editForm.extraIds.includes(extra.id)
                      return (
                        <button key={extra.id} type="button"
                          onClick={() => setEditForm(f => ({ ...f, extraIds: sel ? f.extraIds.filter(id => id !== extra.id) : [...f.extraIds, extra.id] }))}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                            sel ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)] text-[#125fe3]' : 'border-[#e6e9ef] bg-white text-[#52647a] hover:border-[#125fe3]/30'
                          }`}>{extra.name}</button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button onClick={() => editForm.name.trim() && onSaveEdit(editForm)} disabled={!editForm.name.trim()}>Save changes</Button>
                <Button variant="ghost" onClick={onEdit}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Plan tree renderer ─────────────────────────────────────────────────────────

function PlanTree({ plans, rooms, extras, currSymbol, onDelete, editingId, onEdit, onSaveEdit }) {
  const roots = plans.filter(p => p.type === 'root')
  const derived = plans.filter(p => p.type === 'derived')
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
              onEdit={() => onEdit(editingId === root.id ? null : root.id)}
              isEditing={editingId === root.id}
              onSaveEdit={onSaveEdit}
              existingRoots={roots}
            />
            {derived
              .filter(p => String(p.parentId) === String(root.id))
              .map(child => (
                <div key={child.id} className="ml-6 mt-2 relative">
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
                    onEdit={() => onEdit(editingId === child.id ? null : child.id)}
                    isEditing={editingId === child.id}
                    onSaveEdit={onSaveEdit}
                    existingRoots={roots}
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
  const [editingId, setEditingId] = useState(null)

  const plans = data.ratePlans || []
  const rooms = data.rooms || []
  const extras = data.extras || []
  const currency = data.settings?.localization?.currency || 'EUR'
  const currSymbol = getCurrSymbol(currency)

  const addPlan = (plan) => {
    setData('ratePlans', [...plans, plan])
    setShowWizard(false)
  }

  const updatePlan = (updated) => {
    setData('ratePlans', plans.map(p => p.id === updated.id ? updated : p))
    setEditingId(null)
  }

  const deletePlan = (id) => {
    setData('ratePlans', plans.filter(p => p.id !== id && String(p.parentId) !== String(id)))
    if (editingId === id) setEditingId(null)
  }

  return (
    <>
      <KompasMessage>
        <p>Now let's set up your <strong>rate plans</strong> — these are central to how Lighthouse manages your pricing.</p>
        <p className="mt-2 text-[#52647a]">
          A rate plan defines <strong>the terms under which a guest books a room</strong>. The same room can be sold under different rate plans, each with its own conditions and price. For example:
        </p>
        <ul className="mt-1.5 text-[#52647a] space-y-1 text-[13px]">
          <li><strong>Flexible Rate</strong> — full price, but guests can cancel for free. This is usually your default.</li>
          <li><strong>Non-refundable</strong> — 10% cheaper, but no cancellations. Guarantees revenue.</li>
          <li><strong>Breakfast Included</strong> — slightly higher price, but includes breakfast. Adds perceived value.</li>
        </ul>
        <p className="mt-2 text-[#52647a]">
          You'll start by creating a <strong>root rate</strong> — your main offering with a floor price (the lowest it can ever go). Then you can create <strong>derived rates</strong> that are automatically priced relative to it (e.g. Non-refundable at −10%). When Lighthouse adjusts your pricing, all derived rates move together.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-xl space-y-3">

          {/* Visual example — only shown before any plans are created */}
          {plans.length === 0 && !showWizard && (
            <div className="rounded-xl border border-[#e6e9ef] bg-white overflow-hidden">
              <div className="px-4 py-3 bg-[#f9fafb] border-b border-[#e6e9ef]">
                <p className="text-[11px] font-bold text-[#a8b0bd] uppercase tracking-widest">How rate plans work — example</p>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#125fe3]" />
                    <span className="text-[13px] font-semibold text-[#1f2124]">Flexible Rate</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(18,95,227,0.08)] text-[#125fe3] uppercase">Root</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#1f2124]">{currSymbol}120</span>
                </div>
                <div className="flex items-center justify-between ml-4 pl-3 border-l-2 border-[#e6e9ef]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#52647a]">Non-refundable</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600">−10%</span>
                  </div>
                  <span className="text-[13px] text-[#52647a]">{currSymbol}108</span>
                </div>
                <div className="flex items-center justify-between ml-4 pl-3 border-l-2 border-[#e6e9ef]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#52647a]">Breakfast Included</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">+{currSymbol}15</span>
                  </div>
                  <span className="text-[13px] text-[#52647a]">{currSymbol}135</span>
                </div>
                <p className="text-[11px] text-[#a8b0bd] pt-1 border-t border-[#f2f4f8]">
                  When Lighthouse changes the Flexible Rate to {currSymbol}140, Non-refundable auto-adjusts to {currSymbol}126, and Breakfast Included to {currSymbol}155.
                </p>
              </div>
            </div>
          )}

          {/* Plan tree */}
          {plans.length > 0 && (
            <PlanTree
              plans={plans}
              rooms={rooms}
              extras={extras}
              currSymbol={currSymbol}
              onDelete={deletePlan}
              editingId={editingId}
              onEdit={setEditingId}
              onSaveEdit={updatePlan}
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

        </div>
      </InteractiveArea>

      {/* Continue — portaled after chat messages, requires at least one root plan */}
      {!showWizard && (
        <ContinuePortal>
          {plans.filter(p => p.type === 'root').length > 0 ? (
            <div>
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
          ) : (
            <p className="text-[12px] text-[#a8b0bd]">
              Add at least one root rate plan to continue
            </p>
          )}
        </ContinuePortal>
      )}
    </>
  )
}
