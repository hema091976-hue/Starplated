import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { StripeButton } from './StripeButton';
import { PortalButton } from './PortalButton';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single();

  const status = restaurant?.subscription_status || 'none';
  
  const PRICE_ID = 'price_1TU65iRifscVHy5BMVW3nh8V';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Billing</h1>
        <p className="text-slate-400 mt-1">Manage your subscription and billing details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-600/20 rounded-xl">
              <CreditCard className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Unlimited Plan</h2>
              <p className="text-sm text-slate-400">$19 / month</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <Feature item="Unlimited QR Scans" />
            <Feature item="AI Review Generation" />
            <Feature item="Vision Menu Analysis" />
            <Feature item="Analytics Dashboard" />
          </div>

          { (status === 'active' || status === 'trialing') && restaurant?.stripe_customer_id ? (
            <div className="mt-auto">
              <div className="flex items-center gap-2 text-emerald-400 mb-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                {status === 'trialing' ? <Clock size={18} /> : <CheckCircle2 size={18} />}
                <span className="text-sm font-medium capitalize">{status} Status</span>
              </div>
              <PortalButton className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl transition-colors">
                Manage Subscription
              </PortalButton>
            </div>
          ) : (
            <StripeButton 
              priceId={PRICE_ID}
              className="mt-auto w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Start 30-Day Free Trial
            </StripeButton>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Trial Information</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your 30-day free trial gives you full access to all features. You won't be charged until the trial ends. You can cancel anytime before then.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle size={18} />
              <h2 className="text-sm font-semibold">Payment Secure</h2>
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Payments are processed securely by Stripe. We never store your credit card details on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ item }: { item: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <CheckCircle2 size={16} className="text-indigo-400" />
      {item}
    </div>
  );
}
