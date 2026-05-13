import { createClient } from '@/utils/supabase/server';
import { Sidebar } from './Sidebar';
import { redirect } from 'next/navigation';
import { TrialGate } from './TrialGate';
import { headers } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch restaurant details including subscription
  let { data: restaurant } = await supabase
    .from('restaurants')
    .select('business_name, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single();

  // "Safe Create" - If restaurant record is missing for some reason, create it now
  if (!restaurant) {
    const { data: newRestaurant, error: insertError } = await supabase
      .from('restaurants')
      .insert({
        id: user.id,
        business_name: 'My Restaurant'
      })
      .select('business_name, subscription_status, stripe_customer_id')
      .single();
    
    if (!insertError) {
      restaurant = newRestaurant;
    }
  }

  const businessName = restaurant?.business_name || 'My Restaurant';
  const isAdmin = user.email === 'admmin@starplated.com' || user.email === 'admin@starplated.com';
  const isMailed = user.app_metadata?.is_mailed === true;
  const isSubscribed = isAdmin || isMailed || ((restaurant?.subscription_status === 'active' || restaurant?.subscription_status === 'trialing') && !!restaurant?.stripe_customer_id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex overflow-hidden">
      <Sidebar businessName={businessName} isSubscribed={isSubscribed} isAdmin={isAdmin} />
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0 bg-slate-950 relative h-screen overflow-y-auto">
        <TrialGate isSubscribed={isSubscribed}>
          {children}
        </TrialGate>
      </main>
    </div>
  );
}
