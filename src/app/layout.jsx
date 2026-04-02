import './globals.css'

export const metadata = {
  title: 'Lighthouse — Onboarding',
  description: 'Hotel onboarding wizard powered by Lighthouse',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-lh-bg text-lh-text-default antialiased">
        {children}
      </body>
    </html>
  )
}
