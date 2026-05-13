import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { headers } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server Action for Activation
async function activateInvite(formData: FormData) {
  'use server';
  
  const restaurantId = formData.get('restaurantId') as string;
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Get User email
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(restaurantId);
  if (userError || !userData.user) {
    throw new Error('User not found');
  }

  const email = userData.user.email;
  if (!email) throw new Error('No email found');

  // 2. Generate Magic Link
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email
  });

  if (linkError || !linkData.properties?.action_link) {
    throw new Error('Could not generate activation link');
  }

  // 3. Redirect to action_link which will authenticate and send to site URL
  // We want to redirect them to /dashboard after login, but action_link usually respects SITE_URL.
  // We can append &redirect_to=/dashboard to the action link if it doesn't have it.
  let actionLink = linkData.properties.action_link;
  const urlObj = new URL(actionLink);
  
  // Get protocol and host dynamically for local/prod support
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL 
    : `${protocol}://${host}`;

  urlObj.searchParams.set('redirect_to', `${baseUrl}/dashboard`);

  redirect(urlObj.toString());
}

export default async function WelcomePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const headerList = await headers();
  const fullUrl = headerList.get('referer') || '';
  
  // Fallback for empty slug param (Next.js Edge bug)
  let activeSlug = params.slug;
  if (!activeSlug && fullUrl.includes('/welcome/')) {
    activeSlug = fullUrl.split('/welcome/')[1].split('?')[0].split('#')[0];
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Find restaurant by matching slug using Admin client to bypass RLS
  const { data: restaurants, error: fetchError } = await supabaseAdmin.from('restaurants').select('id, business_name');
  
  const slugify = (name: string) => (name || '').toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^a-z0-9\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
  
  const matchedRestaurant = restaurants?.find(r => {
    const rSlug = slugify(r.business_name);
    // Support BOTH slug matching and direct UUID matching
    return rSlug === activeSlug || r.id === activeSlug;
  });
  
  if (!matchedRestaurant) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Restaurant Not Found</h1>
          <p className="text-slate-400 mb-8">We couldn't find a review page for "{activeSlug || 'this restaurant'}".</p>
          <a href="/" className="text-indigo-400 underline">Return to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-xl">
            <Sparkles size={32} className="text-[#fbbc04]" />
          </div>
          <h1 className="text-xl font-medium text-slate-300">StarPlated</h1>
        </div>

        {/* Welcome Card */}
        <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Welcome<br/>
              <span className="text-indigo-400">{matchedRestaurant.business_name}</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your free 30-day StarPlated trial is already active.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span>Your Google review flow is connected</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span>Your QR codes are ready</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span>Your review system is live</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No setup required</p>
          </div>

          <form action={activateInvite}>
            <input type="hidden" name="restaurantId" value={matchedRestaurant.id} />
            <button 
              type="submit"
              className="w-full bg-white text-slate-900 font-bold text-lg py-4 px-6 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              Access Dashboard
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
