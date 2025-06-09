import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, sectionId } = await request.json();

    if (!prompt || !sectionId) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and sectionId' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Enhanced prompt for better content generation
    const enhancedPrompt = `
You are a medical education expert generating content for healthcare simulation cases.

TASK: Generate detailed, professional content for the following section:
${prompt}

REQUIREMENTS:
- Provide comprehensive, medically accurate information
- Use professional medical terminology appropriately
- Format content with HTML for proper display (use <p>, <ul>, <li>, <strong>, <em> tags)
- Include specific details relevant to healthcare simulation
- Ensure content is educational and practical for learners
- Keep content focused and well-organized

SECTION ID: ${sectionId}

Generate the content now:
`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: enhancedPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    return NextResponse.json({
      content: content.text,
      sectionId
    });

  } catch (error) {
    console.error('Error generating on-demand content:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate content'
      },
      { status: 500 }
    );
  }
} 