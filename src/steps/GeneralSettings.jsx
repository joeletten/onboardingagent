import React, { useState, useEffect } from 'react'
import { KompasMessage, InteractiveArea, PrimaryButton } from '../ui'
import { useOnboarding } from '../OnboardingContext'

const COUNTRY_DEFAULTS = {
  Netherlands:     { timezone: 'Europe/Amsterdam', currency: 'EUR', vatRate: '9' },
  France:          { timezone: 'Europe/Paris',     currency: 'EUR', vatRate: '10' },
  Italy:           { timezone: 'Europe/Rome',      currency: 'EUR', vatRate: '10' },
  Spain:           { timezone: 'Europe/Madrid',    currency: 'EUR', vatRate: '10' },
  Austria:         { timezone: 'Europe/Vienna',    currency: 'EUR', vatRate: '10' },
  Switzerland:     { timezone: 'Europe/Zurich',    currency: 'CHF', vatRate: '3.8' },
  'United Kingdom':{ timezone: 'Europe/London',    currency: 'GBP', vatRate: '20' },
  Greece:          { timezone: 'Europe/Athens',    currency: 'EUR', vatRate: '13' },
}

const TIMEZONES = [
  'Europe/Amsterdam', 'Europe/Athens', 'Europe/Berlin', 'Europe/Dublin',
  'Europe/Helsinki', 'Europe/Lisbon', 'Europe/London', 'Europe/Madrid',
  'Europe/Paris', 'Europe/Prague', 'Europe/Rome', 'Europe/Stockholm',
  'Europe/Vienna', 'Europe/Warsaw', 'Europe/Zurich',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'UTC',
]

const CURRENCIES = ['EUR', 'GBP', 'CHF', 'USD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK']

const TABS = [
  { id: 'hotel', label: 'Hotel Details' },
  { id: 'contact', label: 'Contact' },
  { id: 'localization', label: 'Localization' },
]

function Field({ label, children, prefilled }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-semibold text-lh-text-muted uppercase tracking-wider">{label}</label>
        {prefilled && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
            Pre-filled
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

const inputClass = `
  w-full px-3.5 py-2.5 rounded-xl border border-lh-border bg-white text-sm
  focus:outline-none focus:ring-2 focus:ring-kompas-indigo/30 focus:border-kompas-indigo
  placeholder:text-lh-text-muted transition-all
`

export default function GeneralSettings() {
  const { data, setData, nextStep } = useOnboarding()
  const property = data.property

  const countryDefaults = COUNTRY_DEFAULTS[property?.country] || { timezone: 'UTC', currency: 'EUR', vatRate: '10' }

  const [activeTab, setActiveTab] = useState('hotel')
  const [hotel, setHotel] = useState({
    name: data.settings?.hotelDetails?.name || property?.name || '',
    address: data.settings?.hotelDetails?.address || property?.address || '',
    country: data.settings?.hotelDetails?.country || property?.country || '',
  })
  const [contact, setContact] = useState({
    contactName: data.settings?.contact?.contactName || 'Sophie Laurent',
    phone: data.settings?.contact?.phone || '+33 1 23 45 67 89',
    email: data.settings?.contact?.email || 'info@hotel.com',
    website: data.settings?.contact?.website || 'www.hotel.com',
  })
  const [localization, setLocalization] = useState({
    timezone: data.settings?.localization?.timezone || countryDefaults.timezone,
    currency: data.settings?.localization?.currency || countryDefaults.currency,
    vatRate: data.settings?.localization?.vatRate || countryDefaults.vatRate,
  })

  const contactWasPrefilled = !data.settings?.contact
  const localizationWasPrefilled = !data.settings?.localization

  const handleSave = () => {
    setData('settings', {
      hotelDetails: hotel,
      contact,
      localization,
    })
    setTimeout(() => nextStep(), 300)
  }

  const tabComplete = {
    hotel: hotel.name && hotel.address && hotel.country,
    contact: contact.contactName && contact.email,
    localization: localization.timezone && localization.currency,
  }

  return (
    <>
      <KompasMessage>
        <p>Let's make sure your account is set up correctly.</p>
        <p className="mt-2 text-lh-text-secondary">
          I've pre-filled some details from your account — please review them and adjust anything that's not right.
        </p>
      </KompasMessage>

      <InteractiveArea>
        <div className="max-w-lg">
          {/* Tabs */}
          <div className="flex gap-1 bg-lh-bg rounded-xl p-1 mb-5 border border-lh-border-light">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-[12.5px] font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-kompas-indigo shadow-sm border border-lh-border-light'
                    : 'text-lh-text-muted hover:text-lh-text-primary'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {tab.label}
                  {tabComplete[tab.id] && (
                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl border border-lh-border p-5 shadow-sm space-y-4">
            {activeTab === 'hotel' && (
              <>
                <Field label="Hotel Name" prefilled={!!property?.name}>
                  <input
                    className={inputClass}
                    value={hotel.name}
                    onChange={e => setHotel(h => ({ ...h, name: e.target.value }))}
                    placeholder="e.g. Maison Proust"
                  />
                </Field>
                <Field label="Address" prefilled={!!property?.address}>
                  <input
                    className={inputClass}
                    value={hotel.address}
                    onChange={e => setHotel(h => ({ ...h, address: e.target.value }))}
                    placeholder="e.g. 7 Rue Marcel Proust"
                  />
                </Field>
                <Field label="Country" prefilled={!!property?.country}>
                  <input
                    className={inputClass}
                    value={hotel.country}
                    onChange={e => setHotel(h => ({ ...h, country: e.target.value }))}
                    placeholder="e.g. France"
                  />
                </Field>
              </>
            )}

            {activeTab === 'contact' && (
              <>
                <p className="text-xs text-lh-text-muted -mb-1">Pre-filled from your Lighthouse account. Update if needed.</p>
                <Field label="Contact Name" prefilled={contactWasPrefilled}>
                  <input
                    className={inputClass}
                    value={contact.contactName}
                    onChange={e => setContact(c => ({ ...c, contactName: e.target.value }))}
                    placeholder="e.g. Sophie Laurent"
                  />
                </Field>
                <Field label="Phone Number" prefilled={contactWasPrefilled}>
                  <input
                    className={inputClass}
                    value={contact.phone}
                    onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                    placeholder="e.g. +33 1 23 45 67 89"
                  />
                </Field>
                <Field label="Email" prefilled={contactWasPrefilled}>
                  <input
                    type="email"
                    className={inputClass}
                    value={contact.email}
                    onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                    placeholder="e.g. info@hotel.com"
                  />
                </Field>
                <Field label="Website" prefilled={contactWasPrefilled}>
                  <input
                    className={inputClass}
                    value={contact.website}
                    onChange={e => setContact(c => ({ ...c, website: e.target.value }))}
                    placeholder="e.g. www.hotel.com"
                  />
                </Field>
              </>
            )}

            {activeTab === 'localization' && (
              <>
                <p className="text-xs text-lh-text-muted -mb-1">Auto-detected from your country. Adjust if needed.</p>
                <Field label="Timezone" prefilled={localizationWasPrefilled}>
                  <select
                    className={inputClass}
                    value={localization.timezone}
                    onChange={e => setLocalization(l => ({ ...l, timezone: e.target.value }))}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Currency" prefilled={localizationWasPrefilled}>
                  <select
                    className={inputClass}
                    value={localization.currency}
                    onChange={e => setLocalization(l => ({ ...l, currency: e.target.value }))}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="VAT Rate (%)" prefilled={localizationWasPrefilled}>
                  <div className="relative">
                    <input
                      className={inputClass}
                      value={localization.vatRate}
                      onChange={e => setLocalization(l => ({ ...l, vatRate: e.target.value }))}
                      placeholder="e.g. 10"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-lh-text-muted">%</span>
                  </div>
                </Field>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              {TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    activeTab === tab.id ? 'bg-kompas-indigo w-4' : 'bg-lh-border'
                  }`}
                />
              ))}
            </div>
            {activeTab !== 'localization' ? (
              <button
                onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}
                className="text-sm font-semibold text-kompas-indigo hover:text-kompas-indigo/80 transition-colors flex items-center gap-1"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ) : (
              <PrimaryButton
                onClick={handleSave}
                disabled={!hotel.name || !contact.email || !localization.timezone}
              >
                Save & Continue
              </PrimaryButton>
            )}
          </div>
        </div>
      </InteractiveArea>
    </>
  )
}
