'use client';

import { useState } from 'react';

export function PortalButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePortal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePortal}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
