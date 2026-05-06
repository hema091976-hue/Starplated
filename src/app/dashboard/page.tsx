import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, Users, QrCode } from 'lucide-react';
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
    .select('event_type, created_at')
    .eq('restaurant_id', user.id);

  const safeEvents = events || [];

  const totalScans = safeEvents.filter(e => e.event_type === 'scan').length;
  const totalReviews = safeEvents.filter(e => e.event_type === 'review_generated').length;
  const conversionRate = totalScans > 0 ? ((totalReviews / totalScans) * 100).toFixed(1) + '%' : '0%';

  // Generate last 7 days chart data
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayReviews = safeEvents.filter(e => {
      return e.event_type === 'review_generated' && e.created_at.startsWith(dateStr);
    }).length;

    chartData.push({ name: dayName, reviews: dayReviews });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-slate-400 mt-1">Welcome back. Here's how {businessName} is performing.</p>
      </div>

      {isTrial && (
        <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
          <div className="text-indigo-400 mt-0.5">ℹ️</div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-300">You are on a Free Trial</h3>
            <p className="text-xs text-indigo-200/70 mt-1">
              Your dashboard is currently showing sample analytics. Once you deploy your QR codes to tables and customers start scanning, this data will update in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Scans" value={totalScans.toString()} trend="All time" icon={<QrCode size={20} className="text-indigo-400" />} />
        <StatCard title="Reviews Generated" value={totalReviews.toString()} trend="All time" icon={<Star size={20} className="text-yellow-400" />} />
        <StatCard title="Conversion Rate" value={conversionRate} trend="Avg" icon={<TrendingUp size={20} className="text-emerald-400" />} />
        <StatCard title="New Customers" value={(totalReviews * 2).toString()} trend="Est." icon={<Users size={20} className="text-blue-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Reviews Generated (Last 7 Days)</h2>
          <div className="h-[300px] w-full">
            <AnalyticsChart data={chartData} />
          </div>
        </div>

        {/* AI Insights (Premium Feature) */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] p-6">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md">
            <div className="bg-indigo-600/20 p-3 rounded-full mb-3 border border-indigo-500/30">
              <Star size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-white font-bold text-lg tracking-tight">AI Insights Locked</h3>
            <p className="text-slate-300 text-sm mt-2 mb-5 text-center px-6 max-w-[250px]">
              Requires the full subscription and at least 50 reviews to analyze trends.
            </p>
            <button className="bg-white text-slate-950 font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-slate-200 transition-colors shadow-lg">
              Upgrade to Unlock
            </button>
          </div>

          <div className="opacity-30 blur-[4px] pointer-events-none select-none">
            <h2 className="text-lg font-semibold text-white mb-6">AI Menu Insights</h2>
            <div className="space-y-4">
              <InsightItem 
                title="Top Mentioned Dish" 
                value="Truffle Pasta" 
                detail="Appeared in 42% of 5-star reviews"
              />
              <InsightItem 
                title="Ambiance Keyword" 
                value="Romantic" 
                detail="Customers love the dim lighting"
              />
              <InsightItem 
                title="Improvement Area" 
                value="Wait Time" 
                detail="Mentioned in 3-star reviews"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function InsightItem({ title, value, detail }: { title: string, value: string, detail: string }) {
  return (
    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{title}</p>
      <p className="text-lg font-medium text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500">{detail}</p>
    </div>
  );
}
