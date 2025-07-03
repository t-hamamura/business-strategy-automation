import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Business Strategy Automation',
    template: '%s | Business Strategy Automation',
  },
  description: 'Gemini AIを活用した包括的な事業戦略策定プラットフォーム',
  keywords: ['戦略', 'AI', 'ビジネス', 'コンサルティング', '自動化'],
  authors: [{ name: 'Business Strategy Automation Team' }],
  creator: 'Business Strategy Automation',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    title: 'Business Strategy Automation',
    description: 'Gemini AIを活用した包括的な事業戦略策定プラットフォーム',
    siteName: 'Business Strategy Automation',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Strategy Automation',
    description: 'Gemini AIを活用した包括的な事業戦略策定プラットフォーム',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
