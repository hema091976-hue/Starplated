'use client';

import { useState, useEffect } from 'react';
import { Star, Copy, CheckCircle2, Loader2, MessageSquareQuote, Utensils, Zap, Sparkles, MousePointer2, Tag, ArrowRight, X } from 'lucide-react';

interface ReviewOption {
  type: string;
  text: string;
  icon: any;
}

const TAG_CATEGORIES = [
  { id: 'food', label: 'Food', tags: ['Delicious', 'Fresh', 'Portions', 'Authentic'] },
  { id: 'service', label: 'Service', tags: ['Friendly', 'Fast', 'Professional', 'Attentive'] },
  { id: 'vibe', label: 'Vibe', tags: ['Cozy', 'Clean', 'Modern', 'Great Music'] },
];

export function ReviewUI({ restaurant, sessionId }: { restaurant: any, sessionId: string }) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [options, setOptions] = useState<ReviewOption[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Tutorial State
  const isDemo = restaurant.id === 'demo-restaurant';
  const [tutorialStep, setTutorialStep] = useState<number>(isDemo ? 1 : 0);

  // Sync tutorial with results
  useEffect(() => {
    if (isDemo && options.length > 0 && tutorialStep > 0 && tutorialStep < 4) {
      setTutorialStep(4);
    }
  }, [options, isDemo, tutorialStep]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      // Only advance to Step 3 if we don't have reviews yet
      if (isDemo && tutorialStep === 2 && options.length === 0) {
        setTutorialStep(3);
      }
      return newTags;
    });
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    if (isDemo && tutorialStep === 1) setTutorialStep(2);
    generateReviews(selectedRating);
  };

  const generateReviews = async (selectedRating: number = rating) => {
    if (selectedRating === 0) return;
    
    setIsGenerating(true);
    setOptions([]);
    setCopiedIndex(null);
    setError(null);

    try {
      const response = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating: selectedRating, 
          restaurantId: restaurant.id,
          selectedTags: selectedTags,
          sessionId: sessionId
        }),
      });
      
      const data = await response.json();
      if (response.ok && data.options && data.options.length > 0) {
        setOptions(data.options);
        // Step 4 will be set by the useEffect
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Review generation failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAndRedirect = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setShowGuide(true);
    if (isDemo) setTutorialStep(0); // End tutorial
    
    const googleUrl = `https://search.google.com/local/writereview?placeid=${restaurant.google_place_id || 'ChIJN1t_tDeuEmsRUsoyG83frY4'}`;
    
    setTimeout(() => {
      window.open(googleUrl, '_blank');
      setTimeout(() => setShowGuide(false), 500);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#3c4043] font-sans selection:bg-[#1a73e8]/20 relative overflow-x-hidden">
      
      {/* Tutorial Overlay */}
      {tutorialStep > 0 && isDemo && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <div className="absolute inset-0 bg-[#202124]/30" />
          
          {tutorialStep === 1 && (
            <div className="absolute top-[320px] left-1/2 -translate-x-1/2 w-full max-w-xs animate-bounce pointer-events-auto">
               <div className="bg-[#1a73e8] text-white p-4 rounded-2xl shadow-2xl relative">
                  <p className="font-bold text-center">Step 1: Tap the Stars</p>
                  <p className="text-xs text-white/80 text-center mt-1">Choose your rating to see the AI magic.</p>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a73e8] rotate-45" />
               </div>
            </div>
          )}

          {tutorialStep === 2 && (
            <div className="absolute top-[480px] left-1/2 -translate-x-1/2 w-full max-w-xs animate-in slide-in-from-bottom-4 pointer-events-auto">
               <div className="bg-[#1a73e8] text-white p-4 rounded-2xl shadow-2xl relative">
                  <p className="font-bold text-center">Step 2: Add Details</p>
                  <p className="text-xs text-white/80 text-center mt-1">Tap tags like "Delicious" or "Friendly" for more accurate reviews.</p>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a73e8] rotate-45" />
                  <button onClick={() => setTutorialStep(3)} className="mt-3 w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">
                    I'm done adding tags
                  </button>
               </div>
            </div>
          )}

          {tutorialStep === 3 && (
            <div className="absolute top-[580px] left-1/2 -translate-x-1/2 w-full max-w-xs animate-in slide-in-from-bottom-4 pointer-events-auto">
               <div className="bg-[#1a73e8] text-white p-4 rounded-2xl shadow-2xl relative">
                  <p className="font-bold text-center">Step 3: Generate</p>
                  <p className="text-xs text-white/80 text-center mt-1">Click the button below to craft your custom reviews.</p>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a73e8] rotate-45" />
               </div>
            </div>
          )}

          {tutorialStep === 4 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs animate-in slide-in-from-bottom-4 pointer-events-auto z-[62]">
               <div className="bg-[#1a73e8] text-white p-4 rounded-2xl shadow-2xl relative">
                  <p className="font-bold text-center">Step 4: Copy & Post</p>
                  <p className="text-xs text-white/80 text-center mt-1">Choose your favorite review! We'll copy it and open Google for you.</p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a73e8] rotate-45" />
               </div>
            </div>
          )}

          <button 
            onClick={() => setTutorialStep(0)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white pointer-events-auto transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Paste Guide Overlay */}
      {showGuide && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-[#202124]/80 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-[#e8f0fe] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-[#1a73e8]" />
            </div>
            <h3 className="text-xl font-bold text-[#202124] mb-2">Review Copied!</h3>
            <p className="text-[#70757a] text-sm mb-8">
              We're opening Google now. Just <span className="font-bold text-[#202124]">Paste</span> your review and select <span className="font-bold text-[#202124]">{rating} stars</span>.
            </p>
            
            <div className="space-y-4 mb-2">
              <div className="flex items-center gap-4 bg-[#f8f9fa] p-4 rounded-2xl border border-[#dadce0]">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#1a73e8] font-bold">1</div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#202124]">Tap & Paste</p>
                  <p className="text-[10px] text-[#70757a]">In the Google review box</p>
                </div>
                <MousePointer2 size={16} className="ml-auto text-[#1a73e8] animate-bounce" />
              </div>
              <div className="flex items-center gap-4 bg-[#f8f9fa] p-4 rounded-2xl border border-[#dadce0]">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#fbbc04] font-bold">2</div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#202124]">Select Stars</p>
                  <p className="text-[10px] text-[#70757a]">Tap the {rating}th star</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={10} className={i <= rating ? "fill-[#fbbc04] text-[#fbbc04]" : "text-[#dadce0]"} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="w-full h-1 bg-[#e8f0fe] rounded-full overflow-hidden">
                <div className="h-full bg-[#1a73e8] animate-[progress_2.5s_linear_forwards]" />
              </div>
              <p className="text-[10px] text-[#70757a] mt-2 font-medium tracking-wider">REDIRECTING TO GOOGLE...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 pt-16 pb-24">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <img src="/logo.png" alt="StarPlated Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-[26px] font-bold text-[#202124] mb-1 tracking-tight">
            {restaurant.business_name}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[#70757a] text-sm">
            <span className="font-medium">Powered by StarPlated</span>
            <div className="w-1 h-1 bg-[#bdc1c6] rounded-full"></div>
            <span className="flex items-center gap-1 font-medium">
              <Sparkles size={12} className="text-[#1a73e8]" />
              AI Reviews
            </span>
          </div>
        </div>

        {/* Rating & Tags Section */}
        <div className={`border rounded-2xl p-6 sm:p-8 mb-8 transition-all duration-300 ${tutorialStep === 1 ? 'relative z-[61] bg-white ring-4 ring-[#1a73e8] shadow-2xl scale-[1.02]' : 'border-[#dadce0] bg-[#f8f9fa]'}`}>
          <h2 className="text-[18px] font-medium text-[#202124] mb-6 text-center">
            Rate your experience
          </h2>
          
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRatingClick(star)}
                disabled={isGenerating}
                className="transition-transform active:scale-90"
              >
                <Star
                  size={46}
                  className={`transition-all duration-150 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-[#fbbc04] text-[#fbbc04]'
                      : 'fill-transparent text-[#dadce0]'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Tags Section */}
          <div className={`space-y-6 transition-all duration-500 overflow-hidden ${rating > 0 ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="h-px bg-[#dadce0] w-full mb-6" />
            
            <div className={tutorialStep === 2 ? 'relative z-[61] bg-white p-4 rounded-xl ring-2 ring-[#1a73e8]' : ''}>
              <p className="text-[14px] font-bold text-[#202124] mb-4 uppercase tracking-wider text-center">
                What stood out? (Optional)
              </p>
              
              <div className="space-y-4">
                {TAG_CATEGORIES.map(category => (
                  <div key={category.id} className="flex flex-wrap justify-center gap-2">
                    {category.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                          selectedTags.includes(tag)
                            ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-md'
                            : 'bg-white border-[#dadce0] text-[#70757a] hover:border-[#bdc1c6]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex justify-center pt-4 ${tutorialStep === 3 ? 'relative z-[61] scale-110' : ''}`}>
              <button
                onClick={() => generateReviews(rating)}
                disabled={isGenerating}
                className="bg-[#1a73e8] hover:bg-[#1765cc] text-white px-8 py-3 rounded-2xl font-bold text-[15px] shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {options.length > 0 ? 'Regenerate Reviews' : 'Generate Reviews'}
              </button>
            </div>
          </div>

          {!rating && <p className="text-[14px] text-[#70757a] text-center">Tap a star to begin</p>}
        </div>

        {/* AI Loading */}
        {isGenerating && !options.length && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-[#1a73e8] animate-spin mb-4" />
            <p className="text-[15px] text-[#70757a] font-medium animate-pulse">AI is crafting your reviews...</p>
          </div>
        )}

        {/* Review Options */}
        {options.length > 0 && !isGenerating && (
          <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 mt-12 ${tutorialStep === 4 ? 'relative z-[61] ring-4 ring-[#1a73e8] ring-offset-4 rounded-3xl shadow-2xl bg-white p-4' : ''}`}>
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-[14px] font-bold text-[#202124] uppercase tracking-wider">
                Select a review to post
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {options.map((option, index) => (
                <div 
                  key={index}
                  className="bg-white border border-[#dadce0] rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col active:scale-[0.97]"
                  onClick={() => copyAndRedirect(option.text, index)}
                >
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                      index === 0 ? 'bg-[#e8f0fe] text-[#1a73e8]' : index === 1 ? 'bg-[#fef7e0] text-[#f9ab00]' : 'bg-[#e6f4ea] text-[#1e8e3e]'
                    }`}>
                      {index === 0 ? <Utensils size={22} /> : index === 1 ? <Zap size={22} /> : <MessageSquareQuote size={22} />}
                    </div>
                    <span className="text-[11px] font-bold text-[#70757a] uppercase tracking-widest">{option.type}</span>
                  </div>

                  <div className="flex-1 mb-5">
                    <p className="text-[14px] text-[#3c4043] leading-relaxed font-normal italic">
                      {option.text}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="bg-[#1a73e8] group-hover:bg-[#1765cc] text-white w-full py-2 rounded-xl text-[12px] font-bold shadow-sm transition-colors text-center">
                      {copiedIndex === index ? 'Copied!' : 'Post Review'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
