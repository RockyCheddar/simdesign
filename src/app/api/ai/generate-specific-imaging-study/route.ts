import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { caseData, studyType, existingStudies } = await request.json();

    if (!caseData || !studyType) {
      return NextResponse.json(
        { error: 'Missing required fields: caseData and studyType' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = generateSpecificStudyPrompt(caseData, studyType, existingStudies);

    console.log(`Generating specific ${studyType} study with Claude...`);
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.2,
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

    // Clean the response to ensure it's valid JSON
    let cleanedResponse = content.text.trim();
    
    // Remove any markdown code blocks
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    let newStudyData;
    try {
      newStudyData = JSON.parse(cleanedResponse);
      console.log(`✅ ${studyType} study generation successful`);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    return NextResponse.json({
      newStudyData,
      message: `${studyType} study generated successfully`
    });

  } catch (error) {
    console.error('Error generating specific imaging study:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate specific imaging study'
      },
      { status: 500 }
    );
  }
}

const generateSpecificStudyPrompt = (caseData: object, studyType: string, existingStudies: any[]): string => {
  const existingStudiesText = existingStudies?.length 
    ? `\n\nExisting studies already generated:\n${JSON.stringify(existingStudies, null, 2)}`
    : '';

  return `
    You are an expert radiologist generating a specific ${studyType} imaging study for a healthcare simulation case. Create a realistic, clinically accurate report that matches authentic radiology department standards. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`${existingStudiesText}

    Generate a single ${studyType} study that would be clinically appropriate for this case. Ensure it complements but does not duplicate any existing studies.

    Generate the study in this exact JSON structure:

    {
      "id": "unique-study-id",
      "type": "${studyType === 'Xray' ? 'X-ray' : studyType}",
      "bodyPart": "Specific anatomical region appropriate for ${studyType}",
      "studyName": "Complete study name (e.g., 'Chest X-ray PA and Lateral', 'CT Head without Contrast')",
      "orderDateTime": "YYYY-MM-DD HH:MM format",
      "completedDateTime": "YYYY-MM-DD HH:MM format",
      "urgency": "STAT" | "Urgent" | "Routine",
      "indication": "Clinical reason for ordering this specific ${studyType} study",
      "technique": "Technical parameters specific to ${studyType}",
      "contrast": {
        "used": true | false,
        "type": "Appropriate contrast type for ${studyType} or null",
        "amount": "Amount if applicable or null"
      },
      "findings": "Detailed radiological findings specific to ${studyType} imaging",
      "impression": "Radiologist's final interpretation and diagnosis",
      "clinicalCorrelation": "How findings relate to patient's presentation",
      "recommendations": "Follow-up recommendations or additional studies needed",
      "radiologist": "Dr. [Name], MD",
      "transcriptionDate": "YYYY-MM-DD HH:MM format"
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Generate a ${studyType} study that is clinically appropriate for the case
    3. Use authentic radiologist report language and ${studyType}-specific terminology
    4. Include proper medical terminology and anatomical references
    5. Make findings consistent with the patient's presentation
    6. Include both normal findings and any relevant abnormalities
    7. Use realistic timestamps that align with the case timeline
    8. Include appropriate urgency level based on clinical presentation
    9. Provide ${studyType}-specific technical details
    10. Include clinically relevant recommendations
    11. Ensure the study complements existing studies without duplication
    12. Use standard ${studyType} imaging protocols and positioning
    13. Include pertinent negatives that are clinically significant
    14. Make contrast decisions appropriate for ${studyType} and clinical indication
    15. Use realistic radiologist name and credentials
    16. Ensure findings support or contribute to the differential diagnosis

    Generate a comprehensive, realistic ${studyType} study now:
  `;
};

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'generate-specific-imaging-study',
    description: 'AI-powered specific imaging study generation'
  });
} 