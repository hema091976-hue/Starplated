import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) return NextResponse.json({ error: 'KEY_MISSING' });

    // RAW FETCH to bypass SDK and any caching
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    return NextResponse.json({
      status: res.status,
      modelsFound: data.models?.length || 0,
      modelList: data.models?.map((m: any) => m.name) || [],
      errorFromGoogle: data.error || null,
      apiKeyUsed: `${apiKey.substring(0, 6)}...`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
