import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateProgressNotePrompt = (caseData: object, existingNotes: any[]): string => {
  return `
    You are an expert healthcare provider writing a progress note for an ongoing patient case. Generate a realistic clinical progress note that builds upon the existing clinical narrative and shows progression of care. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Here are the existing progress notes for context:
    \`\`\`json
    ${JSON.stringify(existingNotes, null, 2)}
    \`\`\`

    Generate a new progress note in this exact JSON structure:

    {
      "timestamp": "Time 30-300 minutes after the most recent note, format HH:MM",
      "author": "Realistic healthcare provider name with credentials (different from existing notes)",
      "department": "Appropriate department (Emergency Medicine, Internal Medicine, etc.)",
      "type": "progress",
      "note": "Clinical progress note documenting current status, any changes in condition, interventions performed, patient response, and ongoing plan. Use proper medical documentation style. 2-4 sentences showing realistic clinical progression."
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Base the note on the provided case data and existing clinical timeline
    3. Use realistic medical abbreviations and terminology
    4. Make timestamp logical progression from existing notes (30-300 minutes later)
    5. Choose appropriate healthcare provider type and realistic name
    6. Document realistic clinical changes or interventions
    7. Show appropriate medical reasoning and clinical decision-making
    8. Use standard medical documentation formatting
    9. Make the note complement existing documentation without repetition
    10. Include realistic vital sign changes, medication responses, or status updates
    11. Ensure provider name and department are realistic and different from existing notes
    12. Keep note length appropriate for progress documentation (2-4 sentences)
  `;
};

export async function POST(request: NextRequest) {
  try {
    const { caseData, existingNotes = [] } = await request.json();

    if (!caseData) {
      return NextResponse.json(
        { error: 'Missing required field: caseData' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = generateProgressNotePrompt(caseData, existingNotes);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse the JSON response - handle markdown code blocks
    let progressNoteData;
    try {
      let responseText = content.text;
      
      console.log('Raw Claude response (first 200 chars):', responseText.substring(0, 200));
      
      // More robust markdown code block removal
      if (responseText.includes('```')) {
        const jsonStart = responseText.indexOf('```json');
        const codeStart = responseText.indexOf('```');
        
        if (jsonStart !== -1) {
          responseText = responseText.substring(jsonStart + 7);
        } else if (codeStart !== -1) {
          responseText = responseText.substring(codeStart + 3);
        }
        
        const lastCodeBlock = responseText.lastIndexOf('```');
        if (lastCodeBlock !== -1) {
          responseText = responseText.substring(0, lastCodeBlock);
        }
      }
      
      responseText = responseText.trim();
      
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
      }
      
      progressNoteData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      progressNoteData
    });

  } catch (error) {
    console.error('Error generating progress note:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate progress note'
      },
      { status: 500 }
    );
  }
} 