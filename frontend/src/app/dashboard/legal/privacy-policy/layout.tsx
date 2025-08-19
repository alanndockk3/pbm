// app/dashboard/legal/privacy-policy/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Pretties by Marg. Learn how we collect, use, and protect your personal information when shopping for handmade artisan products.',
  keywords: ['privacy policy', 'data protection', 'personal information', 'GDPR', 'CCPA', 'handmade', 'Pretties by Marg'],
  openGraph: {
    title: 'Privacy Policy | Pretties by Marg',
    description: 'Privacy Policy for Pretties by Marg handmade artisan marketplace.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/legal/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}