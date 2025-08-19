// app/dashboard/legal/terms-of-service/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Pretties by Marg. Read our policies regarding orders, shipping, returns, and use of our handmade artisan marketplace.',
  keywords: ['terms of service', 'terms and conditions', 'handmade', 'artisan', 'policies', 'Pretties by Marg'],
  openGraph: {
    title: 'Terms of Service | Pretties by Marg',
    description: 'Terms of Service for Pretties by Marg handmade artisan marketplace.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/legal/terms',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}