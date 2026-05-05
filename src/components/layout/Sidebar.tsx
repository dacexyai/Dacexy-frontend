  'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Bot, Settings, LogOut, ChevronRight, X, Users, Shield, Gift, Monitor, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { getInitials, cn } from '@/lib/utils'
import Image from 'next/image'

const NAV_MAIN = [
  { href: '/chat',      icon: MessageSquare, label: 'AI Chat',    badge: 'AI' },
  { href: '/agent',     icon: Bot,           label: 'Agent Runs' },
  { href: '/templates', icon: Monitor,       label: 'Templates'  },
]

const NAV_WORKSPACE = [
  { href: '/team',       icon: Users,  label: 'Team'       },
  { href: '/audit-logs', icon: Shield, label: 'Audit Logs' },
  { href: '/referral',   icon: Gift,   label: 'Referrals'  },
]

interface SidebarProps { open?: boolean; onClose?: () => void }

function NavItem({ href, icon: Icon, label, badge, pathname, onClose }: any) {
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
  return (
    <Link href={href} onClick={onClose}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        active ? 'bg-violet-50 text-violet-700' : 'text-[#5C5C5C] hover:bg-gray-50 hover:text-[#0F0F0F]'
      )}>
      <Icon size={16} className={active ? 'text-violet-600' : 'text-[#9E9E9E] group-hover:text-[#5C5C5C]'} />
      <span className="flex-1">{label}</span>
      {badge && <span className="text-[9px] font-extrabold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">{badge}</span>}
      {active && <ChevronRight size={13} className="text-violet-400" />}
    </Link>
  )
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, org, logout } = useAuthStore()
  const plan = (org as any)?.plan_tier ?? 'free'

  function handleLogout() {
    logout()
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col w-64 bg-white border-r border-black/8 transition-transform duration-300 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-black/6">
          <Link href="/chat" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <Image src="/logo.png" alt="Dacexy" width={28} height={28} className="object-contain" onError={(e: any) => { e.target.style.display = 'none' }} />
            </div>
            <span className="font-serif font-bold text-lg text-[#0F0F0F]">Dacexy</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Workspace badge */}
        <div className="px-4 py-3 border-b border-black/6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#5C5C5C] truncate max-w-[140px]">{(org as any)?.name ?? 'My Workspace'}</p>
              <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                {plan} Plan
              </span>
            </div>
            {(plan === 'free' || plan === 'starter') && (
              <Link href="/settings" className="flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white px-2.5 py-1.5 rounded-lg transition-all hover:opacity-90">
                <Sparkles size={9} /> Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-0.5 mb-4">
            {NAV_MAIN.map(item => <NavItem key={item.href} {...item} pathname={pathname} onClose={onClose} />)}
          </div>
          <p className="text-[9px] font-extrabold text-[#C0C0C0] uppercase tracking-widest px-3 mb-1">Workspace</p>
          <div className="space-y-0.5 mb-4">
            {NAV_WORKSPACE.map(item => <NavItem key={item.href} {...item} pathname={pathname} onClose={onClose} />)}
          </div>
          <p className="text-[9px] font-extrabold text-[#C0C0C0] uppercase tracking-widest px-3 mb-1">Account</p>
          <div className="space-y-0.5">
            <NavItem href="/settings" icon={Settings} label="Settings" pathname={pathname} onClose={onClose} />
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-black/6">
          <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user ? getInitials(user.full_name) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F0F0F] truncate">{user?.full_name ?? 'User'}</p>
              <p className="text-xs text-[#9E9E9E] truncate">{user?.email ?? ''}</p>
            </div>
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#9E9E9E] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
