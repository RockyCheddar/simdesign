import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateNursingAssessmentPrompt = (caseData: object, existingNotes: any[]): string => {
  return `
    You are an experienced registered nurse writing a nursing assessment note for a patient. Generate a realistic nursing assessment that focuses on nursing care priorities, patient response to interventions, and holistic patient care. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Here are the existing progress notes for context:
    \`\`\`json
    ${JSON.stringify(existingNotes, null, 2)}
    \`\`\`

    Generate a nursing assessment note in this exact JSON structure:

    {
      "timestamp": "Time 30-240 minutes after the most recent note, format HH:MM",
      "author": "Realistic nurse name with credentials (e.g., 'Jessica Thompson, RN BSN')",
      "department": "Nursing or specific unit (Emergency Nursing, ICU, Medical-Surgical, etc.)",
      "type": "nursing",
      "note": "Nursing assessment note including patient's current status, pain level, comfort measures provided, response to interventions, patient/family education provided, and nursing care plan updates. Use nursing-focused language and document holistic care. 2-4 sentences with nursing perspective and priorities."
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Use nursing-focused assessment language and priorities
    3. Include patient comfort, pain assessment, and response to care
    4. Document nursing interventions and patient education
    5. Use realistic nurse names and credentials (RN, BSN, etc.)
    6. Make timestamp logical progression from existing notes
    7. Focus on nursing care priorities (comfort, safety, education, emotional support)
    8. Include holistic patient assessment (physical, emotional, social needs)
    9. Document patient and family interactions/education
    10. Use appropriate nursing documentation style and terminology
    11. Show nursing clinical judgment and care planning
    12. Include safety considerations and fall risk if appropriate
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

    const prompt = generateNursingAssessmentPrompt(caseData, existingNotes);

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

    // Parse the JSON response
    let nursingAssessmentData;
    try {
      let responseText = content.text;
      
      console.log('Raw Claude response (first 200 chars):', responseText.substring(0, 200));
      
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
      
      nursingAssessmentData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      nursingAssessmentData
    });

  } catch (error) {
    console.error('Error generating nursing assessment:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate nursing assessment'
      },
      { status: 500 }
    );
  }
} 