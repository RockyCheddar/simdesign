import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateProcedureNotePrompt = (caseData: object, existingNotes: any[]): string => {
  return `
    You are a healthcare provider documenting a medical procedure or intervention. Generate a realistic procedure note that documents the intervention performed, technique used, patient response, and outcomes. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Here are the existing progress notes for context:
    \`\`\`json
    ${JSON.stringify(existingNotes, null, 2)}
    \`\`\`

    Generate a procedure note in this exact JSON structure:

    {
      "timestamp": "Time 45-300 minutes after the most recent note, format HH:MM",
      "author": "Realistic healthcare provider name with credentials (e.g., 'Dr. Sarah Kim, MD' or 'Mark Johnson, RN')",
      "department": "Appropriate department (Emergency Medicine, Surgery, Interventional, etc.)",
      "type": "procedure",
      "note": "Procedure note documenting: 'Procedure: [name of procedure]. Indication: [reason for procedure]. Technique: [brief description of how performed]. Patient tolerated procedure well/with [complications if any]. Post-procedure: [immediate results/outcomes]. Plan: [follow-up care].' Use appropriate medical procedure documentation format. 3-5 sentences total."
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Choose procedure appropriate to the patient's presentation and clinical needs
    3. Use realistic procedure names and medical terminology
    4. Include clear indication for the procedure
    5. Document technique and patient response appropriately
    6. Make timestamp logical progression from existing notes
    7. Use proper procedure note format and structure
    8. Include post-procedure monitoring and care plans
    9. Choose appropriate healthcare provider based on procedure complexity
    10. Document any complications or unexpected findings realistically
    11. Include immediate outcomes and next steps
    12. Use standard medical procedure documentation style
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

    const prompt = generateProcedureNotePrompt(caseData, existingNotes);

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
    let procedureNoteData;
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
      
      procedureNoteData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      procedureNoteData
    });

  } catch (error) {
    console.error('Error generating procedure note:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate procedure note'
      },
      { status: 500 }
    );
  }
} 