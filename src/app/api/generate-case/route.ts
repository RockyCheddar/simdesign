import { NextRequest, NextResponse } from 'next/server';
import { generateSimulationCase, validateAnthropicApiKey } from '@/lib/anthropic';
import { AIGenerationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!validateAnthropicApiKey()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Anthropic API key not configured' 
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: AIGenerationRequest = await request.json();

    // Validate required fields
    if (!body.prompt || !body.caseType || !body.specialty || !body.difficulty) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: prompt, caseType, specialty, difficulty' 
        },
        { status: 400 }
      );
    }

    // Generate the case using Claude
    const simulationCase = await generateSimulationCase(body);

    return NextResponse.json({
      success: true,
      data: simulationCase,
      message: 'Case generated successfully',
    });

  } catch (error) {
    console.error('Error in generate-case API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to generate cases.' 
    },
    { status: 405 }
  );
} 