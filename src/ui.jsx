'use client'

/**
 * Prism Design System — reusable primitives
 *
 * Component reference from Figma (Prism Components, file jMJ9etijaHbzAhSPYJ4lGH):
 *   Button     node 3:33359  — primary #125fe3, secondary rgba(5,38,105,0.06)
 *   Card       node 3:39350  — white bg, 0.5px #e6e9ef border, 8px radius, shadow/neutral/100
 *   Input      node 3:47825  — 52px large / 44px small, 4px radius, #e6e9ef border, #125fe3 focus
 *   Select     node 3:52404  — same base as Input + chevron, 32px large / 24px small trigger
 *   Toggle     node 3:60059  — track 44×24 large / 36×20 small, checked #125fe3
 */
import React from 'react'
import { motion } from 'framer-motion'

// ── Design tokens (inline for clarity) ────────────────────────────────────────
const T = {
  blue:        '#125fe3',
  blueHover:   '#0e4fc4',
  bluePressed: '#0b3fa0',
  blueBg:      'rgba(5,38,105,0.06)',
  emphasis:    '#1f2124',
  textDefault: '#2e3d4b',
  textSubtle:  '#52647a',
  textMuted:   '#a8b0bd',
  borderDef:   '#e6e9ef',
  borderEmph:  '#dbe0e6',
  surface:     '#ffffff',
  canvas:      '#f2f4f8',
  subdued:     '#f9fafb',
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUTTON
//  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
//  size:    'sm' (24px) | 'md' (32px) | 'lg' (40px)
// ─────────────────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', size = 'md', onClick, disabled, children, className = '', type = 'button' }) {
  const sizeClass = {
    sm: 'h-6 px-2 text-[12px] gap-1',
    md: 'h-8 px-2 text-[13.5px] gap-1.5',
    lg: 'h-10 px-3 text-[14px] gap-2',
  }[size]

  const variantClass = {
    primary:   'bg-[#125fe3] text-white hover:bg-[#0e4fc4] active:bg-[#0b3fa0] disabled:opacity-40',
    secondary: 'bg-[rgba(5,38,105,0.06)] text-[#2e3d4b] hover:bg-[rgba(5,38,105,0.10)] active:bg-[rgba(5,38,105,0.14)] disabled:opacity-40',
    ghost:     'bg-transparent text-[#2e3d4b] hover:bg-black/5 active:bg-black/10 disabled:opacity-40',
    danger:    'bg-[#d93025] text-white hover:bg-[#b71c1c] disabled:opacity-40',
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded font-medium leading-[18px]
        transition-colors duration-150 select-none cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#125fe3]/40
        disabled:cursor-not-allowed
        ${sizeClass} ${variantClass} ${className}
      `}
    >
      {children}
    </button>
  )
}

// ─── Legacy aliases (keep existing step files working) ───────────────────────
export function PrimaryButton({ onClick, disabled, children, className = '' }) {
  return <Button variant="primary" size="md" onClick={onClick} disabled={disabled} className={className}>{children}</Button>
}
export function GhostButton({ onClick, children, className = '' }) {
  return <Button variant="ghost" size="md" onClick={onClick} className={className}>{children}</Button>
}

// ─────────────────────────────────────────────────────────────────────────────
//  CARD  (primary & secondary variants, optional header/content/footer)
// ─────────────────────────────────────────────────────────────────────────────
function CardRoot({ children, secondary = false, className = '' }) {
  return (
    <div className={`
      overflow-hidden rounded-lg
      bg-[#ffffff] border border-[#e6e9ef]
      shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04),0px_1px_3px_0px_rgba(0,0,0,0.08)]
      ${secondary ? 'bg-[#f9fafb]' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-2 min-h-[56px] px-4 py-3 border-b border-[#dbe0e6] ${className}`}>
      {children}
    </div>
  )
}

function CardContent({ children, padded = true, secondary = false, className = '' }) {
  return (
    <div className={`
      ${padded ? 'p-4' : ''}
      ${secondary ? 'bg-[#f9fafb]' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-2 px-4 h-14 border-t border-[#e6e9ef] ${className}`}>
      {children}
    </div>
  )
}

CardRoot.Header  = CardHeader
CardRoot.Content = CardContent
CardRoot.Footer  = CardFooter
export const Card = CardRoot

// ─────────────────────────────────────────────────────────────────────────────
//  INPUT
//  size: 'sm' (44px) | 'md' (52px)
//  Use the `label` prop for the field label.  Pass `prefilled` to show badge.
// ─────────────────────────────────────────────────────────────────────────────
export function Input({
  label,
  placeholder,
  value,
  onChange,
  onKeyDown,
  type = 'text',
  size = 'md',
  prefilled = false,
  error,
  disabled = false,
  autoFocus = false,
  className = '',
}) {
  const heightClass = size === 'sm' ? 'h-11' : 'h-[52px]'
  const borderClass = error
    ? 'border-[#d93025] focus:ring-[#d93025]/20 focus:border-[#d93025]'
    : 'border-[#e6e9ef] hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-[#125fe3]/20'

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-[12px] font-bold text-[#1f2124] leading-4 uppercase tracking-wide">{label}</label>
          {prefilled && <PrefilledBadge />}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          w-full ${heightClass} px-2.5 rounded border text-[14px] text-[#1f2124] leading-[18px]
          bg-white placeholder:text-[#a8b0bd]
          transition-all outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${borderClass}
        `}
      />
      {error && <p className="text-[12px] text-[#d93025] mt-1">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SELECT
//  Pass `options` as array of { value, label }.
//  size: 'sm' (24px trigger) | 'md' (32px trigger) | 'lg' (52px trigger)
// ─────────────────────────────────────────────────────────────────────────────
export function Select({
  label,
  value,
  onChange,
  options = [],
  size = 'lg',
  prefilled = false,
  disabled = false,
  className = '',
}) {
  const heightClass = { sm: 'h-6', md: 'h-8', lg: 'h-[52px]' }[size]

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-[12px] font-bold text-[#1f2124] leading-4 uppercase tracking-wide">{label}</label>
          {prefilled && <PrefilledBadge />}
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full ${heightClass} pl-2.5 pr-8 rounded border border-[#e6e9ef]
            text-[14px] text-[#2e3d4b] leading-[18px] bg-white appearance-none
            hover:border-[#dbe0e6] focus:border-[#125fe3] focus:ring-2 focus:ring-[#125fe3]/20
            outline-none transition-all cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8b0bd]"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOGGLE
//  size: 'sm' (36×20, knob 16) | 'md' (44×24, knob 20)
// ─────────────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, size = 'md', disabled = false }) {
  const isSmall = size === 'sm'
  const trackW   = isSmall ? 'w-9'  : 'w-11'
  const trackH   = isSmall ? 'h-5'  : 'h-6'
  const knobSize = isSmall ? 'w-4 h-4' : 'w-5 h-5'
  const translate = checked
    ? (isSmall ? 'translate-x-4' : 'translate-x-5')
    : 'translate-x-0.5'

  return (
    <div className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} select-none`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative ${trackW} ${trackH} rounded-full flex-shrink-0
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#125fe3]/30 focus-visible:ring-offset-1
          ${checked ? 'bg-[#125fe3]' : 'bg-[#a8b0bd]'}
          ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
      >
        <span className={`
          absolute top-0.5 ${knobSize} bg-white rounded-full shadow-sm
          transition-transform duration-200
          ${translate}
        `} />
      </button>
      {label && (
        <span
          className={`text-[14px] text-[#2e3d4b] leading-[18px] ${!disabled ? 'cursor-pointer' : ''}`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONNECT BUTTON  (PMS/OTA connection states)
// ─────────────────────────────────────────────────────────────────────────────
export function ConnectButton({ connected, connecting, onClick, children }) {
  if (connecting) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-[12px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        Connecting...
      </span>
    )
  }
  if (connected) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-[12px] font-medium bg-green-50 text-green-700 border border-green-200">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Connected
      </span>
    )
  }
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded text-[12px] font-semibold bg-white border border-[#e6e9ef] text-[#2e3d4b] hover:bg-[#f9fafb] hover:border-[#dbe0e6] transition-all"
    >
      {children || 'Connect'}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SELECT CARD  (radio-style selection card)
// ─────────────────────────────────────────────────────────────────────────────
export function SelectCard({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left rounded-lg border-2 p-4 transition-all duration-150
        focus:outline-none
        ${selected
          ? 'border-[#125fe3] bg-[rgba(18,95,227,0.04)] shadow-sm'
          : 'border-[#e6e9ef] bg-white hover:border-[#dbe0e6] hover:shadow-sm'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROPERTY CARD
// ─────────────────────────────────────────────────────────────────────────────
export function PropertyCard({ property }) {
  if (!property) return null
  const details = [
    property.city && property.country ? `${property.city}, ${property.country}`
      : property.city || property.country || null,
    property.rooms ? `${property.rooms} rooms` : null,
    property.type  || null,
    property.rating && !property.stars ? `★ ${property.rating}` : null,
  ].filter(Boolean)

  return (
    <Card>
      <Card.Content>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[14px] text-[#1f2124] leading-5">{property.name}</h3>
            {details.length > 0 && (
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[12px] text-[#52647a] mt-1">
                {details.map((d, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-[#c7ced6]">·</span>}
                    <span>{d}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
            {property.address && (
              <p className="text-[12px] text-[#a8b0bd] mt-1">{property.address}</p>
            )}
          </div>
          {property.stars > 0 && (
            <div className="flex gap-0.5 flex-shrink-0">
              {Array.from({ length: property.stars }).map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOM CARD  (compact display, used in the rooms overview)
// ─────────────────────────────────────────────────────────────────────────────
export function RoomCard({ room }) {
  return (
    <Card>
      <Card.Content>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(18,95,227,0.08)] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#125fe3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path d="M2 4v16" /><path d="M22 8H2" /><path d="M22 20v-8a4 4 0 00-4-4H8" /><path d="M6 8v8" /><path d="M22 20H2" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1f2124]">{room.name}</p>
              <p className="text-[12px] text-[#a8b0bd]">{room.count} rooms</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-[#1f2124]">{room.baseRate ? `€${room.baseRate}` : '—'}</p>
            <p className="text-[12px] text-[#a8b0bd]">{room.isBase ? 'Base rate' : 'per night'}</p>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PREFILLED BADGE
// ─────────────────────────────────────────────────────────────────────────────
export function PrefilledBadge() {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
      Pre-filled
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  FIELD WRAPPER  (label + optional pre-filled badge + children)
// ─────────────────────────────────────────────────────────────────────────────
export function Field({ label, prefilled = false, children }) {
  return (
    <div>
      {label && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-[12px] font-bold text-[#1f2124] leading-4 uppercase tracking-wide">{label}</label>
          {prefilled && <PrefilledBadge />}
        </div>
      )}
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CHAT / ONBOARDING PRIMITIVES  (unchanged visual character)
// ─────────────────────────────────────────────────────────────────────────────
export function KompasOrb({ size = 'md' }) {
  const px = size === 'lg' ? 'w-24 h-24' : size === 'md' ? 'w-14 h-14' : size === 'xs' ? 'w-5 h-5' : 'w-8 h-8'
  return (
    <div className={`${px} rounded-full flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm`}>
      <img
        src="/1F735EFA-9CE0-44E6-B87A-54CCDD461E4A.JPG"
        alt="Joel"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mb-4"
    >
      <KompasOrb size="sm" />
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-[#e6e9ef]">
        <div className="flex gap-1.5">
          <span className="typing-dot w-2 h-2 bg-[#a8b0bd] rounded-full inline-block" />
          <span className="typing-dot w-2 h-2 bg-[#a8b0bd] rounded-full inline-block" />
          <span className="typing-dot w-2 h-2 bg-[#a8b0bd] rounded-full inline-block" />
        </div>
      </div>
    </motion.div>
  )
}

export function KompasMessage({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex items-start gap-3 mb-4"
    >
      <KompasOrb size="sm" />
      <div className="bg-white rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm border border-[#e6e9ef] max-w-lg">
        <div className="text-[14px] leading-relaxed text-[#2e3d4b]">{children}</div>
      </div>
    </motion.div>
  )
}

export function UserMessage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end mb-4"
    >
      <div className="bg-lh-brand-bg text-lh-brand rounded-2xl rounded-br-md px-5 py-3 max-w-md border border-lh-brand/10">
        <div className="text-[13.5px] font-medium">{children}</div>
      </div>
    </motion.div>
  )
}

export function InteractiveArea({ children, delay = 0.15 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="ml-11 mb-6"
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROGRESS RING  (sidebar)
// ─────────────────────────────────────────────────────────────────────────────
export function ProgressRing({ percent, size = 20 }) {
  const r = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E5E3" strokeWidth={2} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#125fe3" strokeWidth={2}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700"
      />
    </svg>
  )
}
