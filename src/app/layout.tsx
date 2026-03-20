import type { Metadata } from 'next'
import './globals.css'
import AppShellClient from './AppShellClient'

export const metadata: Metadata = {
  title: 'Dacexy - Enterprise AI Platform',
  description: 'The all-in-one AI platform for your business',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShellClient>{children}</AppShellClient>
      </body>
    </html>
  )
}
