'use client'

/**
 * Prism Design System — Official brand / OTA icons
 * Source: Figma > Prism Foundation > Brands  (file TSqgQEbRb38uGbRF6tjtvO, node 9619:11469)
 *
 * Each brand is reconstructed from the exact Figma layers:
 *   - A coloured badge div at inset 12.5% with the brand's border-radius
 *   - One or more logo image layers positioned within that badge
 *
 * Asset URLs are served by the Figma MCP server (valid ~7 days).
 */
import React from 'react'

// ── Brand definitions ──────────────────────────────────────────────────────────
// inset values follow CSS shorthand: top right bottom left (all %)
const BRANDS = {
  booking: {
    badge: '#0c3b7c',
    badgeRadius: '3px 3px 3px 0',   // Booking's distinctive cut corner (bottom-left square)
    layers: [
      // "B" letter
      { url: 'https://www.figma.com/api/mcp/asset/e373c679-b1bd-43c1-9a70-a2a9a40becb5', inset: '31.64% 41.47% 31.65% 33.63%' },
      // dot (bottom-left of the B)
      { url: 'https://www.figma.com/api/mcp/asset/4bb5608f-36c5-4bfa-afac-722030a0ea31', inset: '59.27% 29.37% 31.65% 61.77%' },
    ],
  },

  expedia: {
    badge: '#fddb32',
    badgeRadius: '4px',
    layers: [
      // yellow arrow mark
      { url: 'https://www.figma.com/api/mcp/asset/917ca114-29ee-4a45-aca9-0d5c9684cc26', inset: '26% 26.03% 24.3% 24.3%' },
    ],
  },

  airbnb: {
    badge: '#ff5a5f',
    badgeRadius: '4px',
    layers: [
      // Bélo symbol
      { url: 'https://www.figma.com/api/mcp/asset/c4ce2c3d-9dc7-4da5-9a5b-d2185cb78658', inset: '22.92% 25% 22.87% 25%' },
    ],
  },

  agoda: {
    badge: '#ffffff',
    badgeRadius: '4px',
    badgeBorder: '0.5px solid #e6e9ef',
    layers: [
      { url: 'https://www.figma.com/api/mcp/asset/f2074c02-e231-4a6c-a62c-d19419582341', inset: '20.83% 26.74% 21.45% 26.74%' },
    ],
  },

  vrbo: {
    badge: '#ffffff',
    badgeRadius: '4px',
    badgeBorder: '0.5px solid #e6e9ef',
    layers: [
      { url: 'https://www.figma.com/api/mcp/asset/d396a9fc-ceec-473e-b298-14a987297fa4', inset: '25% 20.83% 25% 20.83%' },
    ],
  },

  allchannels: {
    badge: '#2c91d4',
    badgeRadius: '4px',
    layers: [
      { url: 'https://www.figma.com/api/mcp/asset/f70835fb-f9c1-4b00-aca3-b2c1cadda982', inset: '20.65% 21.85% 20.65% 21.85%' },
    ],
  },

  tripadvisor: {
    // TripAdvisor uses a green/white gradient background image instead of a flat badge
    bgImage: 'https://www.figma.com/api/mcp/asset/2247540d-66c3-4a9d-a4e8-09a1d2eab373',
    bgInset: '8.33%',
    badge: null,
    layers: [
      { url: 'https://www.figma.com/api/mcp/asset/413bf28f-c573-449b-b1fc-473660a4d9a1', inset: '30.37% 19.24% 30.13% 19.24%' },
    ],
  },

  branddotcom: {
    badge: '#ffffff',
    badgeRadius: '4px',
    badgeBorder: '0.5px solid #e6e9ef',
    layers: [
      { url: 'https://www.figma.com/api/mcp/asset/da44638a-a7ab-487e-864e-b9cd1d758d59', inset: '20% 25% 20% 25%' },
    ],
  },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IconBrand({ name, size = 24, className = '' }) {
  const brand = BRANDS[name?.toLowerCase()]

  if (!brand) {
    // Graceful fallback: coloured square with initial
    return (
      <div
        className={className}
        style={{
          width: size, height: size, borderRadius: 4, flexShrink: 0,
          background: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ color: '#fff', fontSize: size * 0.35, fontWeight: 700, lineHeight: 1 }}>
          {(name || '?').charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative', overflow: 'hidden', borderRadius: 4, flexShrink: 0 }}
    >
      {/* Badge / background */}
      {brand.badge !== null ? (
        <div style={{
          position: 'absolute', inset: '12.5%',
          background: brand.badge,
          borderRadius: brand.badgeRadius || '4px',
          border: brand.badgeBorder,
        }} />
      ) : (
        // image-based background (tripadvisor)
        <div style={{ position: 'absolute', inset: brand.bgInset || '8.33%' }}>
          <img alt="" src={brand.bgImage} style={{ position: 'absolute', display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
        </div>
      )}

      {/* Logo layers */}
      {brand.layers.map((layer, i) => (
        <div key={i} style={{ position: 'absolute', inset: layer.inset }}>
          <img alt="" src={layer.url} style={{ position: 'absolute', display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
        </div>
      ))}
    </div>
  )
}
