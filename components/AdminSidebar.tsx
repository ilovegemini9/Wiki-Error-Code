'use client';

import Link from 'next/link';
import { useSafePathname, useSafeRouter } from '@/lib/use-safe-router';
import { LayoutDashboard, FileText, Sparkles, FileClock, CheckCircle2, FolderTree, Tag, Search, Settings, User, LogOut, FileUp, Globe, BarChart3, Megaphone } from 'lucide-react';

export function AdminSidebar() {
  const pathname = useSafePathname(); const router = useSafeRouter();
  const handleLogout = async () => { try { await fetch('/api/admin/login', { method: 'DELETE' }); } finally { router?.push('/admin/login'); } };
  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard }, { label: 'Articles', href: '/admin/articles', icon: FileText },
    { label: 'Generate with AI', href: '/admin/generate', icon: Sparkles, badge: 'AI' }, { label: 'Drafts', href: '/admin/drafts', icon: FileClock },
    { label: 'Published', href: '/admin/published', icon: CheckCircle2 }, { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Brands', href: '/admin/brands', icon: Tag }, { label: 'Bulk Import', href: '/admin/import-export', icon: FileUp },
    { label: 'SEO & Feeds', href: '/admin/seo', icon: Search }, { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Ads', href: '/admin/ads', icon: Megaphone }, { label: 'Settings', href: '/admin/settings', icon: Settings }, { label: 'Profile', href: '/admin/profile', icon: User },
  ];
  return <aside className="w-60 bg-white border-r border-gray-200 shrink-0 min-h-screen flex flex-col font-sans text-sm"><div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-blue-700 text-white font-serif font-bold text-base flex items-center justify-center rounded-xs">W</div><div><div className="font-bold text-gray-900 text-sm leading-none">ErrorCodeWiki</div><div className="text-[10px] text-gray-500 font-mono mt-0.5">Admin Console</div></div></div><a href="/" target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-xs" title="View Live Site"><Globe className="w-4 h-4" /></a></div><nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">{navItems.map((item) => { const Icon = item.icon; const currentPath = pathname || ''; const isActive = currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href)); return <Link key={item.href} href={item.href} className={`flex items-center justify-between px-3 py-2 rounded-xs transition-colors text-xs font-medium ${isActive ? 'bg-blue-50 text-blue-800 font-semibold border-l-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}><div className="flex items-center gap-2.5"><Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} /><span>{item.label}</span></div>{item.badge && <span className="px-1.5 py-0.2 bg-blue-700 text-white text-[9px] font-mono font-bold rounded-xs">{item.badge}</span>}</Link>; })}</nav><div className="p-3 border-t border-gray-200 bg-gray-50"><button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-xs transition-colors"><LogOut className="w-4 h-4 text-red-600" /><span>Logout</span></button></div></aside>;
}
