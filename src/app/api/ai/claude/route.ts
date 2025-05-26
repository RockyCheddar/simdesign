import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Get client IP for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { prompt, maxTokens = 2000, temperature = 0.7 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create message with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Using the latest available model
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      clearTimeout(timeoutId);

      // Extract text content from the response
      const textContent = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      return NextResponse.json({
        success: true,
        content: textContent,
        usage: message.usage
      });

    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        );
      }
      
      throw error;
    }

  } catch (error: unknown) {
    console.error('Claude API Error:', error);

    // Handle specific Anthropic errors
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number };
      
      if (statusError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      if (statusError.status === 429) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (statusError.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 