import Link from 'next/link';
import { ArrowRight, BarChart3, Menu, Search, MapPin, ShieldCheck, TrendingUp, CheckCircle2, Zap, Clock, MousePointer2, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#001d3d] text-slate-50 font-sans selection:bg-[#fbbc04]/30">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#001d3d]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="relative w-10 h-10 overflow-hidden">
               <Image src="/logo.png" alt="StarPlated Logo" fill className="object-contain" />
            </div>
            StarPlated
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
            <Link href="/auth" className="text-sm font-medium bg-[#fbbc04] text-[#001d3d] px-5 py-2 rounded-full hover:bg-white transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbbc04]/10 border border-[#fbbc04]/20 text-[#fbbc04] text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#fbbc04] animate-pulse"></span>
            Helping restaurants rank higher on Google Maps
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Get More Google Reviews <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbc04] via-white to-[#fbbc04]">
              With Zero Effort.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Most customers want to help, but they don't want the friction. We remove the searching, typing, and thinking—so they actually leave the review.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="h-14 px-8 bg-[#fbbc04] hover:bg-white text-[#001d3d] rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(251,188,4,0.3)] w-full sm:w-auto">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/demo-restaurant/review" className="h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold flex items-center justify-center transition-all w-full sm:w-auto">
              Try the Customer Demo
            </Link>
          </div>
        </div>

        {/* The Friction Gap Section */}
        <div className="mt-32 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">The real reason you aren't getting reviews: <span className="text-[#fbbc04]">Friction.</span></h2>
            <div className="space-y-4">
              <FrictionItem title="No more searching Google Maps" />
              <FrictionItem title="No more finding the review page" />
              <FrictionItem title="No more thinking what to write" />
              <FrictionItem title="No more typing long reviews" />
            </div>
            <p className="mt-8 text-slate-400 italic">
              "We remove the work. They provide the 5 stars."
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <MousePointer2 size={120} className="text-[#fbbc04]" />
             </div>
             <h3 className="text-xl font-bold text-white mb-4">The Result?</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                   <span className="text-slate-400">Google Maps Ranking</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14}/> Higher</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                   <span className="text-slate-400">Local SEO & Traffic</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14}/> Boosted</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                   <span className="text-slate-400">Monthly Revenue</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14}/> Increased</span>
                </div>
             </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          <FeatureCard 
            icon={<Zap size={24} className="text-[#fbbc04]" />}
            title="Fast QR Checkout"
            description="Customers scan a custom QR code at their table and are instantly ready to review."
          />
          <FeatureCard 
            icon={<Sparkles size={24} className="text-indigo-400" />}
            title="AI Review Assistant"
            description="Our simple AI helps customers craft authentic, menu-specific reviews in seconds."
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} className="text-blue-400" />}
            title="Private Feedback Loop"
            description="Optionally catch negative experiences privately before they ever hit Google."
          />
        </div>

        {/* Benefits Section */}
        <div className="mt-32 border-t border-white/5 pt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Why Star Rating Matters</h2>
            <p className="text-lg text-slate-400">A restaurant with 4.8 stars and 600 reviews will always outperform 4.4 stars and 90 reviews—even if the food is the same.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <BenefitItem 
              icon={<MapPin size={24} className="text-rose-400" />}
              title="Dominate Your Local Area"
              description="Google's algorithm prioritizes volume and recency. More reviews mean you show up first when people search 'best restaurant near me'."
            />
            <BenefitItem 
              icon={<TrendingUp size={24} className="text-emerald-400" />}
              title="Measurable Revenue Growth"
              description="One extra table reservation per month covers your entire fee. Most our users see dozens of extra reviews in their first week."
            />
            <BenefitItem 
              icon={<Clock size={24} className="text-blue-400" />}
              title="Simple. Fast. Modern."
              description="No bloated enterprise dashboards. We focus on one thing: getting you more reviews as fast as humanly possible."
            />
            <BenefitItem 
              icon={<Search size={24} className="text-amber-400" />}
              title="Built for Local Business"
              description="You don't need complex marketing tools. You need a QR code that works and reviews that look real. We handle the rest."
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-32 pt-24 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 tracking-tight text-white">Simple, No-Brainer Pricing</h2>
            <p className="text-lg text-slate-400">Pay for results, not for bloat.</p>
          </div>
          <div className="max-w-md mx-auto">
            <PricingCard 
              title="Unlimited Growth"
              price="$19"
              description="Everything you need to boost your Google ranking, for less than the cost of a single appetizer."
              features={['Unlimited Scans & Reviews', 'AI-Assisted Review Drafting', 'Custom Branded QR Codes', 'Negative Review Intercept', 'Simple Dashboard']}
              isPopular={true}
            />
          </div>
        </div>

        {/* Closing CTA */}
        <div className="mt-32 bg-[#fbbc04] rounded-3xl p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
           <h2 className="text-3xl md:text-5xl font-bold text-[#001d3d] mb-6 relative z-10">Ready to outrank your competitors?</h2>
           <p className="text-[#001d3d]/80 text-lg mb-10 max-w-2xl mx-auto relative z-10 font-medium">Join the restaurants using StarPlated to turn dine-in traffic into a reliable SEO engine.</p>
           <Link href="/auth" className="h-16 px-10 bg-[#001d3d] text-white rounded-full font-bold inline-flex items-center justify-center gap-2 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 relative z-10">
              Start Your Free Trial Now <ArrowRight size={20} />
           </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#001d3d] mt-32 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="StarPlated Logo" fill className="object-contain" />
            </div>
            StarPlated
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Contact Support</Link>
          </div>
          <p className="text-sm text-slate-500">© 2026 StarPlated. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FrictionItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-200">
      <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
      </div>
      <span className="font-medium">{title}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbbc04]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 relative z-10 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 relative z-10">{title}</h3>
      <p className="text-slate-400 leading-relaxed relative z-10">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-6">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, description, features, isPopular = false }: { title: string, price: string, description: string, features: string[], isPopular?: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border flex flex-col ${isPopular ? 'bg-white/[0.05] border-[#fbbc04]/30 relative shadow-[0_0_40px_rgba(251,188,4,0.1)]' : 'bg-white/[0.02] border-white/5'}`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fbbc04] text-[#001d3d] text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 h-10">{description}</p>
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-extrabold text-white">{price}</span>
          <span className="text-slate-500 font-medium">/mo</span>
        </div>
        <div className="text-emerald-400 font-bold text-sm mt-3 flex items-center gap-1.5">
          <CheckCircle2 size={16} /> First month free
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-300">
            <CheckCircle2 size={20} className="text-[#fbbc04] shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/auth" className={`w-full py-4 rounded-xl font-bold text-center transition-all ${isPopular ? 'bg-[#fbbc04] hover:bg-white text-[#001d3d] shadow-[0_0_20px_rgba(251,188,4,0.2)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
        Get Started For Free
      </Link>
    </div>
  );
}
