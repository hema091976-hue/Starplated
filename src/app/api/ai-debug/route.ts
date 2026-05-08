import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 30;

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_AI_KEY is missing' }, { status: 500 });
    }

    // Use raw fetch to list models to avoid SDK limitations
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'API Key Validation Failed', 
        details: data,
        apiKeySnippet: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
      }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true, 
      availableModels: data.models?.map((m: any) => m.name) || [],
      message: 'Check availableModels list above for the correct name to use.'
    });

  } catch (outerError: any) {
    return NextResponse.json({ error: outerError.message }, { status: 500 });
  }
}
