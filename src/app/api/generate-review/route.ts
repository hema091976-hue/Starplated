import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Extend Vercel serverless function timeout to 30s (default is 10s)
export const maxDuration = 30;

// Admin client — bypasses RLS for public (unauthenticated) API calls
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Robust JSON array extractor — handles markdown fences, extra text, etc. */
function extractJsonArray(text: string): any[] | null {
  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (_) {}

  const match = cleaned.match(/\[[\s\S]*?\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {}
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const { rating, restaurantId, selectedTags } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
    }

    // ── Demo shortcut ─────────────────────────────────────────────────────────
    if (restaurantId === 'demo-restaurant') {
      return NextResponse.json({
        options: generateFallbackOptions(
          {
            business_name: 'The Demo Bistro',
            ambiance_context: 'A cozy modern bistro with artisanal coffee, homemade pastries and all-day brunch.',
            menu_context: 'Avocado toast, eggs benedict, flat white coffee, blueberry pancakes, smashed burger',
          },
          rating
        ),
      });
    }

    // ── Fetch restaurant with ALL context fields ───────────────────────────────
    const { data: restaurant, error: dbError } = await supabaseAdmin
      .from('restaurants')
      .select('business_name, ambiance_context, menu_context, menu_urls, google_place_id')
      .eq('id', restaurantId)
      .single();

    if (dbError || !restaurant) {
      console.error('Restaurant fetch error:', dbError);
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const apiKey = process.env.GOOGLE_AI_KEY;

    if (!apiKey) {
      console.warn('GOOGLE_AI_KEY not configured — returning smart fallback reviews');
      logEvent(restaurantId, rating);
      return NextResponse.json({ options: generateFallbackOptions(restaurant, rating) });
    }

    // ── Build rich context for Gemini ─────────────────────────────────────────
    const restaurantName = (restaurant.business_name || 'this restaurant').trim();
    const ambianceText   = restaurant.ambiance_context?.trim() || '';
    const menuText       = restaurant.menu_context?.trim() || '';

    // Combine all text context
    const contextParts: string[] = [];
    if (ambianceText) contextParts.push(`Ambiance & vibe: ${ambianceText}`);
    if (menuText)     contextParts.push(`Menu highlights & dishes: ${menuText}`);
    const fullContext = contextParts.length > 0
      ? contextParts.join('\n\n')
      : 'A welcoming local restaurant known for quality food and friendly service.';

    const prompt = `You are generating realistic customer restaurant reviews for Google Reviews.
The review must match the exact sentiment of the provided star rating.

Rules:
- 5 stars = highly positive and enthusiastic
- 4 stars = positive with minor imperfections
- 3 stars = mixed or average experience
- 2 stars = mostly negative with some acceptable parts
- 1 star = strongly negative and dissatisfied

Never make a 1-star review sound positive.
Never make a 5-star review sound negative.

Reviews should:
- sound natural and human
- vary sentence structure
- avoid sounding robotic or fake
- be concise (2–5 sentences)
- reference food, service, ambience, or experience naturally
- avoid excessive exaggeration
- DO NOT use emojis.
- DO NOT use quotation marks.

RESTAURANT DATA:
Restaurant Name: ${restaurantName}
Restaurant Description: ${fullContext}
Star Rating: ${rating}
Selected Tags: ${selectedTags?.join(', ') || 'none'}

INSTRUCTIONS:
Write exactly 3 distinct Google reviews that accurately reflect the sentiment of the rating. 
Each should have a different persona:
1. "The Foodie": focused on tastes and specific dishes
2. "The Vibe": focused on atmosphere and service
3. "The Local": short, punchy, and casual

Return ONLY a raw JSON array with no markdown, no explanation:
[{"type":"The Foodie","text":"..."},{"type":"The Vibe","text":"..."},{"type":"The Local","text":"..."}]`;

    // ── Call Gemini (text-only — fast and reliable) ────────────────────────────
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using 'gemini-flash-latest' as it's guaranteed to be available in 2026
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 1400,
        },
      });

      const responseText = result.response.text();
      console.log('Gemini raw response (first 300 chars):', responseText.slice(0, 300));

      const parsed = extractJsonArray(responseText);

      if (parsed && parsed.length >= 3) {
        logEvent(restaurantId, rating);
        return NextResponse.json({ options: parsed });
      }

      console.warn('Gemini did not return a valid JSON array — falling back to templates');
      logEvent(restaurantId, rating);
      return NextResponse.json({ options: generateFallbackOptions(restaurant, rating) });

    } catch (geminiError: any) {
      console.error('Gemini error:', geminiError?.message ?? geminiError);
      logEvent(restaurantId, rating);
      return NextResponse.json({ options: generateFallbackOptions(restaurant, rating) });
    }

  } catch (outerError: any) {
    console.error('generate-review fatal error:', outerError?.message ?? outerError);
    return NextResponse.json({ error: 'Failed to generate review. Please try again.' }, { status: 500 });
  }
}

/** Fire-and-forget analytics — errors are silently swallowed */
async function logEvent(restaurantId: string, rating: number) {
  try {
    await supabaseAdmin.from('analytics_events').insert({
      restaurant_id: restaurantId,
      event_type: 'review_generated',
      rating,
    });
  } catch (_) { /* non-critical */ }
}

/** Context-aware template fallbacks — used when Gemini is unavailable */
function generateFallbackOptions(restaurant: any, rating: number) {
  const name = (restaurant.business_name || 'this restaurant').trim();
  const combined = [
    restaurant.ambiance_context || '',
    restaurant.menu_context || '',
  ].join(' ').toLowerCase();

  // Try to pull a specific dish from the context
  const dishPatterns = [
    /(?:speciali[sz]e(?:s|d)? in|known for|famous for|best|signature|try the|must.?have)\s+([^.,!?\n]+)/i,
    /(?:^|\W)([\w\s]{3,25}(?:pizza|pasta|burger|taco|sushi|curry|steak|salad|sandwich|wings|ribs|ramen|noodle|dumpling|roll|bowl|coffee|latte|cocktail|cake|dessert))/i,
  ];
  let dishHint: string | null = null;
  for (const pattern of dishPatterns) {
    const m = combined.match(pattern);
    if (m) { dishHint = m[1].trim(); break; }
  }

  const isRomantic = combined.includes('romantic') || combined.includes('candlelit') || combined.includes('intimate');
  const isCasual   = combined.includes('casual') || combined.includes('laid-back') || combined.includes('relaxed');

  if (rating === 5) return [
    { type: 'The Foodie',  text: `${name} absolutely delivered. ${dishHint ? `The ${dishHint} was genuinely one of the best things I've eaten this year — seriously, order it.` : 'Every single dish hit the mark — bold flavors, beautiful presentation, and nothing felt like an afterthought.'} Already booked a table for next weekend.` },
    { type: 'The Vibe',   text: `Everything about ${name} just works. The vibe is ${isRomantic ? 'romantic without feeling stuffy' : isCasual ? 'relaxed and welcoming' : 'warm and unpretentious'}, the staff genuinely seem to love being there, and it shows in how they treat you. Perfect from start to finish.` },
    { type: 'The Local',  text: `${name} is my go-to and has been for a while. Consistent, delicious, zero disappointments. If you haven't been, what are you waiting for?` },
  ];

  if (rating === 4) return [
    { type: 'The Foodie',  text: `Really impressed with ${name}. ${dishHint ? `The ${dishHint} was a highlight — packed with flavor.` : 'The food was genuinely good — clearly made with care.'} There was a bit of a wait but honestly the quality made up for it. Would 100% go back.` },
    { type: 'The Vibe',   text: `Great night out at ${name}. ${isRomantic ? 'Perfect date spot.' : isCasual ? 'Super laid-back, no pretension.' : 'Nice atmosphere, good energy.'} Staff were on it and the whole experience felt easy and enjoyable. Minor things could be tweaked but nothing that stopped us from having a great time.` },
    { type: 'The Local',  text: `${name} never really lets you down. Solid food, good vibes, friendly service. Dependable neighborhood gem — 4 stars all day.` },
  ];

  if (rating === 3) return [
    { type: 'The Foodie',  text: `${name} had its moments. ${dishHint ? `The ${dishHint} was decent but didn't quite live up to what I was hoping for.` : 'Some dishes landed, others felt a bit flat.'} There's definitely a good restaurant in there — it just needs a bit more consistency.` },
    { type: 'The Vibe',   text: `A fine experience at ${name} — nothing went wrong, but nothing really wowed me either. The staff were pleasant and the atmosphere was okay. Worth a visit for a casual meal but don't set your expectations too high.` },
    { type: 'The Local',  text: `${name} is decent. Gets the job done for a quick bite. Wouldn't go out of my way but happy enough going back nearby.` },
  ];

  if (rating === 2) return [
    { type: 'The Foodie',  text: `${name} fell short for me. ${dishHint ? `The ${dishHint} was underwhelming — not what I was expecting at all.` : 'The food felt rushed and inconsistent.'} The potential is there but they need to tighten things up. I've had better for less.` },
    { type: 'The Vibe',   text: `A bit of a disappointing visit to ${name}. Service was slow and the atmosphere didn't quite come together. The staff tried to be friendly but it felt understaffed. Maybe worth a second chance on a quieter night.` },
    { type: 'The Local',  text: `${name} has work to do. Not terrible, but left wanting more. Two stars feels fair — hoping they sort things out.` },
  ];

  return [
    { type: 'The Foodie',  text: `Really struggled with ${name} this time. The food was significantly below par and it showed throughout the meal. Genuinely hoping they can address the issues because the concept is solid.` },
    { type: 'The Vibe',   text: `Tough visit to ${name}. Issues from start to finish — both with the food and the service. Not something I'd rush back to, but I hope the feedback is useful to them.` },
    { type: 'The Local',  text: `${name} missed the mark badly on my last visit. Hoping it was just a bad day — I'll give it time before trying again.` },
  ];
}
