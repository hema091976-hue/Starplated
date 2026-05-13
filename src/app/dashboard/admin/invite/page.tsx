import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Building2, Mail, Link as LinkIcon, Edit, Upload, CheckCircle2, Utensils } from 'lucide-react';
import { headers } from 'next/headers';
import { QRCodeDisplay } from '../../qr/QRCodeDisplay';

export default async function AdminInvitePage({ searchParams }: { searchParams: { success?: string, slug?: string, error?: string, businessName?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect route strictly for the founder
  if (!user || (user.email !== 'admmin@starplated.com' && user.email !== 'admin@starplated.com')) {
    redirect('/dashboard');
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all provisioned restaurants
  const { data: allRestaurants } = await supabaseAdmin
    .from('restaurants')
    .select('id, business_name, created_at, menu_context');

  // Fetch users to get the invite slugs from metadata
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  
  const provisionedList = allRestaurants?.map(rest => {
    const owner = users.find(u => u.id === rest.id);
    return {
      ...rest,
      slug: owner?.user_metadata?.invite_slug || owner?.app_metadata?.invite_slug || rest.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  async function createMailedRestaurant(formData: FormData) {
    'use server';
    
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const businessName = formData.get('business_name') as string;
    const tempEmail = formData.get('temp_email') as string;
    const googlePlaceId = formData.get('google_place_id') as string;
    const description = formData.get('description') as string;
    const menuContext = formData.get('menu_context') as string;
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 1. Create User
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      email_confirm: true,
      password: Math.random().toString(36).slice(-10) + 'A1!',
      app_metadata: { is_mailed: true, invite_slug: slug }
    });

    if (userError) {
      redirect(`/dashboard/admin/invite?error=${encodeURIComponent('Auth Error: ' + userError.message)}`);
    }

    const userId = userData.user.id;

    // 2. Create Restaurant Record
    const { error: restError } = await supabaseAdmin.from('restaurants').insert({
      id: userId,
      business_name: businessName,
      google_place_id: googlePlaceId,
      ambiance_context: description,
      menu_context: menuContext,
      subscription_status: 'trialing' // Pre-activated trial
    });

    if (restError) {
      // Rollback user creation
      await supabaseAdmin.auth.admin.deleteUser(userId);
      redirect(`/dashboard/admin/invite?error=${encodeURIComponent('Database Error: ' + restError.message)}`);
    }

    // Redirect to success state
    redirect(`/dashboard/admin/invite?success=true&slug=${slug}&businessName=${encodeURIComponent(businessName)}`);
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Generate Mailed Invite</h1>
        <p className="text-slate-400 mt-1">Pre-provision a restaurant account for physical outreach.</p>
      </div>

      {searchParams.error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm font-medium">{searchParams.error}</p>
        </div>
      )}

      {searchParams.success ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restaurant Provisioned!</h2>
          <p className="text-slate-400 mb-6">The account is ready. Print the table tents with this QR Code.</p>
          
          <div className="max-w-xs mx-auto mb-8">
            <QRCodeDisplay 
              reviewUrl={`https://starplated.com/welcome/${searchParams.slug}`} 
              businessName={searchParams.businessName || 'Activation QR'} 
            />
          </div>
          
          <div>
            <a href="/dashboard/admin/invite" className="text-sm font-medium text-slate-300 hover:text-white underline underline-offset-4">
              Create another invite
            </a>
          </div>
        </div>
      ) : (
        <form action={createMailedRestaurant} className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Building2 size={18} />
                </div>
                <input 
                  name="business_name"
                  type="text" 
                  className="w-full bg-[#020617]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Santorini Greek Taverna"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Temporary Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input 
                  name="temp_email"
                  type="email" 
                  className="w-full bg-[#020617]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. santorini-invite@starplated.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Google Place ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <LinkIcon size={18} />
                </div>
                <input 
                  name="google_place_id"
                  type="text" 
                  className="w-full bg-[#020617]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ambiance & General Setup</label>
              <div className="relative group">
                <div className="absolute top-3 left-4 pointer-events-none text-slate-500">
                  <Edit size={18} />
                </div>
                <textarea 
                  name="description"
                  className="w-full h-24 bg-[#020617]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="e.g. cozy, family-friendly, premium..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Menu Context (Dishes/Drinks)</label>
              <div className="relative group">
                <div className="absolute top-3 left-4 pointer-events-none text-slate-500">
                  <Utensils size={18} />
                </div>
                <textarea 
                  name="menu_context"
                  className="w-full h-32 bg-[#020617]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="e.g. Moussaka, Souvlaki, Tzatziki, Baklava..."
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Generate Invite & Magic Link
            </button>
          </div>
        </form>
      )}

      {/* Provisioned Restaurants List */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Recently Provisioned Restaurants</h2>
        <div className="space-y-4">
          {provisionedList.length === 0 ? (
            <p className="text-slate-500 italic">No restaurants provisioned yet.</p>
          ) : (
            provisionedList.map((rest) => (
              <div key={rest.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{rest.business_name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">starplated.com/welcome/{rest.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href={`/welcome/${rest.slug}`} 
                    target="_blank"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
                  >
                    Test Flow
                  </a>
                  <a 
                    href={`/dashboard/admin/invite?success=true&slug=${rest.slug}&businessName=${encodeURIComponent(rest.business_name)}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium text-white transition-colors flex items-center gap-2"
                  >
                    <Download size={14} />
                    QR Code
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
