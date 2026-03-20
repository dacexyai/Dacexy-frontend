'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap, LayoutDashboard, MessageSquare, Bot,
  CreditCard, Settings, LogOut, ChevronRight,
  Sparkles, X, Users, Shield, Gift, Monitor
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { getInitials, planLabel, planColor, cn } from '@/lib/utils'

const NAV_MAIN = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/chat',      icon: MessageSquare,   label: 'AI Chat',   badge: 'AI' },
  { href: '/agent',     icon: Bot,             label: 'Agent Runs' },
  { href: '/templates', icon: Monitor,         label: 'Templates' },
]

const NAV_TEAM = [
  { href: '/team',       icon: Users,  label: 'Team' },
  { href: '/audit-logs', icon: Shield, label: 'Audit Logs' },
]

const NAV_ACCOUNT = [
  { href: '/billing',  icon: CreditCard, label: 'Billing' },
  { href: '/referral', icon: Gift,       label: 'Referrals' },
  { href: '/settings', icon: Settings,   label: 'Settings' },
]

interface SidebarProps { open?: boolean; onClose?: () => void }

function NavSection({ title, items, pathname, onClose }: any) {
  return (
    <div className="mb-2">
      {title && <p className="text-[9px] font-extrabold text-[#C0C0C0] uppercase tracking-widest px-3 mb-1">{title}</p>}
      {items.map(({ href, icon: Icon, label, badge }: any) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href} onClick={onClose}
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
      })}
    </div>
  )
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, org, logout } = useAuthStore()

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  const plan = (org as any)?.plan ?? (org as any)?.plan_tier ?? 'free'

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col w-64 bg-white border-r border-black/8 transition-transform duration-300 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-black/6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-700 flex items-center justify-center">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <span className="font-serif font-semibold text-lg">Dacexy</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-black/6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#5C5C5C] truncate max-w-[130px]">{(org as any)?.name ?? 'My Workspace'}</p>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block', planColor(plan))}>
                {planLabel(plan)} Plan
              </span>
            </div>
            {(plan === 'free' || plan === 'starter') && (
              <Link href="/billing" className="flex items-center gap-1 text-[10px] font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 px-2.5 py-1.5 rounded-lg transition-colors">
                <Sparkles size={10} /> Upgrade
              </Link>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <NavSection items={NAV_MAIN} pathname={pathname} onClose={onClose} />
          <NavSection title="Workspace" items={NAV_TEAM} pathname={pathname} onClose={onClose} />
          <NavSection title="Account" items={NAV_ACCOUNT} pathname={pathname} onClose={onClose} />
        </nav>

        <div className="p-3 border-t border-black/6">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
              {user ? getInitials(user.full_name) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F0F0F] truncate">{user?.full_name ?? 'User'}</p>
              <p className="text-xs text-[#9E9E9E] truncate">{user?.email ?? ''}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#9E9E9E] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all mt-1">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
