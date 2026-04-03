'use client'

import React, { useState } from 'react'
import { KompasMessage, InteractiveArea, Button, Card } from '../ui'
import { useOnboarding, ContinuePortal } from '../OnboardingContext'
import { PMS_OPTIONS } from '../mockData'

// Letter-based brand icon matching the visual style of IconBrand
function PmsIcon({ pms, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, position: 'relative', overflow: 'hidden',
      borderRadius: 4, flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: '12.5%',
        background: pms.color,
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#fff', fontSize: size * 0.33, fontWeight: 700, lineHeight: 1 }}>
          {pms.logo}
        </span>
      </div>
    </div>
  )
}

function ConnectModal({ pms, onComplete, onClose }) {
  const [phase, setPhase] = useState('idle') // idle | connecting | success
  const [otherName, setOtherName] = useState('')

  const displayName = pms.id === 'other' ? (otherName.trim() || 'your PMS') : pms.name

  const handleConnect = () => {
    if (pms.id === 'other' && !otherName.trim()) return
    setPhase('connecting')
    setTimeout(() => setPhase('success'), 2200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={phase === 'idle' ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[420px] mx-4 overflow-hidden border border-[#e6e9ef]">
        {/* Top accent bar */}
        <div className="h-1" style={{ background: pms.color }} />

        <div className="p-6">
          {phase === 'success' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-[#1f2124] mb-1">Connected!</h3>
              <p className="text-[13px] text-[#52647a] mb-6">
                Your {displayName} account has been linked. We'll pull in your room types and rates in the next steps.
              </p>
              <Button onClick={() => onComplete(pms.id === 'other' ? otherName.trim() : null)} className="w-full justify-center">
                Continue
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <PmsIcon pms={pms} size={40} />
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1f2124]">Connect {pms.name}</h3>
                  <p className="text-[12px] text-[#52647a]">Secure API connection</p>
                </div>
              </div>

              {pms.id === 'other' && (
                <input
                  type="text"
                  value={otherName}
                  onChange={e => setOtherName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                  placeholder="Which PMS do you use?"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-lh-border bg-white text-sm mb-4
                    focus:outline-none focus:ring-2 focus:ring-kompas-indigo/30 focus:border-kompas-indigo
                    placeholder:text-lh-text-muted transition-all"
                />
              )}

              {/* What we'll import */}
              <div className="bg-[#f9fafb] rounded-lg p-3.5 mb-5 space-y-2 border border-[#e6e9ef]">
                <p className="text-[11px] font-bold text-[#a8b0bd] uppercase tracking-wider mb-2">What we'll import</p>
                {['Room types & descriptions', 'Current rate plans', 'Availability & restrictions'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[12px] text-[#2e3d4b]">{item}</span>
                  </div>
                ))}
              </div>

              {phase === 'connecting' ? (
                <div className="flex items-center justify-center gap-2.5 py-3 rounded-lg border border-[#e6e9ef] bg-[#f9fafb]">
                  <div className="w-4 h-4 border-2 border-[#125fe3] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[13px] text-[#52647a]">Connecting to {displayName}…</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleConnect}
                    disabled={pms.id === 'other' && !otherName.trim()}
                    className="flex-1 justify-center"
                  >
                    Connect with {pms.id === 'other' ? (otherName.trim() || 'PMS') : pms.name}
                  </Button>
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PMS() {
  const { data, setData, nextStep } = useOnboarding()
  const [activeModal, setActiveModal] = useState(null)

  // Derive connected state from context so chat updates reflect immediately
  const pmsItems = PMS_OPTIONS.map(p => ({
    ...p,
    connected: data.pms?.connected && (data.pms?.id === p.id || (p.id === 'other' && !PMS_OPTIONS.some(o => o.id === data.pms?.id && o.id !== 'other'))),
    connectedName: data.pms?.id === p.id ? data.pms?.name : undefined,
  }))
  const connectedPms = pmsItems.find(p => p.connected)
  const modalPms = PMS_OPTIONS.find(p => p.id === activeModal)

  const handleConnect = (pmsId, otherName) => {
    const finalName = otherName || PMS_OPTIONS.find(p => p.id === pmsId)?.name
    setData('pms', { id: pmsId, name: finalName, connected: true })
    setActiveModal(null)
    setTimeout(() => nextStep(), 600)
  }

  return (
    <>
      <KompasMessage>
        <p>
          Now for the most important step — connecting your <strong>Property Management System</strong>.
        </p>
        <p className="mt-2 text-lh-text-secondary">
          This is how I'll pull in your room data, rates, and availability to start optimizing your pricing.
          Which PMS do you use?
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-lg space-y-3">
          {pmsItems.map(pms => (
            <Card key={pms.id} className={pms.connected ? 'border-green-200' : ''}>
              <Card.Content className="py-3">
                <div className="flex items-center gap-3">
                  {/* Brand icon */}
                  <PmsIcon pms={pms} size={40} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-[#1f2124]">{pms.connectedName || pms.name}</p>
                      {pms.connected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#a8b0bd] mt-0.5">{pms.desc}</p>
                  </div>

                  {/* Action */}
                  {!pms.connected && !connectedPms && (
                    <Button variant="secondary" size="sm" onClick={() => setActiveModal(pms.id)}>
                      Connect
                    </Button>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))}

        </div>
      </InteractiveArea>

      {/* Skip — portaled after chat messages */}
      {!connectedPms && (
        <ContinuePortal>
          <button
            onClick={() => {
              setData('pms', null)
              nextStep()
            }}
            className="text-[12px] text-[#a8b0bd] hover:text-[#52647a] transition-colors"
          >
            I don't use a PMS — set up rooms manually →
          </button>
        </ContinuePortal>
      )}

      {/* Connect modal */}
      {activeModal && modalPms && (
        <ConnectModal
          pms={modalPms}
          onComplete={(otherName) => handleConnect(activeModal, otherName)}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  )
}
