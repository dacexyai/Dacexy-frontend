'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { Menu } from 'lucide-react'
import Image from 'next/image'

const AUTH_ROUTES = ['/login', '/register', '/reset-password', '/verify-email', '/onboarding']

export default function AppShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuthRoute = AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r))
  const isChatRoute = pathname === '/chat' || pathname.startsWith('/chat')

  if (isAuthRoute) return <>{children}</>
  if (isChatRoute) return <>{children}</>

  return (
    <div className="flex h-screen bg-[#F9F7F2]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-black/6 bg-white sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-black flex items-center justify-center">
              <Image src="/logo.png" alt="Dacexy" width={24} height={24} className="object-contain" onError={(e: any) => { e.target.style.display = 'none' }} />
            </div>
            <span className="font-serif font-bold">Dacexy</span>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
