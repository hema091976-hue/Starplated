import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { rating, restaurantId } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch restaurant context for AI
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('business_name, ambiance_context, menu_urls')
      .eq('id', restaurantId)
      .single();

    const genAI = process.env.GOOGLE_AI_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY) : null;
    let options = [];

    if (!restaurant) {
      if (restaurantId === 'demo-restaurant') {
        options = generateFallbackOptions({ business_name: 'The Demo Bistro' }, rating);
      } else {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }
    } else if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        You are an AI that writes authentic-sounding Google reviews for a restaurant called "${restaurant.business_name}".
        
        Context about the restaurant's vibe:
        "${restaurant.ambiance_context || 'A great local dining spot.'}"
        
        The user rated the restaurant ${rating} out of 5 stars.
        
        Task: 
        1. If I have provided images of the menu, look at them carefully. Identify 2-3 signature dishes, drinks, or unique menu items.
        2. Generate 3 distinct reviews matching the ${rating}-star rating.
        
        Review 1 (The Foodie): Write like a passionate food lover. Mention specific dishes you see on the menu. Use natural, conversational phrasing (e.g., "Oh my god, you have to try the...", "I'm still thinking about that sauce"). 
        Review 2 (The Vibe): Focus on the personal experience—the lighting, the music, the friendly service. Mention how it made you feel (e.g., "Perfect for a date night", "Such a cozy neighborhood gem").
        Review 3 (The Local): Write it like a short, punchy recommendation from a regular. Use casual language and personal touches.
        
        IMPORTANT: Every review you generate MUST be completely unique and different from anything you've written before. Vary the vocabulary, sentence structure, and specific personal anecdotes significantly. Never use the same opening or closing twice.
        
        Return ONLY a JSON array of objects with "type" and "text" fields.
        Example format: [{"type": "The Foodie", "text": "..."}, {"type": "Quick & Easy", "text": "..."}, {"type": "Ambiance Fan", "text": "..."}]
      `;

      try {
        const parts: any[] = [{ text: prompt }];

        if (restaurant.menu_urls && restaurant.menu_urls.length > 0) {
          const imageUrls = restaurant.menu_urls.slice(0, 2);
          for (const url of imageUrls) {
            try {
              const imageResp = await fetch(url);
              const buffer = await imageResp.arrayBuffer();
              parts.push({
                inlineData: {
                  data: Buffer.from(buffer).toString('base64'),
                  mimeType: "image/jpeg"
                }
              });
            } catch (err) {
              console.error('Failed to fetch menu image for AI:', url);
            }
          }
        }

        const result = await model.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          }
        });
        const text = result.response.text();
        const cleanedText = text.replace(/```json|```/g, '').trim();
        options = JSON.parse(cleanedText);
        
        // Ensure we always have exactly 3 options
        if (!Array.isArray(options) || options.length === 0) {
          options = generateFallbackOptions(restaurant, rating);
        }
      } catch (e) {
        console.error('Gemini Vision error:', e);
        options = generateFallbackOptions(restaurant, rating);
      }
    } else {
      options = generateFallbackOptions(restaurant, rating);
    }

    // Log the generation event
    if (restaurantId !== 'demo-restaurant' && restaurantId.length === 36) {
      await supabase.from('analytics_events').insert({
        restaurant_id: restaurantId,
        event_type: 'review_generated',
        rating: rating
      });
    }

    return NextResponse.json({ options });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Failed to generate review' }, { status: 500 });
  }
}

function generateFallbackOptions(restaurant: any, rating: number) {
  const name = restaurant.business_name || 'this restaurant';
  
  if (rating === 5) {
    return [
      {
        type: "The Foodie",
        text: `Absolutely incredible experience at ${name}! Every dish was bursting with flavor and perfectly presented. You can really tell they care about the quality of their ingredients. A must-visit!`
      },
      {
        type: "Quick & Easy",
        text: `Amazing food and even better service. ${name} never disappoints. 10/10!`
      },
      {
        type: "Ambiance Fan",
        text: `The atmosphere here is unmatched. It has such a great vibe and the staff makes you feel right at home. Perfect for a night out!`
      }
    ];
  } else if (rating === 4) {
    return [
      {
        type: "The Foodie",
        text: `Really great food at ${name}. Everything was delicious, especially the main course. Just a tiny wait for the table, but worth it!`
      },
      {
        type: "Quick & Easy",
        text: `Solid 4 stars. Good food, friendly staff, and very consistent.`
      },
      {
        type: "Ambiance Fan",
        text: `Loved the vibe here! Very cool spot with great music and a relaxed atmosphere. Food was good too.`
      }
    ];
  }
  
  // Generic fallback for low ratings
  return [
    { type: "Option 1", text: `Had a decent time at ${name}. The food was good and the service was friendly.` },
    { type: "Option 2", text: `Nice experience overall. Staff were attentive.` },
    { type: "Option 3", text: `A solid local spot. Worth a visit.` }
  ];
}
