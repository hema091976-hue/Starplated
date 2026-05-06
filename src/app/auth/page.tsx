import Link from 'next/link';
import { Store } from 'lucide-react';
import { login, signup } from './actions';

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 center w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Store size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to StarPlated</h1>
          <p className="text-slate-400 mt-2">Sign in or create an account</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
          <form className="space-y-5" action={login}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">Email</label>
              <input 
                id="email"
                name="email"
                type="email" 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                <Link href="#" className="text-sm text-indigo-400 hover:text-indigo-300">Forgot?</Link>
              </div>
              <input 
                id="password"
                name="password"
                type="password" 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>

            {params?.message && (
              <p className="mt-4 p-4 bg-red-500/10 text-red-400 text-center text-sm rounded-xl">
                {params.message}
              </p>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors flex justify-center items-center h-12"
              >
                Sign In
              </button>
              <button 
                type="submit"
                formAction={signup}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl transition-colors flex justify-center items-center h-12"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
