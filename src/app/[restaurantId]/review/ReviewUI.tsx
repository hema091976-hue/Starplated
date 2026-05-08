'use client';

import { useState, useEffect, useMemo } from 'react';
import { Star, Copy, CheckCircle2, Loader2, MessageSquareQuote, Utensils, Zap, Sparkles, MousePointer2, Tag, ArrowRight, X, ChevronRight, User, Heart, ThumbsUp, MessageSquare } from 'lucide-react';

interface ReviewOption {
  type: string;
  text: string;
  icon: any;
  title: string;
}

const RATING_TAGS: Record<number, string[]> = {
  5: ['Amazing food', 'Friendly staff', 'Great atmosphere', 'Fast service', 'Fresh ingredients', 'Cozy vibe'],
  4: ['Amazing food', 'Friendly staff', 'Great atmosphere', 'Fast service', 'Fresh ingredients', 'Cozy vibe'],
  3: ['Decent food', 'Long wait', 'Average service', 'Loud environment', 'Fair prices', 'Needs improvement'],
  2: ['Slow service', 'Wrong order', 'Cold food', 'Rude staff', 'Poor cleanliness', 'Disappointing'],
  1: ['Slow service', 'Wrong order', 'Cold food', 'Rude staff', 'Poor cleanliness', 'Terrible experience'],
};

export function ReviewUI({ restaurant, sessionId }: { restaurant: any, sessionId: string }) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [options, setOptions] = useState<ReviewOption[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Feedback state for low ratings
  const [feedbackText, setFeedbackText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Tutorial State
  const isDemo = restaurant.id === 'demo-restaurant';
  const [tutorialStep, setTutorialStep] = useState<number>(isDemo ? 1 : 0);

  const currentTags = useMemo(() => RATING_TAGS[rating as keyof typeof RATING_TAGS] || RATING_TAGS[5], [rating]);

  useEffect(() => {
    if (isDemo && options.length > 0 && tutorialStep > 0 && tutorialStep < 3) {
      setTutorialStep(3);
    }
  }, [options, isDemo, tutorialStep]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    setSelectedTags([]); // Reset tags when rating changes
    if (isDemo && tutorialStep === 1) setTutorialStep(2);
    
    // Auto-generate if rating is good
    if (selectedRating >= 3) {
      generateReviews(selectedRating);
    }
  };

  const generateReviews = async (selectedRating: number = rating) => {
    if (selectedRating < 3) return;
    
    setIsGenerating(true);
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
      if (response.ok && data.options) {
        // Map types to icons/titles
        const mappedOptions = data.options.map((opt: any, i: number) => ({
          ...opt,
          title: i === 0 ? 'Food Lover' : i === 1 ? 'The Vibe' : 'Local Favorite',
          icon: i === 0 ? <Utensils size={18} /> : i === 1 ? <Sparkles size={18} /> : <Heart size={18} />
        }));
        setOptions(mappedOptions);
      } else {
        setError(data.error || 'AI is currently busy. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitPrivateFeedback = async () => {
    setIsSubmittingFeedback(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setFeedbackSubmitted(true);
    setIsSubmittingFeedback(false);
  };

  const copyAndRedirect = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setShowGuide(true);
    if (isDemo) setTutorialStep(0);
    
    const googleUrl = `https://search.google.com/local/writereview?placeid=${restaurant.google_place_id || 'ChIJN1t_tDeuEmsRUsoyG83frY4'}`;
    
    setTimeout(() => {
      window.open(googleUrl, '_blank');
      setTimeout(() => setShowGuide(false), 500);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] font-sans selection:bg-[#1a73e8]/10 relative">
      
      {/* Step Indicator */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           {[
             { step: 1, label: 'Rate' },
             { step: 2, label: 'Choose' },
             { step: 3, label: 'Post' }
           ].map((s, i) => (
             <div key={s.step} className="flex items-center gap-2">
               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                 rating === 0 ? (s.step === 1 ? 'bg-[#1a73e8] text-white' : 'bg-gray-100 text-gray-400') :
                 (options.length > 0 || rating < 3) ? (s.step === 3 ? 'bg-[#1a73e8] text-white' : 'bg-green-500 text-white') :
                 (s.step === 2 ? 'bg-[#1a73e8] text-white' : s.step === 1 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')
               }`}>
                 {rating > 0 && s.step === 1 ? <CheckCircle2 size={12} /> : 
                  (options.length > 0 && s.step === 2) ? <CheckCircle2 size={12} /> : s.step}
               </div>
               <span className={`text-[11px] font-bold uppercase tracking-wider ${
                 (rating === 0 && s.step === 1) || (rating > 0 && options.length === 0 && s.step === 2) || (options.length > 0 && s.step === 3)
                 ? 'text-[#1a73e8]' : 'text-gray-400'
               }`}>{s.label}</span>
               {i < 2 && <ChevronRight size={12} className="text-gray-300 mx-1" />}
             </div>
           ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 pb-24">
        
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-center mb-4">
             <div className="relative w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-[#202124] mb-1">{restaurant.business_name}</h1>
          <p className="text-[#70757a] text-sm font-medium">Share your dining experience in seconds.</p>
        </div>

        {/* Rating Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 text-center animate-in fade-in zoom-in duration-500">
          <h2 className="text-lg font-bold text-[#202124] mb-1">How was your experience?</h2>
          <p className="text-sm text-[#70757a] mb-8 font-medium">Your feedback helps local restaurants grow.</p>
          
          <div className="flex justify-center gap-3 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRatingClick(star)}
                className="transition-all active:scale-75 duration-200"
              >
                <Star
                  size={44}
                  className={`transition-all duration-300 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-[#fbbc04] text-[#fbbc04] drop-shadow-sm scale-110'
                      : 'fill-transparent text-[#E8EAED]'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating === 0 && <p className="text-[11px] text-[#70757a] mt-4 font-bold uppercase tracking-widest opacity-50">Tap a star to start</p>}
        </div>

        {/* High Rating Flow (3-5 stars) */}
        {rating >= 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            
            {/* Tags Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-[#202124] mb-4 uppercase tracking-widest text-center">What stood out most?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {currentTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                      selectedTags.includes(tag)
                        ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-md scale-105'
                        : 'bg-gray-50 border-gray-100 text-[#70757a] hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => generateReviews(rating)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 text-xs font-bold text-[#1a73e8] hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {options.length > 0 ? 'Generate More Suggestions' : 'Generate Reviews'}
                </button>
              </div>
            </div>

            {/* Review Cards */}
            {isGenerating && !options.length && (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">AI is drafting reviews...</p>
              </div>
            )}

            {options.length > 0 && !isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Choose a review to post</h3>
                </div>
                
                {options.map((option, index) => (
                  <div 
                    key={index}
                    onClick={() => copyAndRedirect(option.text, index)}
                    className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-all cursor-pointer group active:scale-[0.98] border-b-4 border-b-transparent hover:border-b-[#1a73e8]"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1a73e8] border border-gray-100">
                        {option.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{option.title}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={10} className={s <= rating ? 'fill-[#fbbc04] text-[#fbbc04]' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[15px] text-[#3c4043] leading-relaxed italic mb-6">"{option.text}"</p>
                    
                    <button className="w-full py-3.5 bg-[#1a73e8] hover:bg-[#1765cc] text-white rounded-2xl text-[14px] font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                      {copiedIndex === index ? <CheckCircle2 size={18} /> : <ThumbsUp size={18} />}
                      {copiedIndex === index ? 'Copied & Redirecting...' : 'Share on Google'}
                    </button>
                  </div>
                ))}
                
                <p className="text-center text-[11px] text-[#70757a] font-medium pt-2">
                  You can edit your review before posting on Google.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Low Rating Flow (1-2 stars) */}
        {rating > 0 && rating < 3 && !feedbackSubmitted && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <h2 className="text-lg font-bold text-[#202124] mb-1">We're sorry your experience wasn't great.</h2>
            <p className="text-sm text-[#70757a] mb-6 font-medium">Would you like to send private feedback to the restaurant?</p>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what went wrong..."
              className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all mb-4"
            />
            
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Email or Phone (Optional)"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all mb-6"
            />
            
            <button
              onClick={submitPrivateFeedback}
              disabled={isSubmittingFeedback || !feedbackText}
              className="w-full py-4 bg-[#202124] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmittingFeedback ? <Loader2 size={20} className="animate-spin" /> : 'Submit Feedback'}
            </button>
          </div>
        )}

        {feedbackSubmitted && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#202124] mb-2">Thank You</h2>
            <p className="text-sm text-[#70757a] leading-relaxed">Your feedback has been sent directly to the owner. We appreciate you helping us improve.</p>
          </div>
        )}

        {/* Footer Brand */}
        <div className="mt-12 text-center opacity-30">
          <p className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            Powered by StarPlated <Sparkles size={10} />
          </p>
        </div>
      </div>

      {/* Tutorial Tooltip */}
      {tutorialStep > 0 && isDemo && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center px-6">
           <div className="absolute inset-0 bg-[#202124]/40" />
           <div className="relative bg-[#1a73e8] text-white p-6 rounded-3xl shadow-2xl max-w-xs w-full pointer-events-auto animate-in zoom-in-95 duration-300">
              <p className="font-bold text-lg mb-2">Step {tutorialStep}</p>
              <p className="text-sm text-white/90 leading-relaxed mb-6">
                {tutorialStep === 1 ? "Start by giving us a star rating!" :
                 tutorialStep === 2 ? "Now tap some tags that describe your experience." :
                 "Final Step: Choose your favorite AI-drafted review and post it!"}
              </p>
              <button 
                onClick={() => setTutorialStep(0)}
                className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Got it
              </button>
           </div>
        </div>
      )}

      {/* Redirect Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#202124]/90 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-blue-50 text-[#1a73e8] rounded-full flex items-center justify-center mx-auto mb-8">
               <Copy size={32} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-[#202124] mb-3">Copied!</h3>
            <p className="text-[#70757a] text-[15px] leading-relaxed mb-8">
              We're opening Google. Just <span className="font-bold text-[#202124]">Paste</span> your review and select <span className="font-bold text-[#202124]">{rating} stars</span>.
            </p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-[#1a73e8] animate-[progress_2.5s_linear_forwards]" />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
