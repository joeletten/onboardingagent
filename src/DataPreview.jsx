'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from './OnboardingContext'
import { buildPayload, getMissingFields } from './payload'

// ── JSON syntax highlighter ───────────────────────────────────────────────────
// Uses dangerouslySetInnerHTML with inline styles so Tailwind scanning isn't needed.

function highlight(json) {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        // key vs string value
        return /:$/.test(match)
          ? `<span style="color:#79b8ff">${match}</span>`   // key — blue
          : match === '"null"'
          ? `<span style="color:#6e7681">${match}</span>`   // null string — muted
          : `<span style="color:#9ecbff">${match}</span>`   // string — light blue
      }
      if (/true|false/.test(match)) return `<span style="color:#c084fc">${match}</span>` // bool — purple
      if (/null/.test(match))       return `<span style="color:#6e7681">${match}</span>` // null — muted
      return `<span style="color:#f9a825">${match}</span>` // number — amber
    }
  )
}

// ── Completeness ring ─────────────────────────────────────────────────────────

function CompletenessRing({ pct }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct === 100 ? '#4ade80' : pct >= 60 ? '#fb923c' : '#f87171'

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#ffffff15" strokeWidth="3" />
      <circle
        cx="20" cy="20" r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
        style={{ fill: color, fontSize: 9, fontWeight: 700, fontFamily: 'monospace' }}>
        {pct}%
      </text>
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DataPreview() {
  const { data, steps, currentStep } = useOnboarding()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [section, setSection] = useState('json') // 'json' | 'missing'
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const payload = buildPayload(data, steps, currentStep)
  const missing = getMissingFields(payload)
  const required = missing.filter(m => m.required)
  const recommended = missing.filter(m => !m.required)

  const json = JSON.stringify(payload, null, 2)
  const highlighted = highlight(json)

  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [json])

  const pct = payload._meta.completion_pct
  const propertyName = payload.property.name || 'Unnamed property'

  if (!mounted) return null

  return createPortal(
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        title="View onboarding payload"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#000',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M10 15l4-6" />
        </svg>
      </button>

      {/* Backdrop + panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="panel"
              initial={{ x: 480, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 480, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[480px] flex flex-col"
              style={{ background: '#161b22', borderLeft: '1px solid #30363d' }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #30363d' }}>
                <CompletenessRing pct={pct} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">{propertyName}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#8b949e' }}>
                    {payload._meta.status === 'complete'
                      ? '✓ Onboarding complete'
                      : `Step ${currentStep + 1} of ${steps.length} · ${payload._meta.current_step}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Section tabs */}
                  {['json', 'missing'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSection(s)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                      style={{
                        background: section === s ? '#21262d' : 'transparent',
                        color: section === s ? '#e6edf3' : '#8b949e',
                        border: `1px solid ${section === s ? '#30363d' : 'transparent'}`,
                      }}
                    >
                      {s === 'json' ? 'JSON' : `Issues ${missing.length > 0 ? `(${missing.length})` : ''}`}
                    </button>
                  ))}
                  {/* Copy */}
                  <button
                    onClick={copyJson}
                    title="Copy JSON"
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                    style={{ color: copied ? '#4ade80' : '#8b949e', background: 'transparent' }}
                  >
                    {copied ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>
                  {/* Close */}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                    style={{ color: '#8b949e' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <AnimatePresence mode="wait">
                {section === 'json' ? (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 overflow-auto px-5 py-4"
                  >
                    <pre
                      className="text-[11.5px] leading-relaxed font-mono"
                      style={{ color: '#e6edf3', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="missing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 overflow-auto px-5 py-4 space-y-5"
                  >
                    {missing.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-10">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#1a3a2a' }}>
                          <svg className="w-6 h-6" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-[13px] font-semibold" style={{ color: '#4ade80' }}>All fields complete</p>
                        <p className="text-[12px]" style={{ color: '#8b949e' }}>The payload is ready to submit.</p>
                      </div>
                    ) : (
                      <>
                        {required.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#f87171' }}>
                              Required — blocks submission ({required.length})
                            </p>
                            <div className="space-y-1.5">
                              {required.map(f => (
                                <div key={f.path} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#1f1318', border: '1px solid #3d1f22' }}>
                                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f87171' }} />
                                  <span className="text-[12px] font-medium flex-1" style={{ color: '#fca5a5' }}>{f.label}</span>
                                  <code className="text-[10px] font-mono" style={{ color: '#6e7681' }}>{f.path}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {recommended.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#fb923c' }}>
                              Recommended ({recommended.length})
                            </p>
                            <div className="space-y-1.5">
                              {recommended.map(f => (
                                <div key={f.path} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#1e1a12', border: '1px solid #3d3012' }}>
                                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#fb923c' }} />
                                  <span className="text-[12px] font-medium flex-1" style={{ color: '#fdba74' }}>{f.label}</span>
                                  <code className="text-[10px] font-mono" style={{ color: '#6e7681' }}>{f.path}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: '1px solid #30363d', background: '#0d1117' }}
              >
                <div className="flex items-center gap-3 text-[11px]" style={{ color: '#8b949e' }}>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#f87171' }} />
                    {required.length} required
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#fb923c' }} />
                    {recommended.length} recommended
                  </span>
                </div>
                <p className="text-[10px] font-mono" style={{ color: '#30363d' }}>
                  schema v1.0.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}
