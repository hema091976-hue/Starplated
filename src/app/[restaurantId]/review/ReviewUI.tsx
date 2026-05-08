'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Star, Copy, CheckCircle2, Loader2, Utensils, Zap, Sparkles, X, ChevronRight, Heart, ThumbsUp, Pencil, Smile, Home, Leaf, MapPin, ShieldCheck, Lock, ChevronLeft } from 'lucide-react';

interface ReviewOption {
  type: string;
  text: string;
  icon: any;
  title: string;
  color: string;
  bgColor: string;
}

const RATING_TAGS: Record<number, any[]> = {
  5: [
    { id: 'food', label: 'Delicious Food', icon: <Utensils size={16} /> },
    { id: 'staff', label: 'Friendly Staff', icon: <Smile size={16} /> },
    { id: 'atmosphere', label: 'Great Atmosphere', icon: <Home size={16} /> },
    { id: 'service', label: 'Fast Service', icon: <Zap size={16} /> },
    { id: 'ingredients', label: 'Fresh Ingredients', icon: <Leaf size={16} /> },
    { id: 'vibe', label: 'Cozy Vibe', icon: <Heart size={16} /> },
  ],
  4: [
    { id: 'food', label: 'Delicious Food', icon: <Utensils size={16} /> },
    { id: 'staff', label: 'Friendly Staff', icon: <Smile size={16} /> },
    { id: 'atmosphere', label: 'Great Atmosphere', icon: <Home size={16} /> },
    { id: 'service', label: 'Fast Service', icon: <Zap size={16} /> },
    { id: 'ingredients', label: 'Fresh Ingredients', icon: <Leaf size={16} /> },
    { id: 'vibe', label: 'Cozy Vibe', icon: <Heart size={16} /> },
  ],
  3: [
    { id: 'food', label: 'Decent Food', icon: <Utensils size={16} /> },
    { id: 'wait', label: 'Long Wait', icon: <Zap size={16} /> },
    { id: 'service', label: 'Average Service', icon: <Smile size={16} /> },
    { id: 'loud', label: 'Loud Environment', icon: <Home size={16} /> },
    { id: 'price', label: 'Fair Prices', icon: <ThumbsUp size={16} /> },
    { id: 'improve', label: 'Needs Improvement', icon: <Pencil size={16} /> },
  ],
  2: [
    { id: 'service', label: 'Slow Service', icon: <Zap size={16} /> },
    { id: 'order', label: 'Wrong Order', icon: <Utensils size={16} /> },
    { id: 'food', label: 'Cold Food', icon: <Utensils size={16} /> },
    { id: 'staff', label: 'Rude Staff', icon: <Smile size={16} /> },
    { id: 'clean', label: 'Poor Cleanliness', icon: <Sparkles size={16} /> },
    { id: 'vibe', label: 'Disappointing', icon: <ThumbsUp size={16} className="rotate-180" /> },
  ],
  1: [
    { id: 'service', label: 'Slow Service', icon: <Zap size={16} /> },
    { id: 'order', label: 'Wrong Order', icon: <Utensils size={16} /> },
    { id: 'food', label: 'Cold Food', icon: <Utensils size={16} /> },
    { id: 'staff', label: 'Rude Staff', icon: <Smile size={16} /> },
    { id: 'clean', label: 'Poor Cleanliness', icon: <Sparkles size={16} /> },
    { id: 'vibe', label: 'Terrible Experience', icon: <ThumbsUp size={16} className="rotate-180" /> },
  ],
};

const RATING_MESSAGES: Record<number, string> = {
  5: "Amazing! Thanks for the 5-star rating.",
  4: "Great! Thanks for the 4-star rating.",
  3: "Thanks for the feedback. We're always improving.",
  2: "We're sorry it wasn't a 5-star experience.",
  1: "We sincerely apologize for your experience."
};

export function ReviewUI({ restaurant, sessionId }: { restaurant: any, sessionId: string }) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [options, setOptions] = useState<ReviewOption[]>([]);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const currentTags = useMemo(() => RATING_TAGS[rating as keyof typeof RATING_TAGS] || RATING_TAGS[5], [rating]);

  // Use the new logo_url from db or fallback to the generic placeholder
  const logoUrl = restaurant.logo_url || '/logo.png';

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId];
      // Reactive regeneration: update reviews when tags change
      setTimeout(() => generateReviews(rating, newTags), 0);
      return newTags;
    });
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    setSelectedTags([]); 
    generateReviews(selectedRating);
  };

  const generateReviews = async (selectedRating: number = rating, providedTags?: string[]) => {
    if (selectedRating < 1) return;
    
    setIsGenerating(true);
    setEditingIndex(null);
    setSelectedReviewIndex(0); // Default select first
    setError(null);

    // Map selected tag IDs to their actual labels for the API
    const activeTagLabels = currentTags
      .filter(t => (providedTags || selectedTags).includes(t.id))
      .map(t => t.label);

    try {
      const response = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating: selectedRating, 
          restaurantId: restaurant.id,
          selectedTags: activeTagLabels,
          sessionId: sessionId
        }),
      });
      
      const data = await response.json();
      if (response.ok && data.options) {
        const mappedOptions = data.options.map((opt: any, i: number) => ({
          ...opt,
          title: i === 0 ? 'Food Lover' : i === 1 ? 'Great Experience' : 'Local Favorite',
          icon: i === 0 ? <Utensils size={24} /> : i === 1 ? <Sparkles size={24} /> : <MapPin size={24} />,
          color: i === 0 ? 'text-[#3B82F6]' : i === 1 ? 'text-[#F59E0B]' : 'text-[#10B981]',
          bgColor: i === 0 ? 'bg-[#EFF6FF]' : i === 1 ? 'bg-[#FEF3C7]' : 'bg-[#D1FAE5]',
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

  const handleReviewEdit = (index: number, newText: string) => {
    setOptions(prev => {
      const newOptions = [...prev];
      newOptions[index].text = newText;
      return newOptions;
    });
  };

  const copyAndRedirect = (text: string, index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setShowGuide(true);
    
    const googleUrl = `https://search.google.com/local/writereview?placeid=${restaurant.google_place_id || 'ChIJN1t_tDeuEmsRUsoyG83frY4'}`;
    
    setTimeout(() => {
      window.open(googleUrl, '_blank');
      setTimeout(() => {
        setShowGuide(false);
        setCopiedIndex(null); // Reset button state after redirect modal closes
      }, 500);
    }, 2500);
  };

  const scrollReviews = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const step = rating === 0 ? 1 : (options.length === 0 || isGenerating ? 2 : 3);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] font-sans selection:bg-[#3B82F6]/20 py-10 px-4 md:px-8">
      
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
             <div className="w-20 h-20 bg-[#2D3748] rounded-full overflow-hidden shadow-md flex items-center justify-center border-4 border-white">
                {logoUrl !== '/logo.png' ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Utensils size={32} className="text-[#FABB05]" />
                )}
             </div>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#111827] mb-1">{restaurant.business_name}</h1>
          <p className="text-[#6B7280] text-sm font-medium flex items-center justify-center gap-1.5">
            Powered by StarPlated <Sparkles size={14} className="text-[#3B82F6]" />
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-medium mb-10 overflow-x-auto whitespace-nowrap px-4 hide-scrollbar">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#3B82F6] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>1</div>
            Rate your visit
          </div>
          <div className="w-4 md:w-8 h-px bg-[#E5E7EB]"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#3B82F6] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>2</div>
            Choose review style
          </div>
          <div className="w-4 md:w-8 h-px bg-[#E5E7EB]"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-[#3B82F6] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>3</div>
            Post to Google
          </div>
        </div>

        {/* Card 1: Rating & Tags */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 mb-6 transition-all">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#111827] mb-2 flex items-center justify-center gap-2">
              <Sparkles size={24} className="text-[#FABB05]" fill="#FABB05" />
              How was your experience?
            </h2>
            <p className="text-[15px] text-[#6B7280]">Your feedback helps local restaurants grow.</p>
          </div>
          
          <div className="flex justify-center gap-2 md:gap-4 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRatingClick(star)}
                className="transition-transform active:scale-75 duration-200"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill={star <= (hoveredRating || rating) ? "#FABB05" : "none"}
                  stroke={star <= (hoveredRating || rating) ? "#FABB05" : "#D1D5DB"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-all duration-300 ${star <= (hoveredRating || rating) ? 'scale-110 drop-shadow-sm' : ''}`}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>
          
          <p className={`text-center text-sm font-medium transition-opacity duration-300 h-6 ${rating > 0 ? 'text-[#6B7280] opacity-100' : 'opacity-0'}`}>
            {RATING_MESSAGES[rating] || ''}
          </p>

          {/* Tags Section inside Card 1 */}
          {rating > 0 && (
            <div className="mt-10 border border-[#E5E7EB] rounded-[20px] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-[17px] font-bold text-[#111827] mb-1">What stood out most?</h3>
                <p className="text-sm text-[#6B7280]">Select all that apply (optional)</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {currentTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 border ${
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#2563EB] shadow-sm'
                          : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <span className={isSelected ? 'text-[#3B82F6]' : tag.color || 'text-[#9CA3AF]'}>
                        {tag.icon}
                      </span>
                      {tag.label}
                      {isSelected && (
                        <div className="bg-[#3B82F6] text-white rounded-full w-4 h-4 flex items-center justify-center ml-1">
                          <CheckCircle2 size={12} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: AI Generation Results */}
        {(isGenerating || options.length > 0) && (
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#111827] mb-2 flex items-center justify-center gap-2">
                <Sparkles size={24} className="text-[#FABB05]" fill="#FABB05" />
                Choose a review to share
              </h2>
              <p className="text-[15px] text-[#6B7280]">Select the one that best matches your experience.</p>
            </div>

            {isGenerating && !options.length ? (
              <div className="py-16 text-center">
                <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin mx-auto mb-4" />
                <p className="text-[15px] font-medium text-[#6B7280] animate-pulse">Our AI is crafting your options...</p>
              </div>
            ) : (
              <div className="relative group">
                {/* Loader Overlay when regenerating */}
                {isGenerating && options.length > 0 && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[2px] rounded-[24px]">
                    <div className="bg-white/90 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-[#E5E7EB]">
                      <Loader2 size={20} className="text-[#3B82F6] animate-spin" />
                      <span className="text-sm font-bold text-[#111827]">Updating reviews...</span>
                    </div>
                  </div>
                )}
                
                {/* Desktop Carousel Arrows */}
                <button 
                  onClick={() => scrollReviews('left')} 
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-[#E5E7EB] rounded-full shadow-md items-center justify-center text-[#6B7280] hover:text-[#111827] z-10 hover:scale-105 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scrollReviews('right')} 
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-[#E5E7EB] rounded-full shadow-md items-center justify-center text-[#6B7280] hover:text-[#111827] z-10 hover:scale-105 transition-all"
                >
                  <ChevronRight size={20} />
                </button>

                <div 
                  ref={scrollContainerRef}
                  className={`flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-2 px-2 transition-all duration-500 ${isGenerating ? 'blur-sm grayscale-[0.5] opacity-50' : ''}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {/* If generating and we have existing options, show them blurred. 
                      If no options yet, the loader above will show. */}
                  {options.map((option, index) => {
                    const isSelectedCard = selectedReviewIndex === index;
                    return (
                      <div 
                        key={index}
                        onClick={() => {
                          if (editingIndex !== index) {
                            setSelectedReviewIndex(index);
                          }
                        }}
                        className={`min-w-[280px] md:min-w-[320px] flex-1 bg-white border-2 rounded-[24px] p-6 snap-center transition-all cursor-pointer relative flex flex-col ${
                          isSelectedCard ? 'border-[#3B82F6] shadow-md' : 'border-[#F3F4F6] hover:border-[#E5E7EB]'
                        }`}
                      >
                        {/* Checkmark Badge */}
                        {isSelectedCard && (
                          <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#3B82F6] rounded-lg text-white flex items-center justify-center shadow-sm">
                            <CheckCircle2 size={16} strokeWidth={3} />
                          </div>
                        )}

                        {/* Top Icon & Title */}
                        <div className="flex flex-col items-center mb-5 text-center">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${option.bgColor} ${option.color}`}>
                            {option.icon}
                          </div>
                          <h3 className="text-[17px] font-bold text-[#111827]">{option.title}</h3>
                        </div>
                        
                        {/* Review Content */}
                        <div className="flex-1 mb-6 text-center relative group/edit">
                          {/* Edit Pencil (shows on hover or if selected) */}
                          {editingIndex !== index && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setSelectedReviewIndex(index); }}
                              className="absolute -top-8 -right-2 w-8 h-8 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center opacity-0 group-hover/edit:opacity-100 transition-opacity hover:bg-[#3B82F6] hover:text-white"
                              title="Edit Review"
                            >
                              <Pencil size={14} />
                            </button>
                          )}

                          {editingIndex === index ? (
                            <textarea 
                              value={option.text}
                              onChange={(e) => handleReviewEdit(index, e.target.value)}
                              className="w-full h-32 p-3 bg-[#F9FAFB] border border-[#3B82F6] rounded-xl text-[14px] text-[#374151] leading-relaxed focus:ring-0 focus:outline-none transition-all resize-none text-center"
                              autoFocus
                              onBlur={() => setEditingIndex(null)}
                            />
                          ) : (
                            <p 
                              className="text-[14px] text-[#4B5563] leading-relaxed cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setSelectedReviewIndex(index); }}
                            >
                              {option.text}
                            </p>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <div className="mt-auto">
                          <button 
                            onClick={(e) => { e.stopPropagation(); copyAndRedirect(option.text, index); }}
                            className={`w-full py-3.5 rounded-xl text-[15px] font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                              isSelectedCard 
                                ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white' 
                                : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                            }`}
                          >
                            {copiedIndex === index ? 'Redirecting...' : 'Share on Google'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Generate More Suggestions Button */}
                <div className="flex justify-center mt-2 mb-8">
                  <button 
                    onClick={() => generateReviews(rating)}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold text-[#3B82F6] hover:bg-[#EFF6FF] transition-all border border-transparent hover:border-[#DBEAFE] disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {options.length > 0 ? 'Generate More Suggestions' : 'Generate Reviews'}
                  </button>
                </div>

                {/* Trust Footer inside Card 2 */}
                <div className="mt-4 bg-[#F0F5FF] rounded-2xl py-4 px-6 flex items-center justify-center gap-3">
                  <Lock size={16} className="text-[#3B82F6]" />
                  <p className="text-[14px] text-[#1E293B] font-medium">You can edit your review before posting on Google.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page Footer */}
        <div className="mt-8 mb-4 flex items-center justify-center gap-2 text-[#6B7280] opacity-80">
          <ShieldCheck size={16} />
          <p className="text-[13px] font-medium">Secure. Private. Trusted by restaurants.</p>
        </div>

      </div>

      {/* Redirect Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#111827]/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[32px] p-10 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-[#EFF6FF] text-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-6">
               <Copy size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#111827] mb-3">Review Copied!</h3>
            <p className="text-[#4B5563] text-[15px] leading-relaxed mb-8">
              We're opening Google now. Just <span className="font-bold text-[#111827]">Paste</span> your review and select <span className="font-bold text-[#111827]">{rating} stars</span>.
            </p>
            <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
               <div className="h-full bg-[#3B82F6] animate-[progress_2.5s_linear_forwards]" />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
