import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Extend Vercel serverless function timeout to 30s
export const maxDuration = 30;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Robust JSON array extractor — handles markdown fences, extra text, etc. */
function extractJsonArray(text: string): any[] | null {
  try {
    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}

  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}

  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const arrayPart = cleaned.substring(start, end + 1);
      const parsed = JSON.parse(arrayPart);
      if (Array.isArray(parsed)) return parsed;
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

    if (restaurantId === 'demo-restaurant') {
      return NextResponse.json({
        options: generateFallbackOptions(
          {
            business_name: 'The Demo Bistro',
            ambiance_context: 'A cozy modern bistro with artisanal coffee and homemade pastries.',
            menu_context: 'Avocado toast, eggs benedict, flat white coffee, blueberry pancakes, burger',
          },
          rating
        ),
      });
    }

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
      return NextResponse.json({ error: 'AI key not configured' }, { status: 500 });
    }

    const restaurantName = (restaurant.business_name || 'this restaurant').trim();
    const ambianceText   = restaurant.ambiance_context?.trim() || '';
    const menuText       = restaurant.menu_context?.trim() || '';

    const contextParts: string[] = [];
    if (ambianceText) contextParts.push(`Ambiance: ${ambianceText}`);
    if (menuText)     contextParts.push(`Menu: ${menuText}`);
    const fullContext = contextParts.join('\n\n') || 'A welcoming local restaurant.';

    const prompt = `Generate exactly 3 realistic Google reviews for "${restaurantName}".
Rating: ${rating} Stars
Context: ${fullContext}
Tags: ${selectedTags?.join(', ') || 'none'}

Personas:
1. "The Foodie": focused on tastes and specific dishes
2. "The Vibe": focused on atmosphere and service
3. "The Local": short, punchy, and casual

Rules:
- NO EMOJIS.
- NO QUOTES.
- Natural, human-like tone.
- Matches sentiment of ${rating} stars exactly.
- Length: 2-5 sentences.

Return a JSON array of objects with "type" and "text" fields.`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = extractJsonArray(responseText);

      if (parsed && parsed.length >= 3) {
        logEvent(restaurantId, rating);
        return NextResponse.json({ options: parsed });
      }

      throw new Error('AI failed to produce a valid review list');

    } catch (geminiError: any) {
      console.error('Gemini error:', geminiError?.message ?? geminiError);
      return NextResponse.json({ 
        error: 'The AI is currently resting. Please try again in a moment.',
        details: geminiError?.message 
      }, { status: 503 });
    }

  } catch (outerError: any) {
    console.error('generate-review fatal error:', outerError?.message ?? outerError);
    return NextResponse.json({ error: 'System error. Please try again.' }, { status: 500 });
  }
}

async function logEvent(restaurantId: string, rating: number) {
  try {
    await supabaseAdmin.from('analytics_events').insert({
      restaurant_id: restaurantId,
      event_type: 'review_generated',
      rating,
    });
  } catch (_) {}
}

function generateFallbackOptions(restaurant: any, rating: number) {
  const name = (restaurant.business_name || 'this restaurant').trim();
  const combined = [(restaurant.ambiance_context || ''), (restaurant.menu_context || '')].join(' ').toLowerCase();
  
  if (rating === 5) return [
    { type: 'The Foodie',  text: `${name} absolutely delivered. Every single dish hit the mark — bold flavors and beautiful presentation. Already looking forward to my next visit.` },
    { type: 'The Vibe',   text: `Everything about ${name} just works. The atmosphere is warm and welcoming, and the staff genuinely seem to love being there. Perfect from start to finish.` },
    { type: 'The Local',  text: `${name} is my go-to and has been for a while. Consistent, delicious, and zero disappointments. If you haven't been, you're missing out.` },
  ];

  if (rating === 4) return [
    { type: 'The Foodie',  text: `Really impressed with ${name}. The food was genuinely good and clearly made with care. There was a bit of a wait but the quality made up for it.` },
    { type: 'The Vibe',   text: `Great night out at ${name}. Nice atmosphere and good energy. Staff were on it and the whole experience felt easy and enjoyable.` },
    { type: 'The Local',  text: `${name} never really lets you down. Solid food, good vibes, and friendly service. Dependable neighborhood gem.` },
  ];

  if (rating === 3) return [
    { type: 'The Foodie',  text: `${name} had its moments. Some dishes landed, others felt a bit flat. There's definitely a good restaurant in there — it just needs a bit more consistency.` },
    { type: 'The Vibe',   text: `A fine experience at ${name}. Nothing went wrong, but nothing really wowed me either. The staff were pleasant and the atmosphere was okay.` },
    { type: 'The Local',  text: `${name} is decent. Gets the job done for a quick bite. Wouldn't go out of my way but happy enough going back if I'm nearby.` },
  ];

  if (rating === 2) return [
    { type: 'The Foodie',  text: `${name} fell short for me. The food felt rushed and inconsistent. The potential is there but they need to tighten things up.` },
    { type: 'The Vibe',   text: `A bit of a disappointing visit to ${name}. Service was slow and the atmosphere didn't quite come together. Maybe worth a second chance on a quieter night.` },
    { type: 'The Local',  text: `${name} has work to do. Not terrible, but left wanting more. Hoping they sort things out soon.` },
  ];

  return [
    { type: 'The Foodie',  text: `Really struggled with ${name} this time. The food was significantly below par and it showed throughout the meal.` },
    { type: 'The Vibe',   text: `Tough visit to ${name}. Issues from start to finish — both with the food and the service. Not something I'd rush back to.` },
    { type: 'The Local',  text: `${name} missed the mark badly on my last visit. Hoping it was just a bad day.` },
  ];
}
