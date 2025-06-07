import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateSpecialistConsultPrompt = (caseData: object, existingNotes: any[]): string => {
  return `
    You are a specialist physician writing a consultation note for a patient. Generate a realistic specialist consultation that provides expert evaluation and recommendations based on the case presentation. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Here are the existing progress notes for context:
    \`\`\`json
    ${JSON.stringify(existingNotes, null, 2)}
    \`\`\`

    Generate a specialist consultation note in this exact JSON structure:

    {
      "timestamp": "Time 60-360 minutes after the most recent note, format HH:MM",
      "author": "Realistic specialist physician name with credentials (e.g., 'Dr. Michael Rodriguez, MD - Cardiology')",
      "department": "Appropriate specialty department (Cardiology, Pulmonology, Neurology, Gastroenterology, Orthopedics, etc.)",
      "type": "consultation",
      "note": "Specialist consultation note including: 'Consulted for [reason]. [Brief assessment of patient and relevant specialty findings]. Recommendations: [numbered list of 2-4 specific recommendations]. Will follow patient's progress.' Use appropriate specialty terminology and clinical reasoning. 3-5 sentences total."
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Choose specialty based on the patient's presentation and chief complaint
    3. Use realistic specialist names and credentials
    4. Include appropriate specialty-specific assessment and recommendations
    5. Make timestamp logical progression from existing notes
    6. Use proper medical consultation note format
    7. Provide 2-4 specific, actionable recommendations
    8. Use specialty-appropriate medical terminology
    9. Show expert clinical reasoning relevant to the specialty
    10. Make recommendations that complement existing care plan
    11. Include appropriate follow-up plans
    12. Keep consultation note concise but clinically comprehensive
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

    const prompt = generateSpecialistConsultPrompt(caseData, existingNotes);

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
    let specialistConsultData;
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
      
      specialistConsultData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      specialistConsultData
    });

  } catch (error) {
    console.error('Error generating specialist consult:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate specialist consult'
      },
      { status: 500 }
    );
  }
} 