import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelative(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function planLabel(plan: string): string {
  return { free: 'Free', starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' }[plan] ?? plan
}

export function planColor(plan: string): string {
  return {
    free:       'bg-gray-100 text-gray-600',
    starter:    'bg-blue-50 text-blue-700',
    growth:     'bg-violet-50 text-violet-700',
    enterprise: 'bg-amber-50 text-amber-700',
  }[plan] ?? 'bg-gray-100 text-gray-600'
}

export function canUseDesktopAgent(plan: string): boolean {
  return plan === 'growth' || plan === 'enterprise'
    }
