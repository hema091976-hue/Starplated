'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, QrCode, LogOut, Store, CreditCard, Lock, Menu, X, Users } from 'lucide-react';
import { signOut } from './actions';

export function Sidebar({ businessName, isSubscribed, isAdmin }: { businessName: string, isSubscribed: boolean, isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Growth Overview', href: '/dashboard', icon: LayoutDashboard, protected: true },
    { name: 'Review Context', href: '/dashboard/settings', icon: Settings, protected: true },
    { name: 'QR Codes', href: '/dashboard/qr', icon: QrCode, protected: true },
    { name: 'Billing & Plan', href: '/dashboard/billing', icon: CreditCard, protected: false },
  ];

  if (isAdmin) {
    navItems.unshift({ name: 'Admin Portal', href: '/dashboard/admin/invite', icon: Users, protected: false });
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#001d3d] border-b border-white/5 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3 font-bold text-lg">
          <div className="w-8 h-8 relative shrink-0">
             <img src="/logo.png" alt="StarPlated" className="w-full h-full object-contain" />
          </div>
          <span className="truncate text-white text-sm uppercase tracking-wide">Dashboard</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#001d3d] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3 font-bold text-lg">
            <div className="w-10 h-10 relative shrink-0">
               <img src="/logo.png" alt="StarPlated" className="w-full h-full object-contain" />
            </div>
            <span className="truncate text-white text-sm uppercase tracking-wide">Dashboard</span>
          </div>
        </div>
      
      <div className="p-4 flex-1">
        <div className="text-xs font-bold text-[#fbbc04]/60 uppercase tracking-widest mb-6 px-3">Main Menu</div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isLocked = item.protected && !isSubscribed;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
        <div className="px-3 mb-4">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logged in as</p>
           <p className="text-sm font-bold text-white truncate">{businessName}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-all border border-transparent hover:border-red-500/20">
            <LogOut size={18} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
    </>
  );
}
