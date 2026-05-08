import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

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
    const { rating, restaurantId, selectedTags, sessionId } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
    }

    if (restaurantId === 'demo-restaurant') {
      return NextResponse.json({
        options: [
          { type: 'The Foodie', text: 'Amazing food and great vibe!' },
          { type: 'The Vibe', text: 'Loved the atmosphere here.' },
          { type: 'The Local', text: 'My favorite spot in town.' }
        ]
      });
    }

    const { data: restaurant, error: dbError } = await supabaseAdmin
      .from('restaurants')
      .select('business_name, ambiance_context, menu_context, menu_urls, google_place_id')
      .eq('id', restaurantId)
      .single();

    if (dbError || !restaurant) {
      return NextResponse.json({ error: `Restaurant not found in DB: ${dbError?.message || 'Unknown'}` }, { status: 404 });
    }

    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_AI_KEY is missing from Vercel environment variables' }, { status: 500 });
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
1. "The Foodie": focused on tastes/dishes
2. "The Vibe": atmosphere/service
3. "The Local": punchy/casual

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
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      });

      const result = await model.generateContent(prompt);
      
      // Detailed error logging for response
      if (!result.response) {
         throw new Error('Gemini returned an empty response object');
      }

      const responseText = result.response.text();
      const parsed = extractJsonArray(responseText);

      if (parsed && parsed.length >= 3) {
        logEvent(restaurantId, rating, sessionId);
        return NextResponse.json({ options: parsed });
      }

      throw new Error(`AI generated content but failed JSON parsing. Raw: ${responseText.substring(0, 100)}...`);

    } catch (geminiError: any) {
      console.error('DEBUG - Gemini Error:', geminiError);
      
      const errorMsg = geminiError?.message || 'Unknown Gemini Error';
      
      // Expose error directly to user temporarily for debugging
      return NextResponse.json({ 
        error: `AI Error: ${errorMsg}`,
        details: geminiError?.stack || 'No stack trace'
      }, { status: 503 });
    }

  } catch (outerError: any) {
    console.error('DEBUG - Outer Error:', outerError);
    return NextResponse.json({ 
      error: `System Error: ${outerError?.message || 'Unknown'}` 
    }, { status: 500 });
  }
}

async function logEvent(restaurantId: string, rating: number, sessionId?: string) {
  try {
    await supabaseAdmin.from('analytics_events').insert({
      restaurant_id: restaurantId,
      event_type: 'review_generated',
      rating,
      session_id: sessionId
    });
  } catch (_) {}
}
