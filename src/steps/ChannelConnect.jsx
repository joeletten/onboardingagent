'use client'

import React, { useState } from 'react'
import { KompasMessage, InteractiveArea, Button, Card } from '../ui'
import { useOnboarding, ContinuePortal } from '../OnboardingContext'
import IconBrand from '../IconBrand'

const CHANNELS = [
  {
    id: 'booking',
    brand: 'booking',
    name: 'Booking.com',
    accentColor: '#0c3b7c',
    desc: 'Connect your Booking.com account to import room types, rates, and availability automatically.',
    benefit: 'Pre-fills rooms, rates & availability',
  },
  {
    id: 'expedia',
    brand: 'expedia',
    name: 'Expedia Group',
    accentColor: '#f0a500',   // darker shade for text contrast over yellow
    desc: 'Link your Expedia account to sync your listings and streamline setup.',
    benefit: 'Pre-fills rooms, rates & availability',
  },
]

function OAuthModal({ channel, onComplete, onClose }) {
  const [phase, setPhase] = useState('idle') // idle | redirecting | success

  const handleConnect = () => {
    setPhase('redirecting')
    setTimeout(() => setPhase('success'), 2200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={phase === 'idle' ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[420px] mx-4 overflow-hidden border border-[#e6e9ef]">
        {/* Top accent bar */}
        <div className="h-1" style={{ background: channel.accentColor }} />

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
                Your {channel.name} account has been linked. We'll pre-fill your room types and rates in the next steps.
              </p>
              <Button onClick={onComplete} className="w-full justify-center">
                Continue
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <IconBrand name={channel.brand} size={40} />
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1f2124]">Connect {channel.name}</h3>
                  <p className="text-[12px] text-[#52647a]">Secure OAuth connection</p>
                </div>
              </div>

              <p className="text-[13px] text-[#2e3d4b] leading-relaxed mb-5">
                {channel.desc}
              </p>

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

              {phase === 'redirecting' ? (
                <div className="flex items-center justify-center gap-2.5 py-3 rounded-lg border border-[#e6e9ef] bg-[#f9fafb]">
                  <div className="w-4 h-4 border-2 border-[#125fe3] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[13px] text-[#52647a]">Redirecting to {channel.name}…</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleConnect} className="flex-1 justify-center">
                    Connect with {channel.name}
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

export default function ChannelConnect() {
  const { data, setData, nextStep } = useOnboarding()
  const [activeModal, setActiveModal] = useState(null)

  // Derive connected state from context so chat updates reflect immediately
  const channels = CHANNELS.map(c => ({
    ...c,
    connected: (data.channelConnect || []).find(dc => dc.id === c.id)?.connected || false,
  }))
  const connectedCount = channels.filter(c => c.connected).length

  const handleConnect = (channelId) => {
    const updated = channels.map(c =>
      c.id === channelId ? { ...c, connected: true } : c
    )
    setData('channelConnect', updated)
    setActiveModal(null)
  }

  const handleContinue = () => {
    setTimeout(() => nextStep(), 300)
  }

  const modalChannel = CHANNELS.find(c => c.id === activeModal)

  return (
    <>
      <KompasMessage>
        <p>Before we set up everything else, let's connect your distribution channels.</p>
        <p className="mt-2 text-[#52647a]">
          Connecting Booking.com or Expedia lets us automatically import your room types, rates, and availability — so you won't have to enter them manually.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-lg space-y-3">
          {channels.map(channel => (
            <Card key={channel.id} className={channel.connected ? 'border-green-200' : ''}>
              <Card.Content className="py-3">
                <div className="flex items-center gap-3">
                  {/* Brand icon */}
                  <IconBrand name={channel.brand} size={40} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-[#1f2124]">{channel.name}</p>
                      {channel.connected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#a8b0bd] mt-0.5">{channel.benefit}</p>
                  </div>

                  {/* Action */}
                  {!channel.connected && (
                    <Button variant="secondary" size="sm" onClick={() => setActiveModal(channel.id)}>
                      Connect
                    </Button>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))}

        </div>
      </InteractiveArea>

      <ContinuePortal>
        <div className="flex items-center gap-3">
          <Button onClick={handleContinue}>
            {connectedCount > 0 ? 'Continue' : 'Skip for now'}
          </Button>
          {connectedCount === 0 && (
            <p className="text-[12px] text-[#a8b0bd]">
              You can connect channels later in Settings.
            </p>
          )}
        </div>
      </ContinuePortal>

      {/* OAuth modal */}
      {activeModal && modalChannel && (
        <OAuthModal
          channel={modalChannel}
          onComplete={() => handleConnect(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  )
}
