// app/legal/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Legal | Pretties by Marg',
    default: 'Legal | Pretties by Marg',
  },
  description: 'Legal information, terms of service, and privacy policy for Pretties by Marg handmade artisan products.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}