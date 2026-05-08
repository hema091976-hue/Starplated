import Link from 'next/link';
import { ArrowRight, BarChart3, Menu, Search, MapPin, ShieldCheck, TrendingUp, CheckCircle2, Zap, Clock, MousePointer2, Sparkles, QrCode, LayoutDashboard, MessageSquarePlus, Star } from 'lucide-react';
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
            Turn Happy Diners Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbc04] via-white to-[#fbbc04]">
              Google Reviews
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Most happy customers are willing to leave a review — but the process takes too many steps. StarPlated removes the friction so more guests actually follow through.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="h-14 px-8 bg-[#fbbc04] hover:bg-white text-[#001d3d] rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(251,188,4,0.3)] w-full sm:w-auto">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/demo-restaurant/review" className="h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold flex items-center justify-center transition-all w-full sm:w-auto">
              Try Customer Demo
            </Link>
          </div>
        </div>

        {/* Why Most Customers Never Leave Reviews Section */}
        <div className="mt-32 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Why Most Customers <br/><span className="text-[#fbbc04]">Never Leave Reviews</span></h2>
            <div className="space-y-4">
              <FrictionItem title="No searching Google Maps" />
              <FrictionItem title="No finding the review button" />
              <FrictionItem title="No thinking about what to write" />
              <FrictionItem title="No long review forms" />
            </div>
            <p className="mt-8 text-slate-300 text-lg font-medium">
              We remove the friction so customers can share their real experience instantly.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <MousePointer2 size={120} className="text-[#fbbc04]" />
             </div>
             <h3 className="text-xl font-bold text-white mb-4">The Result?</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                   <span className="text-slate-400">Google Maps Visibility</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14}/> Increased</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                   <span className="text-slate-400">Local SEO Traffic</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14}/> Boosted</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                   <span className="text-slate-400">Customer Trust</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14}/> Stronger</span>
                </div>
             </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          <FeatureCard 
            icon={<Zap size={24} className="text-[#fbbc04]" />}
            title="Instant QR Review Flow"
            description="Guests scan your custom QR code and are guided directly to your review experience in seconds."
          />
          <FeatureCard 
            icon={<Sparkles size={24} className="text-indigo-400" />}
            title="AI Review Assistant"
            description="Help customers quickly draft personalized reviews based on their dining experience."
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} className="text-blue-400" />}
            title="Private Feedback Capture"
            description="Collect private feedback from unhappy guests before issues become public reviews."
          />
        </div>

        {/* How It Works Section */}
        <div className="mt-32 border-t border-white/5 pt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">How StarPlated Works</h2>
            <p className="text-lg text-slate-400 font-medium">A simple, 4-step process to grow your reputation.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepItem 
              step="1"
              icon={<QrCode size={24} className="text-[#fbbc04]" />}
              description="Place your custom QR codes on tables, menus, or receipts."
            />
            <StepItem 
              step="2"
              icon={<Star className="text-[#fbbc04] fill-[#fbbc04]" size={24} />}
              description="Customers scan and rate their dining experience."
            />
            <StepItem 
              step="3"
              icon={<MessageSquarePlus size={24} className="text-emerald-400" />}
              description="Guests are guided directly to your Google review page with optional AI-assisted drafting."
            />
            <StepItem 
              step="4"
              icon={<LayoutDashboard size={24} className="text-indigo-400" />}
              description="Track customer feedback and review performance inside your dashboard."
            />
          </div>
        </div>

        {/* Why Star Ratings Matter Section */}
        <div className="mt-32 border-t border-white/5 pt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Why Star Ratings Matter</h2>
            <p className="text-lg text-slate-400">A restaurant with 4.8 stars and 600 reviews will outperform 4.4 stars and 90 reviews—even if the food is the same.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <BenefitItem 
              icon={<MapPin size={24} className="text-rose-400" />}
              title="Dominate Local Search"
              description="Google prioritizes businesses with strong review volume and recency. More quality reviews help restaurants appear higher in local search results."
            />
            <BenefitItem 
              icon={<TrendingUp size={24} className="text-emerald-400" />}
              title="Measurable Revenue Growth"
              description="Even a small increase in positive reviews can lead to more reservations, higher trust, and increased repeat business."
            />
            <BenefitItem 
              icon={<Clock size={24} className="text-blue-400" />}
              title="Simple. Fast. Modern."
              description="No bloated enterprise software. StarPlated focuses on one thing: helping restaurants generate more authentic customer reviews."
            />
            <BenefitItem 
              icon={<Search size={24} className="text-amber-400" />}
              title="Built For Local Restaurants"
              description="Everything is designed for busy restaurant owners who want a simple system that works immediately."
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-32 pt-24 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 tracking-tight text-white">Simple, No-Brainer Pricing</h2>
            <p className="text-lg text-slate-400">Pay for results, not bloated software.</p>
          </div>
          <div className="max-w-md mx-auto">
            <PricingCard 
              title="Unlimited Growth"
              price="$19"
              description="Everything restaurants need to improve visibility and generate more customer reviews."
              features={['Unlimited Review Requests', 'AI-Assisted Review Drafting', 'Custom Branded QR Codes', 'Private Feedback Capture', 'Simple Dashboard']}
              isPopular={true}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32 pt-24 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-400">Everything you need to know about StarPlated.</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem 
              question="Is this compliant with Google's review policies?"
              answer="Absolutely. We do not offer incentives for reviews, nor do we guarantee 5-star ratings. StarPlated simply removes the technical friction that prevents happy customers from leaving authentic reviews they already wanted to write."
            />
            <FAQItem 
              question="How do I get my QR codes?"
              answer="Once you sign up, you can generate and download your custom, high-resolution QR codes instantly from your dashboard. You can print them on table tents, menus, or receipts."
            />
            <FAQItem 
              question="Does it work on all smartphones?"
              answer="Yes. The StarPlated experience is a web-based flow that works perfectly on any modern iPhone or Android device without requiring your customers to download an app."
            />
            <FAQItem 
              question="Can I cancel my subscription anytime?"
              answer="Yes. We believe in earning your business every month. There are no long-term contracts, and you can cancel your subscription with a single click from your settings."
            />
            <FAQItem 
              question="How does the AI Review Assistant work?"
              answer="Our AI helps customers who want to leave a review but aren't sure what to say. It provides a helpful starting point based on their rating and specific tags they select, which they can then edit before posting to Google."
            />
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-32 bg-[#fbbc04] rounded-3xl p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
           <h2 className="text-3xl md:text-5xl font-bold text-[#001d3d] mb-6 relative z-10">Ready To Grow Your Restaurant’s Reputation?</h2>
           <p className="text-[#001d3d]/80 text-lg mb-10 max-w-2xl mx-auto relative z-10 font-bold">Help more happy customers leave reviews and improve your visibility on Google.</p>
           <Link href="/auth" className="h-16 px-10 bg-[#001d3d] text-white rounded-full font-bold inline-flex items-center justify-center gap-2 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 relative z-10">
              Start Free Trial <ArrowRight size={20} />
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

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.04] transition-colors"
      >
        <span className="font-bold text-white">{question}</span>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ArrowRight className="rotate-90 text-[#fbbc04]" size={20} />
        </div>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5 bg-white/[0.01]">
          {answer}
        </div>
      </div>
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

function StepItem({ step, icon, description }: { step: string, icon: React.ReactNode, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 relative group">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#fbbc04] text-[#001d3d] rounded-full flex items-center justify-center font-black text-sm shadow-xl z-10">
        {step}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed font-medium">{description}</p>
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
          First month free
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 h-10 font-medium">{description}</p>
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-extrabold text-white">{price}</span>
          <span className="text-slate-500 font-medium">/mo</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-300">
            <CheckCircle2 size={20} className="text-[#fbbc04] shrink-0" />
            <span className="text-sm font-medium">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/auth" className={`w-full py-4 rounded-xl font-bold text-center transition-all ${isPopular ? 'bg-[#fbbc04] hover:bg-white text-[#001d3d] shadow-[0_0_20px_rgba(251,188,4,0.2)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
        Get Started Free
      </Link>
    </div>
  );
}
