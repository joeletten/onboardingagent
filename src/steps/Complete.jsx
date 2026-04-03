'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { KompasMessage, InteractiveArea } from '../ui'
import { useOnboarding } from '../OnboardingContext'

export default function Complete() {
  const { data } = useOnboarding()

  return (
    <>
      <KompasMessage>
        <p className="font-semibold text-[15px] mb-1">You're all set{data.name ? `, ${data.name}` : ''}!</p>
        <p>
          Everything is configured and your first pricing recommendations are being
          generated right now. I'll notify you as soon as they're ready.
        </p>
      </KompasMessage>

      <InteractiveArea delay={0.3}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="rounded-xl border border-[#e6e9ef] bg-white p-5 shadow-sm max-w-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e8f5e9]">
              <svg className="w-5 h-5 text-[#2e7d32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#1f2124]">Setup complete</p>
              <p className="text-[12px] text-[#52647a]">Lighthouse is ready to optimise your pricing</p>
            </div>
          </div>

          <button
            className="w-full h-10 rounded-lg font-medium text-[14px] text-white bg-[#125fe3] hover:bg-[#0e4fc4] active:bg-[#0b3fa0] transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </InteractiveArea>
    </>
  )
}
