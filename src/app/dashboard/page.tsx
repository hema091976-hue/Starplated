import { Star, TrendingUp, Users, QrCode, ArrowUpRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AnalyticsChart } from './AnalyticsChart';

export default async function DashboardAnalytics() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('business_name, subscription_status')
    .eq('id', user.id)
    .single();

  const businessName = restaurant?.business_name || 'your restaurant';
  const isTrial = restaurant?.subscription_status === 'trialing';

  // Fetch real analytics events
  const { data: events } = await supabase
    .from('analytics_events')
    .select('event_type, created_at, session_id')
    .eq('restaurant_id', user.id);

  const safeEvents = events || [];

  // Accurate tracking: Count UNIQUE sessions for scans and review generations
  const uniqueScans = new Set(safeEvents.filter(e => e.event_type === 'scan').map(e => e.session_id || Math.random())).size;
  const uniqueReviews = new Set(safeEvents.filter(e => e.event_type === 'review_generated').map(e => e.session_id || Math.random())).size;
  
  const conversionRate = uniqueScans > 0 ? ((uniqueReviews / uniqueScans) * 100).toFixed(1) + '%' : '0%';

  // Generate last 7 days chart data (using unique generations)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayReviews = new Set(safeEvents.filter(e => {
      return e.event_type === 'review_generated' && e.created_at.startsWith(dateStr);
    }).map(e => e.session_id || Math.random())).size;

    chartData.push({ name: dayName, reviews: dayReviews });
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-slate-400 mt-1">Tracking growth for {businessName}.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Tracking</span>
          </div>
        </div>
      </div>

      {isTrial && (
        <div className="mb-8 p-6 bg-[#fbbc04]/10 border border-[#fbbc04]/20 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#fbbc04]/20 flex items-center justify-center shrink-0">
             <TrendingUp size={20} className="text-[#fbbc04]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Your Review Engine is in Trial Mode</h3>
            <p className="text-sm text-slate-400 mt-1">
              Data will update automatically as customers scan your QR codes. Your goal is to turn every scan into a 5-star Google review.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Visitors" value={uniqueScans.toString()} trend="Unique" icon={<Users size={20} className="text-[#fbbc04]" />} />
        <StatCard title="Review Engagement" value={uniqueReviews.toString()} trend="Unique" icon={<Star size={20} className="text-[#fbbc04]" />} />
        <StatCard title="Scan-to-Review" value={conversionRate} trend="Avg" icon={<ArrowUpRight size={20} className="text-emerald-400" />} />
        <StatCard title="Estimated Reach" value={(uniqueReviews * 150).toString()} trend="Est. Views" icon={<TrendingUp size={20} className="text-blue-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Unique Reviews Started (Last 7 Days)</h2>
          <div className="h-[300px] w-full">
            <AnalyticsChart data={chartData} />
          </div>
        </div>

        {/* Growth Insights */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] p-6 flex flex-col">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md">
            <div className="bg-[#fbbc04]/20 p-3 rounded-full mb-3 border border-[#fbbc04]/30">
              <TrendingUp size={24} className="text-[#fbbc04]" />
            </div>
            <h3 className="text-white font-bold text-lg tracking-tight">Growth Insights Locked</h3>
            <p className="text-slate-300 text-sm mt-2 mb-5 text-center px-6 max-w-[250px]">
              Requires the full subscription to analyze trends and keyword performance.
            </p>
            <button className="bg-white text-slate-950 font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-slate-200 transition-colors shadow-lg">
              Upgrade to Unlock
            </button>
          </div>

          <div className="opacity-30 blur-[4px] pointer-events-none select-none flex-1">
            <h2 className="text-lg font-semibold text-white mb-6">Ranking Insights</h2>
            <div className="space-y-4">
              <InsightItem title="Top Keyword" value="Excellent Service" detail="Appeared in 65% of 5-star reviews" />
              <InsightItem title="SEO Impact" value="+12 Spots" detail="Estimated ranking increase this month" />
              <InsightItem title="Customer Sentiment" value="98% Positive" detail="Across all generated drafts" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">{icon}</div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 text-slate-400 uppercase tracking-widest">
          {trend}
        </span>
      </div>
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function InsightItem({ title, value, detail }: { title: string, value: string, detail: string }) {
  return (
    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{title}</p>
      <p className="text-lg font-medium text-white mb-1">{value}</p>
      <p className="text-xs text-slate-600">{detail}</p>
    </div>
  );
}
