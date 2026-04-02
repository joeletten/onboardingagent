'use client'

import React from 'react'
import { useOnboarding } from './OnboardingContext'
import {
  Building2, Globe, Bed, Star, CheckCircle2, User, Smile,
  Plug, Settings, Link2, LayoutDashboard, Tag, Layers, Grid3X3,
} from 'lucide-react'

const ICONS = {
  smile: Smile,
  user: User,
  building: Building2,
  settings: Settings,
  link2: Link2,
  plug: Plug,
  globe: Globe,
  bed: Bed,
  tag: Tag,
  layers: Layers,
  grid: Grid3X3,
  star: Star,
  check: LayoutDashboard,
}

export default function Sidebar() {
  const { steps, currentStep, data, reset } = useOnboarding()
  const percent = Math.round((currentStep / (steps.length - 1)) * 100)

  return (
    <aside className="w-[240px] bg-white border-r border-lh-border-light flex flex-col h-full flex-shrink-0">

      {/* ── Header ────────────────────────────────── */}
      <div className="px-[14px] pt-[0px]">
        {/* Logo row */}
        <div className="flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-2.5">
            {/* Lighthouse logomark — orange square */}
            <div className="w-8 h-8 rounded-lg bg-lh-brand-500 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
              <img src="/LH-symbol-white_RGB.png" alt="Lighthouse" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-lh-text-primary leading-tight">Lighthouse</p>
              <p className="text-[10px] text-lh-text-secondary leading-tight">Onboarding</p>
            </div>
          </div>
        </div>

        {/* Hotel name pill (property picker style) */}
        {data.property && (
          <div className="relative mb-2">
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{
                background: 'linear-gradient(84deg, rgba(254,180,136,0.55) 0%, rgba(230,233,239,0.55) 100%)',
              }}
            >
              <div className="w-6 h-6 rounded-md bg-lh-brand-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-[9px]">
                  {(data.property.name || '??').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-[12px] font-medium text-lh-text-default truncate flex-1 min-w-0">
                {data.property.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Progress bar ─────────────────────────── */}
      <div className="px-[14px] pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-lh-text-secondary uppercase tracking-widest">Setup</span>
          <span className="text-[10px] font-semibold text-lh-text-secondary">{percent}%</span>
        </div>
        <div className="h-1 bg-lh-neutral-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #fb6214, #f4845f)',
            }}
          />
        </div>
      </div>

      {/* ── Step list ────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-[14px] py-1 space-y-[2px]">
        {steps.map((step, i) => {
          const Icon = ICONS[step.icon] || Settings
          const isComplete = i < currentStep
          const isCurrent = i === currentStep

          return (
            <div
              key={step.id}
              className={`flex items-center gap-[10px] h-8 pl-[6px] pr-2 rounded-lg transition-colors duration-150 ${
                isCurrent
                  ? 'bg-lh-brand-bg'
                  : isComplete
                  ? 'hover:bg-lh-border-light/60'
                  : 'opacity-50'
              }`}
            >
              {/* Icon */}
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {isComplete ? (
                  <CheckCircle2
                    size={14}
                    className="text-green-500"
                    strokeWidth={2.2}
                  />
                ) : (
                  <Icon
                    size={14}
                    strokeWidth={isCurrent ? 2.2 : 1.8}
                    className={isCurrent ? 'text-lh-brand' : 'text-lh-text-secondary'}
                  />
                )}
              </div>

              {/* Label + summary */}
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] truncate leading-tight ${
                  isCurrent
                    ? 'font-semibold text-lh-brand'
                    : isComplete
                    ? 'font-medium text-lh-text-default'
                    : 'font-medium text-lh-text-secondary'
                }`}>
                  {step.label}
                </p>
                {isComplete && <StepSummary stepId={step.id} data={data} />}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── Footer ───────────────────────────────── */}
      <div className="px-[14px] py-3 border-t border-lh-border-light">
        <button
          onClick={reset}
          className="w-full text-[11px] text-lh-text-secondary hover:text-red-500 transition-colors py-1.5 text-center"
        >
          Reset & start over
        </button>
      </div>
    </aside>
  )
}

function StepSummary({ stepId, data }) {
  let text = ''
  switch (stepId) {
    case 'welcome': text = data.name; break
    case 'role': text = data.role; break
    case 'property': {
      const name = data.property?.name
      const currency = data.settings?.localization?.currency
      text = name ? (currency ? `${name} · ${currency}` : name) : ''
      break
    }
    case 'channelConnect': {
      const connected = data.channelConnect?.filter(c => c.connected) || []
      text = connected.length > 0 ? connected.map(c => c.name).join(', ') : 'Skipped'
      break
    }
    case 'pms': text = data.pms?.name; break
    case 'ota': text = data.otas?.filter(o => o.connected).map(o => o.name).join(', ') || 'Skipped'; break
    case 'rooms': text = `${data.rooms?.length || 0} room types`; break
    case 'extras': text = data.extras?.length > 0 ? `${data.extras.length} item${data.extras.length !== 1 ? 's' : ''}` : 'Skipped'; break
    case 'ratePlans': {
      const total = data.ratePlans?.length || 0
      const roots = data.ratePlans?.filter(p => p.type === 'root').length || 0
      text = total > 0 ? `${total} plan${total !== 1 ? 's' : ''} · ${roots} root` : 'Skipped'
      break
    }
    case 'distribution': {
      const n = Object.keys(data.distribution || {}).length
      text = n > 0 ? `${n} channel${n !== 1 ? 's' : ''} mapped` : 'Skipped'
      break
    }
    case 'competitors': text = `${data.competitors?.length || 0} selected`; break
    default: break
  }
  if (!text) return null
  return <p className="text-[10px] text-lh-text-secondary truncate leading-none mt-0.5">{text}</p>
}
