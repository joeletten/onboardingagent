'use client'

import React from 'react'
import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import Sidebar from './Sidebar'
import Chat from './Chat'
import DataPreview from './DataPreview'

function AppInner() {
  const { resetId } = useOnboarding()
  return (
    <div className="flex h-screen bg-lh-bg font-sans">
      <Sidebar />
      <Chat key={resetId} />
      <DataPreview />
    </div>
  )
}

export default function App() {
  return (
    <OnboardingProvider>
      <AppInner />
    </OnboardingProvider>
  )
}
