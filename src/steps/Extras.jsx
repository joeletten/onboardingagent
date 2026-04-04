'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KompasMessage, InteractiveArea, Button } from '../ui'
import { useOnboarding, useAgentHighlight, ContinuePortal } from '../OnboardingContext'
import { getCurrSymbol } from '../currency'

// ── Constants ─────────────────────────────────────────────────────────────────

export const CHARGE_BASIS_OPTIONS = [
  { value: 'per_room_night', label: 'Per room / night' },
  { value: 'per_room_stay', label: 'Per room / stay' },
  { value: 'per_person_night', label: 'Per person / night' },
  { value: 'per_person_stay', label: 'Per person / stay' },
]

const VAT_RATES = [0, 5, 6, 7, 9, 10, 13, 20, 21, 23]


// ── Helpers ───────────────────────────────────────────────────────────────────

export function emptyItem(itemType = 'extra') {
  return {
    id: Date.now() + Math.random(),
    itemType,
    name: '',
    price: '',
    vatRate: 10,
    chargeBasis: 'per_room_night',
    channels: 'all',
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
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">Direct website only</span>
  ) : (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">OTAs + direct</span>
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

// Keywords that strongly suggest a specific item type
const DISCOUNT_KEYWORDS = ['discount', 'deal', 'offer', 'promo', 'reduction', 'early bird', 'long stay', 'last minute', 'special rate', '% off']
const FEE_KEYWORDS = ['fee', 'tax', 'charge', 'surcharge', 'levy', 'cleaning', 'resort fee', 'city tax', 'tourist tax', 'service charge', 'damage deposit']
const EXTRA_KEYWORDS = ['breakfast', 'lunch', 'dinner', 'meal', 'parking', 'spa', 'gym', 'wifi', 'minibar', 'bike', 'bicycle', 'transfer', 'shuttle', 'cot', 'crib', 'bed', 'pet', 'laundry', 'late check', 'early check', 'room upgrade', 'champagne', 'wine', 'package', 'tour', 'rental', 'equipment']

function suggestItemType(name) {
  const lower = (name || '').toLowerCase()
  if (!lower) return null
  if (DISCOUNT_KEYWORDS.some(kw => lower.includes(kw))) return 'discount'
  if (FEE_KEYWORDS.some(kw => lower.includes(kw))) return 'fee'
  if (EXTRA_KEYWORDS.some(kw => lower.includes(kw))) return 'extra'
  return null
}

const TYPE_LABELS = { extra: 'Extra', fee: 'Fee', discount: 'Discount' }

export function AddForm({ onSave, onCancel, initial, currSymbol = '€' }) {
  const [form, setForm] = useState(initial || emptyItem('extra'))
  const [dismissed, setDismissed] = useState(false)
  const isDiscount = form.itemType === 'discount'
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDismissed(false) }

  const canSave = form.name.trim() && (isDiscount ? form.percentage : form.price)

  // Type mismatch suggestion
  const suggested = suggestItemType(form.name)
  const hasMismatch = suggested && suggested !== form.itemType && !dismissed && form.name.trim().length >= 3

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
      {/* Row 1: Type selector */}
      <div>
        <label className={labelCls}>What type of item is this?</label>
        <div className="flex gap-2">
          {[
            ['extra', 'Extra', 'Optional add-on guests can choose', 'bg-blue-50 border-blue-200 text-blue-700', 'border-blue-400 bg-blue-50'],
            ['fee', 'Fee', 'Mandatory charge applied automatically', 'bg-amber-50 border-amber-200 text-amber-700', 'border-amber-400 bg-amber-50'],
            ['discount', 'Discount', 'Percentage off the room rate', 'bg-green-50 border-green-200 text-green-700', 'border-green-400 bg-green-50'],
          ].map(([val, title, desc, activeCls, activeBorder]) => (
            <button
              key={val}
              type="button"
              onClick={() => set('itemType', val)}
              className={`flex-1 p-2.5 rounded-lg border text-left transition-all ${
                form.itemType === val
                  ? activeBorder
                  : 'border-[#e6e9ef] bg-white hover:border-[#dbe0e6]'
              }`}
            >
              <p className={`text-[12px] font-semibold ${form.itemType === val ? activeCls.split(' ').pop() : 'text-[#1f2124]'}`}>{title}</p>
              <p className="text-[10px] text-[#a8b0bd] mt-0.5 leading-snug">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Name */}
      <div>
        <label className={labelCls}>Name</label>
        <input
          className={inputCls}
          placeholder={isDiscount ? 'e.g. Early bird discount' : form.itemType === 'fee' ? 'e.g. Cleaning fee' : 'e.g. Breakfast'}
          value={form.name}
          onChange={e => set('name', e.target.value)}
          autoFocus
        />
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
        <div className="space-y-2">
          <div className="flex items-end gap-2 flex-wrap">
            <div className="w-28">
              <label className="text-[11px] font-semibold text-[#52647a] block mb-1">Price excl. VAT</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#a8b0bd] pointer-events-none">{currSymbol}</span>
                <input
                  type="number" min={0} placeholder="0.00"
                  className={`${inputCls} pl-6`}
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                />
              </div>
            </div>
            <div className="w-20">
              <label className="text-[11px] font-semibold text-[#52647a] block mb-1">VAT rate</label>
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
          {form.price && parseFloat(form.price) > 0 && (
            <div className="rounded-lg border border-[#e6e9ef] bg-[#f9fafb] px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] text-[#a8b0bd]">Guest pays incl. VAT</span>
              <span className="text-[12px] font-semibold text-[#1f2124]">
                {currSymbol}{(parseFloat(form.price) * (1 + (parseFloat(form.vatRate) || 0) / 100)).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Row 3: Channels */}
      <div>
        <label className="text-[11px] font-semibold text-[#52647a] block mb-1.5">Distribution</label>
        <div className="flex gap-2">
          {[
            ['all', 'OTAs + direct website', 'Booking.com, Expedia, Airbnb, etc. and your own website'],
            ['direct', 'Direct website only', 'Your own booking website only — no OTA commission'],
          ].map(([val, title, desc]) => (
            <button
              key={val}
              onClick={() => set('channels', val)}
              className={`flex-1 p-2.5 rounded-lg border text-left transition-all ${
                form.channels === val
                  ? 'border-[#125fe3] bg-[rgba(18,95,227,0.05)]'
                  : 'border-[#e6e9ef] bg-white hover:border-[#125fe3]/30'
              }`}
            >
              <p className={`text-[12px] font-semibold ${form.channels === val ? 'text-[#125fe3]' : 'text-[#1f2124]'}`}>{title}</p>
              <p className="text-[10px] text-[#a8b0bd] mt-0.5 leading-snug">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Type mismatch warning */}
      {hasMismatch && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-200 bg-amber-50">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-[12px] text-amber-800 leading-relaxed">
              "<strong>{form.name}</strong>" sounds like it might be {suggested === 'extra' ? 'an' : 'a'} <strong>{TYPE_LABELS[suggested]}</strong> rather than {form.itemType === 'extra' ? 'an' : 'a'} {TYPE_LABELS[form.itemType]}. Want to switch?
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => set('itemType', suggested)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
              >
                Change to {TYPE_LABELS[suggested]}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-amber-600 hover:bg-amber-100 transition-colors"
              >
                Keep as {TYPE_LABELS[form.itemType]}
              </button>
            </div>
          </div>
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

function ItemCard({ item, onDelete, onEdit, isEditing, onSaveEdit, isHighlighted, currSymbol = '€' }) {
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
                <span>{currSymbol}{item.price}</span>
                {item.vatRate > 0 && <><span className="text-[#e6e9ef]">·</span><span>{item.vatRate}% VAT</span></>}
                {basis && <><span className="text-[#e6e9ef]">·</span><span>{basis}</span></>}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
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

      {/* Inline edit form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#f2f4f8] pt-3">
              <AddForm
                initial={item}
                currSymbol={currSymbol}
                onSave={(updated) => onSaveEdit({ ...updated, id: item.id })}
                onCancel={onEdit}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Extras() {
  const { data, setData, nextStep } = useOnboarding()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const currency = data.settings?.localization?.currency || 'EUR'
  const currSymbol = getCurrSymbol(currency)

  // Items live in context so the global chat input can also add/remove them
  const extrasHighlighted = useAgentHighlight('extras')
  const items = data.extras || []

  const addItem = (item) => {
    setData('extras', [...items, { ...item, id: Date.now() + Math.random() }])
    setShowForm(false)
  }

  const updateItem = (updated) => {
    setData('extras', items.map(i => i.id === updated.id ? updated : i))
    setEditingId(null)
  }

  const removeItem = (id) => {
    setData('extras', items.filter(i => i.id !== id))
    if (editingId === id) setEditingId(null)
  }

  return (
    <>
      <KompasMessage>
        <p>Now let's add your <strong>extras, fees, and discounts</strong>.</p>
        <p className="mt-2 text-[#52647a]">
          These are items on top of the base room rate. There are three types:
        </p>
        <ul className="mt-1.5 text-[#52647a] space-y-1 text-[13px]">
          <li><strong className="text-blue-600">Extra</strong> — an optional add-on guests can choose, like breakfast, parking, or a spa package.</li>
          <li><strong className="text-amber-600">Fee</strong> — a mandatory charge applied automatically, like a cleaning fee, resort fee, or city tax.</li>
          <li><strong className="text-green-600">Discount</strong> — a percentage off the room rate, like an early bird deal or a long-stay discount.</li>
        </ul>
        <p className="mt-1.5 text-[#52647a]">
          Add as many as you like, or type them in the chat bar below.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-xl space-y-3">
          {/* List */}
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={() => removeItem(item.id)}
                onEdit={() => setEditingId(editingId === item.id ? null : item.id)}
                isEditing={editingId === item.id}
                onSaveEdit={updateItem}
                isHighlighted={extrasHighlighted}
                currSymbol={currSymbol}
              />
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
                <AddForm onSave={addItem} onCancel={() => setShowForm(false)} currSymbol={currSymbol} />
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
