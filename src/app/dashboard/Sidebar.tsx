'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, QrCode, LogOut, Store, CreditCard, Lock } from 'lucide-react';
import { signOut } from './actions';

export function Sidebar({ businessName, isSubscribed }: { businessName: string, isSubscribed: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Analytics', href: '/dashboard', icon: LayoutDashboard, protected: true },
    { name: 'Menu Context', href: '/dashboard/settings', icon: Settings, protected: true },
    { name: 'QR Codes', href: '/dashboard/qr', icon: QrCode, protected: true },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, protected: false },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl flex flex-col fixed inset-y-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center shrink-0">
            <Store size={14} className="text-white" />
          </div>
          <span className="truncate">{businessName}</span>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Menu</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isLocked = item.protected && !isSubscribed;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.name}
                </div>
                {isLocked && <Lock size={14} className="text-slate-600" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 w-full transition-colors">
            <LogOut size={18} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
