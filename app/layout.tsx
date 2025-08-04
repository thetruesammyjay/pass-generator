import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'pass-gen',
  description: 'Generate deterministic passwords. One password to get many more passwords',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
