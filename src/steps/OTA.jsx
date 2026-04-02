'use client'

import React, { useState, useRef, useEffect } from 'react'
import { KompasMessage, InteractiveArea, ConnectButton, Button, Card } from '../ui'
import { useOnboarding } from '../OnboardingContext'
import { OTA_OPTIONS } from '../mockData'
import IconBrand from '../IconBrand'

export default function OTA() {
  const { data, setData, nextStep } = useOnboarding()
  const [connectingIds, setConnectingIds] = useState(new Set())
  const dataRef = useRef(data)
  useEffect(() => { dataRef.current = data }, [data])

  // Derive connected state from context so chat updates reflect immediately
  const channelConnectedIds = new Set(
    (data.channelConnect || []).filter(c => c.connected).map(c => c.id)
  )
  const otas = OTA_OPTIONS.map(o => ({
    ...o,
    connected: channelConnectedIds.has(o.id) || (data.otas?.find(s => s.id === o.id)?.connected ?? false),
    connecting: connectingIds.has(o.id),
  }))

  const handleConnect = (id) => {
    setConnectingIds(prev => new Set([...prev, id]))
    setTimeout(() => {
      const d = dataRef.current
      const existingOtas = d.otas || []
      const existing = existingOtas.find(o => o.id === id)
      if (existing) {
        setData('otas', existingOtas.map(o => o.id === id ? { ...o, connected: true } : o))
      } else {
        const option = OTA_OPTIONS.find(o => o.id === id)
        setData('otas', [...existingOtas, { id, name: option?.name || id, connected: true }])
      }
      setConnectingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }, 2000)
  }

  const handleContinue = () => {
    const channelIds = new Set((dataRef.current.channelConnect || []).filter(c => c.connected).map(c => c.id))
    setData('otas', OTA_OPTIONS.map(o => ({
      id: o.id, name: o.name,
      connected: channelIds.has(o.id) || (dataRef.current.otas || []).find(s => s.id === o.id)?.connected || false,
    })))
    nextStep()
  }

  const anyConnected = otas.some(o => o.connected)
  const alreadyConnectedCount = otas.filter(o => o.connected).length

  return (
    <>
      <KompasMessage>
        <p>
          {alreadyConnectedCount > 0
            ? <>I've carried over your connected channels. Connect any remaining ones so I can push optimised rates across all your distribution.</>
            : <>I found <strong>{data.property?.name || 'your property'}</strong> listed on these booking channels. Connect them so I can start optimising your distribution.</>
          }
        </p>
        <p className="mt-2 text-[#52647a]">
          This is how we'll push optimised rates to where your guests book.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-lg space-y-3">
          {otas.map(ota => (
            <Card key={ota.id} className={ota.connected ? 'border-green-200' : ''}>
              <Card.Content className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconBrand name={ota.brand} size={40} />
                    <div>
                      <p className="text-[13px] font-semibold text-[#1f2124]">{ota.name}</p>
                      <p className="text-[12px] text-[#a8b0bd]">
                        {ota.connected ? 'Ready to receive rates' : `${ota.commission} commission`}
                      </p>
                    </div>
                  </div>
                  <ConnectButton
                    connected={ota.connected}
                    connecting={ota.connecting}
                    onClick={() => handleConnect(ota.id)}
                  />
                </div>
              </Card.Content>
            </Card>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleContinue}>
              {anyConnected ? 'Continue' : 'Skip for now'}
            </Button>
            {!anyConnected && (
              <p className="text-[12px] text-[#a8b0bd]">
                You can always connect channels later
              </p>
            )}
          </div>
        </div>
      </InteractiveArea>
    </>
  )
}
