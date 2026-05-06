import Link from 'next/link';
import { ArrowRight, Star, BarChart3, Menu, Search, MapPin, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
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
      <nav className="border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Star size={18} className="text-white fill-white" />
            </div>
            StarPlated
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
            <Link href="/auth" className="text-sm font-medium bg-white text-slate-950 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Context-Aware AI is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Turn Happy Diners Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
              5-Star Google Reviews
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your menu. Generate a custom QR code. When customers scan it, our context-aware AI crafts personalized, hyper-specific Google Reviews in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)] w-full sm:w-auto">
              Start Your Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/demo-restaurant/review" className="h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold flex items-center justify-center transition-all w-full sm:w-auto">
              View Customer Demo
            </Link>
          </div>
        </div>

        {/* Trusted By Marquee */}
        <div className="mt-24 border-y border-white/5 bg-white/[0.01] overflow-hidden py-10 relative flex w-full">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex whitespace-nowrap animate-marquee items-center opacity-40 hover:opacity-70 transition-opacity">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-20 px-10 items-center min-w-full justify-around shrink-0">
                <span className="text-2xl font-bold tracking-widest uppercase">The Rusty Spoon</span>
                <span className="text-3xl font-serif italic text-indigo-200">Bistro 74</span>
                <span className="text-2xl font-bold font-mono">GRILL & CO.</span>
                <span className="text-xl font-light tracking-[0.3em]">L U M I N A</span>
                <span className="text-3xl font-bold uppercase text-purple-200">Luigi's</span>
                <span className="text-2xl font-black italic">TAQUERIA EL REY</span>
                <span className="text-2xl font-medium tracking-wide">Silver Diner</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          <FeatureCard 
            icon={<Menu size={24} className="text-indigo-400" />}
            title="Menu-Aware AI"
            description="Our AI reads your menu and suggests reviews mentioning your specific signature dishes."
          />
          <FeatureCard 
            icon={<Star size={24} className="text-purple-400" />}
            title="Frictionless Flow"
            description="Customers just tap 5 stars. We generate the text, copy it, and send them straight to your Google page."
          />
          <FeatureCard 
            icon={<BarChart3 size={24} className="text-blue-400" />}
            title="Actionable Analytics"
            description="Track scans, review conversion rates, and see what dishes customers love the most."
          />
        </div>
        {/* How It Helps Section */}
        <div className="mt-32 border-t border-white/5 pt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">How StarPlated Grows Your Business</h2>
            <p className="text-lg text-slate-400">Stop hoping for reviews. Build a reliable engine that automatically drives more customers to your door.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <BenefitItem 
              icon={<MapPin size={24} className="text-rose-400" />}
              title="Dominate Google Maps SEO"
              description="Google's algorithm heavily favors restaurants with high volumes of recent, detailed reviews. We help you climb to the #1 spot for 'restaurants near me'."
            />
            <BenefitItem 
              icon={<TrendingUp size={24} className="text-emerald-400" />}
              title="Increase Foot Traffic & Revenue"
              description="A half-star increase in your Google rating can increase revenue by 5-9%. More positive reviews directly translate to more tables filled every night."
            />
            <BenefitItem 
              icon={<ShieldCheck size={24} className="text-blue-400" />}
              title="Intercept Negative Feedback"
              description="If a customer selects 1-3 stars, we can optionally route them to a private feedback form instead of Google, letting you make it right before it goes public."
            />
            <BenefitItem 
              icon={<Search size={24} className="text-amber-400" />}
              title="Build Authentic Social Proof"
              description="Because our AI generates reviews based on your actual menu, the reviews are authentic and highlight your most profitable signature dishes."
            />
          </div>
        </div>
        {/* Testimonials */}
        <div className="mt-32 pt-24 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Trusted by Top Restaurateurs</h2>
            <p className="text-lg text-slate-400">See how StarPlated is transforming the dining experience and boosting local SEO.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="We saw a 40% increase in 5-star reviews within the first month. The context-aware AI mentions our special dishes, which drives even more people to order them."
              author="Chef Maria V."
              role="Owner, Bistro 74"
            />
            <TestimonialCard 
              quote="The best part is intercepting 3-star reviews. We had a night where the kitchen was slow, and instead of taking a hit on Google, we were able to comp their next meal privately."
              author="James R."
              role="GM, The Rusty Spoon"
            />
            <TestimonialCard 
              quote="Customers love the frictionless experience. They just scan, tap 5 stars, and the review is written for them. It removes all the work from leaving a review."
              author="Sarah T."
              role="Marketing Director, Lumina"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-32 pt-24 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Simple, No-Brainer Pricing</h2>
            <p className="text-lg text-slate-400">One flat rate. Unlimited value.</p>
          </div>
          <div className="max-w-md mx-auto">
            <PricingCard 
              title="Unlimited Plan"
              price="$19"
              description="Everything you need to grow your restaurant's reviews, for less than the cost of a single appetizer."
              features={['Unlimited scans & reviews', 'Context-Aware AI generation', 'Negative Review Intercept', 'Analytics Dashboard']}
              isPopular={true}
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-32 pt-24 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem 
              question="Does this violate Google's Terms of Service?"
              answer="No. We do not gate reviews. We simply provide a frictionless tool for customers to generate a draft review based on their experience, which they can then choose to post to Google."
            />
            <FaqItem 
              question="Do customers need to download an app?"
              answer="Not at all! They simply scan the QR code with their native phone camera and it opens instantly in their browser."
            />
            <FaqItem 
              question="How does the AI know what dishes to mention?"
              answer="In your dashboard, you can upload multiple photos of your menu or a PDF. Our AI vision system reads the dishes automatically to ensure every generated review is highly specific and authentic."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/50 mt-32 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <Star size={12} className="text-white fill-white" />
            </div>
            StarPlated
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Contact Sales</Link>
          </div>
          <p className="text-sm text-slate-500">© 2026 StarPlated. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col h-full">
      <div className="flex text-yellow-400 mb-6">
        {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className="fill-yellow-400" />)}
      </div>
      <p className="text-slate-300 leading-relaxed italic flex-1 mb-8">"{quote}"</p>
      <div>
        <p className="text-white font-bold">{author}</p>
        <p className="text-slate-500 text-sm">{role}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, description, features, isPopular = false }: { title: string, price: string, description: string, features: string[], isPopular?: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border flex flex-col ${isPopular ? 'bg-indigo-600/10 border-indigo-500/30 relative' : 'bg-white/[0.02] border-white/5'}`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
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
          <CheckCircle2 size={16} /> First month completely free
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-300">
            <CheckCircle2 size={20} className="text-indigo-400 shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/auth" className={`w-full py-4 rounded-xl font-bold text-center transition-all ${isPopular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
        Start 1-Month Free Trial
      </Link>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
      <h3 className="text-lg font-bold text-white mb-2">{question}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{answer}</p>
    </div>
  );
}
