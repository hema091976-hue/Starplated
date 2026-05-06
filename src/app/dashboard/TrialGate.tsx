'use client';

import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export function TrialGate({ isSubscribed, children }: { isSubscribed: boolean, children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Whitelist the billing page
  const isBillingPage = pathname.includes('/dashboard/billing');
  const showBlurGate = !isSubscribed && !isBillingPage;

  return (
    <div className="relative h-full w-full">
      {showBlurGate && (
        <div className="absolute inset-0 z-[100] bg-slate-950/40 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="bg-slate-900/80 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl max-w-lg w-full flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.2)] animate-pulse">
              <Lock className="text-indigo-400" size={40} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Trial Required</h2>
            <p className="text-slate-300 mb-10 text-lg leading-relaxed">
              You are currently viewing a preview. Start your 30-day free trial to unlock all features and download your QR codes.
            </p>
            <Link 
              href="/dashboard/billing" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 px-10 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 text-lg"
            >
              Start 30-Day Free Trial
            </Link>
            <p className="mt-6 text-sm text-slate-500 font-medium tracking-wide">No charge for 30 days • Cancel anytime</p>
          </div>
        </div>
      )}
      <div className={`h-full transition-all duration-700 ${showBlurGate ? "blur-xl pointer-events-none select-none opacity-[0.45] scale-[0.98] overflow-hidden" : ""}`}>
        {children}
      </div>
    </div>
  );
}
