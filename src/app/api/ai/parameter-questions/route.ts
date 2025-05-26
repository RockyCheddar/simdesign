import { NextRequest, NextResponse } from 'next/server';
import { generateParameterQuestions } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { learningContext, refinedObjectives } = body;

    // Validate required fields
    if (!learningContext || !refinedObjectives || !Array.isArray(refinedObjectives)) {
      return NextResponse.json(
        { error: 'Learning context and refined objectives are required' },
        { status: 400 }
      );
    }

    // Generate parameter questions using AI
    const questions = await generateParameterQuestions(learningContext, refinedObjectives);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating parameter questions:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate parameter questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 