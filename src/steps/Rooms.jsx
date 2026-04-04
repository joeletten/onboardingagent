'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KompasMessage, InteractiveArea, Button, Input } from '../ui'
import { useOnboarding, useAgentHighlight, ContinuePortal } from '../OnboardingContext'
import { validateMinLength, validateNumberRange } from '../validation'

// ── Helpers ───────────────────────────────────────────────────────────────────

import { getCurrSymbol } from '../currency'

function computeExamplePrice(baseExamplePrice, room) {
  if (room.isBase) return baseExamplePrice
  const value = parseFloat(room.offsetValue) || 0
  const dir = room.offsetDirection === '-' ? -1 : 1
  if (room.offsetType === 'percentage') {
    return Math.round(baseExamplePrice * (1 + dir * value / 100))
  }
  return Math.round(baseExamplePrice + dir * value)
}

function roomPrice(room) {
  return computeExamplePrice(100, room)
}

function sortRoomsByPrice(rooms) {
  return [...rooms].sort((a, b) => roomPrice(a) - roomPrice(b))
}

function formatOffset(room, currSymbol = '€') {
  if (room.isBase) return null
  const dir = room.offsetDirection === '-' ? '−' : '+'
  const val = parseFloat(room.offsetValue) || 0
  if (room.offsetType === 'percentage') return `${dir}${val}%`
  return `${dir}${currSymbol}${val}`
}

function emptyRoom(isBase = false) {
  return {
    id: Date.now() + Math.random(),
    name: '',
    count: '',
    isBase,
    offsetDirection: '+',
    offsetType: 'percentage',
    offsetValue: '',
    bookableOnline: true,
    defaultGuests: 2,
    minGuests: 1,
    maxGuests: 2,
    maxKids: 1,
    maxBabies: 1,
    otaPrice: null,
  }
}

// ── Room Form ─────────────────────────────────────────────────────────────────

function FormSection({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8b0bd] mb-2.5">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

// Small number input with centered text — not suited for Input component since that doesn't support centering
const numInputCls = `
  px-2 py-2 rounded border border-[#e6e9ef] bg-white text-[14px] text-center text-[#1f2124]
  hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20
  outline-none transition-all w-16
`

function RoomForm({ form, onChange, onSave, onCancel, isFirstRoom, baseRefPrice, currSymbol, hasOta, otaLabel }) {
  const isBase = isFirstRoom || form.isBase
  const [touched, setTouched] = useState({})

  const examplePrice = isBase ? 100 : computeExamplePrice(100, form)

  const nameErr = touched.name ? (validateMinLength(form.name, 2, 'Room name') || (!form.name.trim() ? 'Room name is required' : null)) : null
  const countErr = touched.count ? (
    !form.count ? 'Count is required' : validateNumberRange(form.count, 1, 999, 'Count')
  ) : null
  const guestErr = touched.guests && form.minGuests > form.maxGuests ? 'Min guests cannot exceed max guests' :
                   touched.guests && form.defaultGuests > form.maxGuests ? 'Default guests cannot exceed max guests' :
                   touched.guests && form.defaultGuests < form.minGuests ? 'Default guests cannot be less than min guests' : null

  const canSave = form.name.trim() && parseInt(form.count) >= 1 && !nameErr && !countErr && form.minGuests <= form.defaultGuests && form.defaultGuests <= form.maxGuests

  return (
    <div className="border-t border-[#e6e9ef] pt-3 mt-1 space-y-3">

      {/* Row 1: Name + Count side by side */}
      <div className="grid grid-cols-[1fr_5rem] gap-3">
        <Input
          label="Room name"
          placeholder="e.g. Deluxe King"
          value={form.name}
          onChange={e => { onChange('name', e.target.value); if (touched.name) setTouched(t => ({ ...t, name: true })) }}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          error={nameErr}
          size="sm"
          autoFocus
        />
        <Input
          label="Count"
          type="number"
          placeholder="4"
          value={form.count}
          onChange={e => { onChange('count', e.target.value); if (touched.count) setTouched(t => ({ ...t, count: true })) }}
          onBlur={() => setTouched(t => ({ ...t, count: true }))}
          error={countErr}
          size="sm"
        />
      </div>

      {/* Row 2: Pricing */}
      {isBase ? (
        <div className="flex items-start gap-2 p-2.5 bg-[rgba(18,95,227,0.05)] rounded-lg border border-[rgba(18,95,227,0.15)]">
          <svg className="w-3.5 h-3.5 text-[#125fe3] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <p className="text-[11px] text-[#125fe3] leading-snug">
            <strong>Base room</strong> — other rooms are priced relative to this one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[#52647a] block">Price offset from base</label>
          <div className="flex items-center gap-1.5">
            <div className="flex rounded border border-[#e6e9ef] overflow-hidden">
              {['+', '-'].map(dir => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => onChange('offsetDirection', dir)}
                  className={`px-3 h-9 text-[13px] font-bold transition-colors ${
                    form.offsetDirection === dir
                      ? 'bg-[#125fe3] text-white'
                      : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="px-2 h-9 rounded border border-[#e6e9ef] bg-white text-[13px] text-[#1f2124] w-16 text-center
                hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20 outline-none transition-all"
              placeholder="20"
              min={0}
              value={form.offsetValue}
              onChange={e => onChange('offsetValue', e.target.value)}
            />
            <div className="flex rounded border border-[#e6e9ef] overflow-hidden">
              {[['percentage', '%'], ['fixed', currSymbol]].map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange('offsetType', val)}
                  className={`px-3 h-9 text-[13px] font-semibold transition-colors ${
                    form.offsetType === val
                      ? 'bg-[#125fe3] text-white'
                      : 'bg-white text-[#52647a] hover:bg-[#f9fafb]'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {form.offsetValue ? (
              <span className="text-[12px] text-[#a8b0bd] ml-1">
                = {currSymbol}{examplePrice}
              </span>
            ) : null}
          </div>
          {hasOta && form.otaPrice && (
            <p className="text-[11px] text-[#a8b0bd]">
              {otaLabel}: <strong className="text-[#2e3d4b]">{currSymbol}{form.otaPrice}</strong>
            </p>
          )}
        </div>
      )}

      {/* Row 3: Occupancy */}
      <div className="rounded-lg border border-[#e6e9ef] bg-[#f9fafb] p-3 space-y-3">
        <p className="text-[10px] font-bold text-[#a8b0bd] uppercase tracking-widest">Occupancy</p>

        {/* Adults */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#52647a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[12px] font-semibold text-[#1f2124]">Adults</span>
          </div>
          <div className="flex items-center gap-3 ml-5.5">
            {[
              { label: 'Standard', field: 'defaultGuests', hint: 'Default number of adults' },
              { label: 'Min', field: 'minGuests', hint: 'Minimum to book' },
              { label: 'Max', field: 'maxGuests', hint: 'Maximum capacity' },
            ].map(({ label, field }) => (
              <div key={field} className="flex items-center gap-1.5">
                <label className="text-[11px] text-[#52647a]">{label}</label>
                <input
                  type="number"
                  className={`px-1.5 py-1 rounded border bg-white text-[13px] text-center text-[#1f2124]
                    hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20
                    outline-none transition-all w-11 ${
                      guestErr ? 'border-[#d93025]' : 'border-[#e6e9ef]'
                    }`}
                  min={field === 'minGuests' ? 1 : 1}
                  max={20}
                  value={form[field]}
                  onChange={e => { onChange(field, parseInt(e.target.value) || 0); setTouched(t => ({ ...t, guests: true })) }}
                />
              </div>
            ))}
          </div>
          {guestErr && (
            <p className="flex items-center gap-1 text-[11px] text-[#d93025] leading-4 ml-5.5">
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10.5a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
              </svg>
              {guestErr}
            </p>
          )}
        </div>

        {/* Children & Babies — extra capacity on top of adults */}
        <div className="border-t border-[#e6e9ef] pt-2.5 space-y-2">
          <p className="text-[11px] text-[#a8b0bd]">Extra guests allowed <strong className="text-[#52647a]">in addition</strong> to adults</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#52647a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4z" /><path d="M16 21v-1a3 3 0 00-3-3h-2a3 3 0 00-3 3v1" />
              </svg>
              <label className="text-[11px] text-[#52647a]">Children</label>
              <input
                type="number"
                className="px-1.5 py-1 rounded border border-[#e6e9ef] bg-white text-[13px] text-center text-[#1f2124]
                  hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20
                  outline-none transition-all w-11"
                min={0}
                max={10}
                value={form.maxKids}
                onChange={e => onChange('maxKids', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#52647a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="8" r="4" /><path d="M14 20H10" />
              </svg>
              <label className="text-[11px] text-[#52647a]">Infants</label>
              <input
                type="number"
                className="px-1.5 py-1 rounded border border-[#e6e9ef] bg-white text-[13px] text-center text-[#1f2124]
                  hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20
                  outline-none transition-all w-11"
                min={0}
                max={10}
                value={form.maxBabies}
                onChange={e => onChange('maxBabies', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Summary line */}
        <div className="border-t border-[#e6e9ef] pt-2 flex items-center justify-between">
          <span className="text-[11px] text-[#a8b0bd]">Total max capacity</span>
          <span className="text-[12px] font-semibold text-[#1f2124]">
            {form.maxGuests} adult{form.maxGuests !== 1 ? 's' : ''}
            {form.maxKids > 0 && <span className="text-[#a8b0bd] font-normal"> + {form.maxKids} child{form.maxKids !== 1 ? 'ren' : ''}</span>}
            {form.maxBabies > 0 && <span className="text-[#a8b0bd] font-normal"> + {form.maxBabies} infant{form.maxBabies !== 1 ? 's' : ''}</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onSave} disabled={!canSave}>Save room</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ── Room Card ─────────────────────────────────────────────────────────────────

function RoomListCard({ room, index, isEditing, currSymbol, baseRefPrice, hasOta, otaLabel, onEdit, onDelete, onSave, onCancel, editForm, onFormChange, isHighlighted }) {
  const examplePrice = computeExamplePrice(100, room)
  const offsetLabel = formatOffset(room, currSymbol)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`bg-white rounded-lg border border-[#e6e9ef] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04),0px_1px_3px_0px_rgba(0,0,0,0.08)] overflow-hidden transition-all ${isHighlighted ? 'agent-highlight' : ''}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        {/* Index badge */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
          room.isBase ? 'bg-[#125fe3] text-white' : 'bg-[#f2f4f8] text-[#a8b0bd] border border-[#e6e9ef]'
        }`}>
          {index + 1}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-[#1f2124]">
              {room.name || <span className="text-[#a8b0bd] italic">Unnamed room</span>}
            </p>
            {room.isBase && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(18,95,227,0.08)] text-[#125fe3] uppercase tracking-wide">
                Base
              </span>
            )}
            {!room.isBase && offsetLabel && (
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                room.offsetDirection === '-' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
              }`}>
                {offsetLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 text-[12px] text-[#a8b0bd] flex-wrap">
            <span>{room.count || '—'} rooms</span>
            {!room.isBase && room.offsetValue && (
              <>
                <span className="text-[#e6e9ef]">·</span>
                <span>e.g. {currSymbol}100 → <strong className="text-[#2e3d4b]">{currSymbol}{examplePrice}</strong></span>
              </>
            )}
            {hasOta && room.otaPrice && (
              <>
                <span className="text-[#e6e9ef]">·</span>
                <span className="text-blue-500">{otaLabel}: {currSymbol}{room.otaPrice}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 text-[12px] text-[#a8b0bd] flex-wrap">
            <span>{room.minGuests}–{room.maxGuests} adults (std. {room.defaultGuests})</span>
            {room.maxKids > 0 && <span>· +{room.maxKids} child{room.maxKids !== 1 ? 'ren' : ''}</span>}
            {room.maxBabies > 0 && <span>· +{room.maxBabies} infant{room.maxBabies !== 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
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

      {/* Edit form */}
      <AnimatePresence>
        {isEditing && editForm && (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <RoomForm
                form={editForm}
                onChange={onFormChange}
                onSave={onSave}
                onCancel={onCancel}
                isFirstRoom={room.isBase}
                baseRefPrice={baseRefPrice}
                currSymbol={currSymbol}
                hasOta={hasOta}
                otaLabel={otaLabel}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Rooms() {
  const { data, setData, nextStep } = useOnboarding()

  const currency = data.settings?.localization?.currency || 'EUR'
  const currSymbol = getCurrSymbol(currency)
  const pmsName = data.pms?.name

  // Determine if any OTA channel is connected
  const connectedChannels = [
    ...(data.channelConnect?.filter(c => c.connected) || []),
    ...(data.otas?.filter(o => o.connected) || []),
  ]
  const hasOta = connectedChannels.length > 0
  const otaLabel = connectedChannels[0]?.name || 'Booking.com'

  // Rooms live in context so chat and form stay in sync
  const rooms = (data.rooms || []).map(r => ({
    bookableOnline: true,
    defaultGuests: 2,
    minGuests: 1,
    maxGuests: 2,
    maxKids: 1,
    maxBabies: 1,
    offsetDirection: '+',
    offsetType: 'percentage',
    offsetValue: 0,
    ...r,
  }))

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const [showNewForm, setShowNewForm] = useState(!data.rooms?.length)
  const [newForm, setNewForm] = useState(() => emptyRoom(true))

  const baseRoom = rooms.find(r => r.isBase) || rooms[0]
  const baseRefPrice = 100

  // ── Handlers ───────────────────────────────────────────────────────────────

  const startEdit = (room) => {
    if (editingId === room.id) {
      setEditingId(null)
      setEditForm(null)
    } else {
      setEditingId(room.id)
      setEditForm({ ...room })
      setShowNewForm(false)
    }
  }

  const saveEdit = () => {
    setData('rooms', rooms.map(r => r.id === editingId ? { ...editForm } : r))
    setEditingId(null)
    setEditForm(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const deleteRoom = (id) => {
    const filtered = rooms.filter(r => r.id !== id)
    if (rooms.find(r => r.id === id)?.isBase && filtered.length > 0) {
      filtered[0] = { ...filtered[0], isBase: true, offsetType: 'percentage', offsetValue: 0 }
    }
    setData('rooms', filtered)
    if (editingId === id) { setEditingId(null); setEditForm(null) }
  }

  const addNewRoom = () => {
    if (!newForm.name.trim() || !parseInt(newForm.count)) return
    const isFirst = rooms.length === 0
    const room = { ...newForm, id: Date.now(), isBase: isFirst }
    setData('rooms', [...rooms, room])
    setShowNewForm(false)
    setNewForm(emptyRoom(false))
  }

  const handleContinue = () => {
    nextStep()
  }

  const roomsHighlighted = useAgentHighlight('rooms')
  const hasPrefill = pmsName && rooms.length > 0

  return (
    <>
      <KompasMessage>
        {hasPrefill ? (
          <>
            <p>
              I pulled your room setup from <strong>{pmsName}</strong>. Review the details below and fill in anything that's missing.
            </p>
            <p className="mt-2 text-[#52647a]">
              Each room type needs a name, count, pricing offset, and guest configuration. You can add more room types if needed.
            </p>
          </>
        ) : (
          <>
            <p>Let's set up your rooms.</p>
            <p className="mt-2 text-[#52647a]">
              Start with your <strong>base room</strong> — this is the reference point for all your pricing. Other room types will be priced relative to it (e.g., a suite at +20%).
            </p>
          </>
        )}
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-xl space-y-3">

          {/* Room list */}
          <AnimatePresence mode="popLayout">
            {sortRoomsByPrice(rooms).map((room, index) => (
              <RoomListCard
                key={room.id}
                room={room}
                index={index}
                isEditing={editingId === room.id}
                currSymbol={currSymbol}
                baseRefPrice={baseRefPrice}
                hasOta={hasOta}
                otaLabel={otaLabel}
                onEdit={() => startEdit(room)}
                onDelete={() => deleteRoom(room.id)}
                onSave={saveEdit}
                onCancel={cancelEdit}
                editForm={editingId === room.id ? editForm : null}
                onFormChange={(field, val) => setEditForm(f => ({ ...f, [field]: val }))}
                isHighlighted={roomsHighlighted}
              />
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {rooms.length === 0 && !showNewForm && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#e6e9ef] rounded-lg">
              <svg className="w-8 h-8 text-[#a8b0bd] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M2 4v16" /><path d="M22 8H2" /><path d="M22 20v-8a4 4 0 00-4-4H8" /><path d="M6 8v8" /><path d="M22 20H2" />
              </svg>
              <p className="text-[13px] font-medium text-[#52647a] mb-3">No rooms added yet</p>
              <Button onClick={() => setShowNewForm(true)}>Add your first room</Button>
            </div>
          )}

          {/* New room form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div
                key="new-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-white rounded-lg border-2 border-dashed border-[rgba(18,95,227,0.25)] p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    rooms.length === 0 ? 'bg-[#125fe3] text-white' : 'bg-[#f2f4f8] text-[#a8b0bd] border border-[#e6e9ef]'
                  }`}>
                    {rooms.length + 1}
                  </div>
                  <p className="text-[13px] font-semibold text-[#1f2124]">
                    {rooms.length === 0 ? 'Add base room' : 'Add room type'}
                  </p>
                </div>

                <RoomForm
                  form={newForm}
                  onChange={(field, val) => setNewForm(f => ({ ...f, [field]: val }))}
                  onSave={addNewRoom}
                  onCancel={() => { setShowNewForm(false); if (rooms.length === 0) setNewForm(emptyRoom(true)) }}
                  isFirstRoom={rooms.length === 0}
                  baseRefPrice={baseRefPrice}
                  currSymbol={currSymbol}
                  hasOta={hasOta}
                  otaLabel={otaLabel}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add room button */}
          {!showNewForm && rooms.length > 0 && (
            <button
              onClick={() => { setShowNewForm(true); setNewForm(emptyRoom(false)); setEditingId(null); setEditForm(null) }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[#e6e9ef]
                text-[13px] font-medium text-[#52647a] hover:text-[#125fe3] hover:border-[rgba(18,95,227,0.3)] hover:bg-[rgba(18,95,227,0.03)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add another room
            </button>
          )}

        </div>
      </InteractiveArea>

      {/* Continue — portaled after chat messages */}
      {rooms.length > 0 && (
        <ContinuePortal>
          <div>
            <Button onClick={handleContinue} disabled={showNewForm && !newForm.name}>
              Save rooms & continue
            </Button>
            <p className="text-[12px] text-[#a8b0bd] mt-2">
              {rooms.length} room type{rooms.length !== 1 ? 's' : ''} · {rooms.reduce((s, r) => s + (parseInt(r.count) || 0), 0)} rooms total
            </p>
          </div>
        </ContinuePortal>
      )}
    </>
  )
}
