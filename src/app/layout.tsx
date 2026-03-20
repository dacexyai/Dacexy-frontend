'use client'
import type { Metadata } from 'next'
import './globals.css'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { Menu } from 'lucide-react'

const AUTH_ROUTES = ['/login', '/register', '/reset-password', '/verify-email', '/onboarding']

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r)) || pathname === '/'

  if (isAuthRoute) return <>{children}</>

  return (
    <div className="flex h-screen bg-[#F9F7F2]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-black/6 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={18} />
          </button>
          <span className="font-serif font-semibold">Dacexy</span>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
