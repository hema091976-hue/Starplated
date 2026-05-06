import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!restaurant?.stripe_customer_id) {
      return NextResponse.json({ error: 'No stripe customer found. Please subscribe first.' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: restaurant.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Portal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
