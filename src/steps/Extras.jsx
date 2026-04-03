'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KompasMessage, InteractiveArea, Button } from '../ui'
import { useOnboarding, useAgentHighlight, ContinuePortal } from '../OnboardingContext'

// ── Constants ─────────────────────────────────────────────────────────────────

export const CHARGE_BASIS_OPTIONS = [
  { value: 'per_room_night', label: 'Per room / night' },
  { value: 'per_room_stay', label: 'Per room / stay' },
  { value: 'per_person_night', label: 'Per person / night' },
  { value: 'per_person_stay', label: 'Per person / stay' },
]

const VAT_RATES = [0, 5, 6, 7, 9, 10, 13, 20, 21, 23]

const AVAILABILITY_OPTIONS = [
  { value: 'always', label: 'Always' },
  { value: 'season', label: 'Per season' },
  { value: 'custom', label: 'Custom' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function availabilityLabel(item) {
  if (item.availability === 'always') return 'Always available'
  if (item.availability === 'season') return 'Seasonal'
  if (item.availability === 'custom') {
    if (item.customFrom && item.customTo) return `${item.customFrom} – ${item.customTo}`
    return 'Custom period'
  }
  return ''
}

export function emptyItem(itemType = 'extra') {
  return {
    id: Date.now() + Math.random(),
    itemType,
    name: '',
    price: '',
    vatRate: 10,
    chargeBasis: 'per_room_night',
    channels: 'all',
    availability: 'always',
    customFrom: '',
    customTo: '',
    percentage: '',
  }
}

// ── Badges ────────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const map = {
    extra: ['bg-blue-50 text-blue-700', 'Extra'],
    fee:   ['bg-amber-50 text-amber-700', 'Fee'],
    discount: ['bg-green-50 text-green-700', 'Discount'],
  }
  const [cls, label] = map[type] || map.extra
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  )
}

function ChannelBadge({ channels }) {
  return channels === 'direct' ? (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">Direct only</span>
  ) : (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">All channels</span>
  )
}

// ── Item icon ─────────────────────────────────────────────────────────────────

function ItemIcon({ type }) {
  const map = {
    discount: ['bg-green-50', 'text-green-600',
      <path key="d" d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />],
    fee: ['bg-amber-50', 'text-amber-600',
      <path key="f" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />],
    extra: ['bg-blue-50', 'text-blue-600',
      <path key="e" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />],
  }
  const [bg, color, path] = map[type] || map.extra
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
      <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {path}
      </svg>
    </div>
  )
}

// ── Add Form ──────────────────────────────────────────────────────────────────

export function AddForm({ onSave, onCancel, initial }) {
  const [form, setForm] = useState(initial || emptyItem('extra'))
  const isDiscount = form.itemType === 'discount'
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const canSave = form.name.trim() && (isDiscount ? form.percentage : form.price)

  const inputCls = `w-full px-3 py-2 rounded-lg border border-[#e6e9ef] bg-white text-[13px] text-[#1f2124]
    focus:outline-none focus:ring-2 focus:ring-[#125fe3]/20 focus:border-[#125fe3] transition-all placeholder:text-[#a8b0bd]`
  const labelCls = 'text-[11px] font-bold text-[#1f2124] uppercase tracking-wide block mb-1.5'
  const segBtn = (active) =>
    `flex-1 py-2 rounded-lg text-[12px] font-semibold capitalize border transition-all ${
      active ? 'bg-[#125fe3] text-white border-[#125fe3]' : 'bg-white text-[#52647a] border-[#e6e9ef] hover:border-[#125fe3]/40'
    }`
  const optBtn = (active) =>
    `flex-1 py-2 px-3 rounded-lg text-[12px] font-medium border text-center transition-all ${
      active ? 'bg-[rgba(18,95,227,0.06)] border-[#125fe3] text-[#125fe3]' : 'bg-white border-[#e6e9ef] text-[#52647a] hover:border-[#125fe3]/30'
    }`

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-[rgba(18,95,227,0.25)] p-4 space-y-3">
      {/* Row 1: Type + Name side by side */}
      <div className="flex items-end gap-2">
        <div className="flex rounded-lg border border-[#e6e9ef] overflow-hidden flex-shrink-0">
          {['extra', 'fee', 'discount'].map(t => (
            <button key={t} onClick={() => set('itemType', t)} className={`px-3 py-2 text-[12px] font-semibold capitalize transition-all ${
              form.itemType === t ? 'bg-[#125fe3] text-white' : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
            }`}>{t}</button>
          ))}
        </div>
        <div className="flex-1">
          <input
            className={inputCls}
            placeholder={isDiscount ? 'e.g. Early bird discount' : form.itemType === 'fee' ? 'e.g. Cleaning fee' : 'e.g. Breakfast'}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Row 2: Price/Discount + VAT + Charge basis */}
      {isDiscount ? (
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-[#52647a]">Discount</label>
          <div className="relative w-24">
            <input
              type="number" min={1} max={100}
              className={`${inputCls} pr-7`}
              placeholder="10"
              value={form.percentage}
              onChange={e => set('percentage', e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#a8b0bd] pointer-events-none">%</span>
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-2 flex-wrap">
          <div className="w-24">
            <label className="text-[11px] font-semibold text-[#52647a] block mb-1">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#a8b0bd] pointer-events-none">€</span>
              <input
                type="number" min={0} placeholder="0.00"
                className={`${inputCls} pl-6`}
                value={form.price}
                onChange={e => set('price', e.target.value)}
              />
            </div>
          </div>
          <div className="w-20">
            <label className="text-[11px] font-semibold text-[#52647a] block mb-1">VAT</label>
            <select className={inputCls} value={form.vatRate} onChange={e => set('vatRate', e.target.value)}>
              {VAT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
          <div className="flex rounded-lg border border-[#e6e9ef] overflow-hidden flex-shrink-0">
            {CHARGE_BASIS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => set('chargeBasis', opt.value)} className={`px-2.5 py-2 text-[11px] font-medium transition-all ${
                form.chargeBasis === opt.value
                  ? 'bg-[rgba(18,95,227,0.06)] text-[#125fe3]'
                  : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
              }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Channels + Availability inline */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-[#52647a]">Channels</label>
          <div className="flex rounded-lg border border-[#e6e9ef] overflow-hidden">
            {[['all', 'All'], ['direct', 'Direct only']].map(([val, lbl]) => (
              <button key={val} onClick={() => set('channels', val)} className={`px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                form.channels === val
                  ? 'bg-[rgba(18,95,227,0.06)] text-[#125fe3]'
                  : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
              }`}>{lbl}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-[#52647a]">Available</label>
          <div className="flex rounded-lg border border-[#e6e9ef] overflow-hidden">
            {AVAILABILITY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => set('availability', opt.value)} className={`px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                form.availability === opt.value
                  ? 'bg-[rgba(18,95,227,0.06)] text-[#125fe3]'
                  : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
              }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {form.availability === 'custom' && (
        <div className="flex items-center gap-2">
          <input type="date" className={`${inputCls} flex-1`} value={form.customFrom} onChange={e => set('customFrom', e.target.value)} />
          <span className="text-[#a8b0bd] text-sm flex-shrink-0">→</span>
          <input type="date" className={`${inputCls} flex-1`} value={form.customTo} onChange={e => set('customTo', e.target.value)} />
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={() => canSave && onSave(form)} disabled={!canSave}>Save</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ── Item Card ─────────────────────────────────────────────────────────────────

function ItemCard({ item, onDelete, isHighlighted }) {
  const isDiscount = item.itemType === 'discount'
  const basis = CHARGE_BASIS_OPTIONS.find(b => b.value === item.chargeBasis)?.label

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`bg-white rounded-lg border border-[#e6e9ef] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)] overflow-hidden transition-all ${isHighlighted ? 'agent-highlight' : ''}`}
    >
      <div className="flex items-center gap-3 p-4">
        <ItemIcon type={item.itemType} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-[#1f2124]">{item.name}</p>
            <TypeBadge type={item.itemType} />
            <ChannelBadge channels={item.channels} />
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[#a8b0bd] flex-wrap">
            {isDiscount ? (
              <span className="text-green-700 font-semibold">−{item.percentage}%</span>
            ) : (
              <>
                <span>€{item.price}</span>
                {item.vatRate > 0 && <><span className="text-[#e6e9ef]">·</span><span>{item.vatRate}% VAT</span></>}
                {basis && <><span className="text-[#e6e9ef]">·</span><span>{basis}</span></>}
              </>
            )}
            <span className="text-[#e6e9ef]">·</span>
            <span>{availabilityLabel(item)}</span>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="p-1.5 rounded text-[#a8b0bd] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Extras() {
  const { data, setData, nextStep } = useOnboarding()
  const [showForm, setShowForm] = useState(false)

  // Items live in context so the global chat input can also add/remove them
  const extrasHighlighted = useAgentHighlight('extras')
  const items = data.extras || []

  const addItem = (item) => {
    setData('extras', [...items, { ...item, id: Date.now() + Math.random() }])
    setShowForm(false)
  }

  const removeItem = (id) => {
    setData('extras', items.filter(i => i.id !== id))
  }

  return (
    <>
      <KompasMessage>
        <p>Now let's add your <strong>extras, fees, and discounts</strong>.</p>
        <p className="mt-2 text-[#52647a]">
          Think breakfast, cleaning fees, early check-in, late check-out, cot rental, seasonal discounts — anything you charge or offer on top of the room rate. Add as many as you like, or type them in the chat bar below.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-xl space-y-3">
          {/* List */}
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <ItemCard key={item.id} item={item} onDelete={() => removeItem(item.id)} isHighlighted={extrasHighlighted} />
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {items.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#e6e9ef] rounded-lg">
              <svg className="w-8 h-8 text-[#a8b0bd] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-[13px] font-medium text-[#52647a] mb-3">No extras or discounts added yet</p>
              <Button onClick={() => setShowForm(true)}>Add your first item</Button>
            </div>
          )}

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <AddForm onSave={addItem} onCancel={() => setShowForm(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add button */}
          {!showForm && items.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[#e6e9ef]
                text-[13px] font-medium text-[#52647a] hover:text-[#125fe3] hover:border-[rgba(18,95,227,0.3)] hover:bg-[rgba(18,95,227,0.03)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add another
            </button>
          )}

        </div>
      </InteractiveArea>

      {/* Continue / Skip — portaled after chat messages */}
      {!showForm && (
        <ContinuePortal>
          {items.length > 0 ? (
            <div>
              <Button onClick={() => { setData('extras', items); nextStep() }}>Continue</Button>
              <p className="text-[12px] text-[#a8b0bd] mt-2">
                {items.length} item{items.length !== 1 ? 's' : ''} added
              </p>
            </div>
          ) : (
            <button
              onClick={() => { setData('extras', []); nextStep() }}
              className="text-[12px] text-[#a8b0bd] hover:text-[#52647a] transition-colors"
            >
              Skip for now — add extras later →
            </button>
          )}
        </ContinuePortal>
      )}
    </>
  )
}
