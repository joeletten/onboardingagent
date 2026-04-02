'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { KompasOrb } from '../ui'
import { useOnboarding } from '../OnboardingContext'

export default function Complete() {
  const { data } = useOnboarding()
  const connectedOtas = data.otas?.filter(o => o.connected) || []

  const summaryItems = [
    { label: 'Property', value: data.property?.name },
    { label: 'PMS', value: data.pms?.name ? `${data.pms.name} — Connected` : null },
    { label: 'Channels', value: connectedOtas.length > 0 ? connectedOtas.map(o => o.name).join(', ') : 'None yet' },
    { label: 'Room types', value: `${data.rooms?.length || 0} configured` },
    { label: 'Competitors', value: `${data.competitors?.length || 0} tracked` },
    { label: 'Strategy', value: data.pricing?.strategy ? `${data.pricing.strategy.charAt(0).toUpperCase() + data.pricing.strategy.slice(1)} (€${data.pricing.min}–€${data.pricing.max})` : null },
    { label: 'North Star', value: data.northStar },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center max-w-lg mx-auto"
    >
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="mb-6"
      >
        <KompasOrb size="lg" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold mb-2"
      >
        You're all set, {data.name}!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="text-lh-text-secondary mb-8 max-w-md"
      >
        Your first pricing recommendations are being generated right now.
        I'll notify you as soon as they're ready to review and push to your channels.
      </motion.p>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full bg-white rounded-2xl border border-lh-border shadow-sm p-6 text-left mb-6"
      >
        <h3 className="text-xs font-bold text-lh-text-muted uppercase tracking-wider mb-4">
          Setup summary
        </h3>
        <div className="space-y-3">
          {summaryItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-lh-text-secondary">{item.label}</span>
              <span className="text-sm font-medium text-lh-text-primary">{item.value || '—'}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3 w-full"
      >
        <button className="w-full py-3 rounded-xl font-semibold text-white bg-kompas-indigo hover:bg-kompas-indigo/90 transition-all shadow-md hover:shadow-lg">
          Go to Dashboard
        </button>
        <p className="text-xs text-lh-text-muted">
          You can revisit any of these settings anytime from the Settings page.
        </p>
      </motion.div>
    </motion.div>
  )
}
