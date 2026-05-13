'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, Sparkles } from 'lucide-react';

export function AdminSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Provisioning Restaurant...
        </>
      ) : (
        <>
          <Sparkles size={20} />
          Generate Invite & Magic Link
        </>
      )}
    </button>
  );
}
