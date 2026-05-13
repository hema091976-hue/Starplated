import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { QRCodeDisplay } from './QRCodeDisplay';

export default async function QRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('business_name')
    .eq('id', user.id)
    .single();

  const businessName = restaurant?.business_name || 'My Restaurant';
  
  // Dynamic base URL detection for production/dev compatibility
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL 
    : `${protocol}://${host}`;

  const reviewUrl = `${baseUrl}/${user.id}/review`;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">QR Codes</h1>
          <p className="text-slate-400 mt-1">Download and print your custom QR codes for your tables.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Target URL</p>
          <p className="text-xs text-indigo-400 font-mono bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 truncate max-w-[200px] md:max-w-[250px]">
            {reviewUrl}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QRCodeDisplay 
          reviewUrl={reviewUrl} 
          businessName={businessName} 
        />
        
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Print Instructions</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <p className="text-sm text-slate-300">Download your high-resolution QR code using the button on the left.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <p className="text-sm text-slate-300">Print it on table tents, business cards, or menu inserts.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <p className="text-sm text-slate-300">Place them on tables where customers can easily scan them with their phones.</p>
              </li>
            </ul>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-indigo-300 mb-2">Pro Tip</h2>
            <p className="text-sm text-indigo-200/70">
              Your QR code is now dynamic! It will automatically point to your current domain whether you're in development or production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
