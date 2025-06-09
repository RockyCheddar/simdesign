import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { caseData } = await request.json();

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

    const prompt = generateImagingStudiesPrompt(caseData);

    console.log('Generating imaging studies with Claude...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.2, // Lower temperature for more consistent medical accuracy
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

    console.log('Raw Claude response (first 200 chars):', content.text.substring(0, 200));
    console.log('Raw Claude response (last 200 chars):', content.text.substring(content.text.length - 200));

    // Clean the response to ensure it's valid JSON
    let cleanedResponse = content.text.trim();
    
    // Remove any markdown code blocks
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log('Cleaned response text (first 300 chars):', cleanedResponse.substring(0, 300));
    console.log('Cleaned response text (last 100 chars):', cleanedResponse.substring(cleanedResponse.length - 100));

    // Parse the JSON response
    let imagingStudiesData;
    try {
      imagingStudiesData = JSON.parse(cleanedResponse);
      console.log('✅ JSON parsing successful');
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.error('Response that failed to parse:', cleanedResponse.substring(0, 500));
      throw new Error('Invalid JSON response from AI');
    }

    return NextResponse.json({
      imagingStudiesData,
      message: 'Imaging studies generated successfully'
    });

  } catch (error) {
    console.error('Error generating imaging studies:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate imaging studies'
      },
      { status: 500 }
    );
  }
}

const generateImagingStudiesPrompt = (caseData: object): string => {
  return `
    You are an expert radiologist generating comprehensive imaging studies for a healthcare simulation case. Create realistic, clinically accurate imaging reports that match authentic radiology department standards. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Based on the case presentation, chief complaint, physical exam findings, and clinical context, select and generate appropriate imaging studies. Consider what a real clinician would order based on the patient's symptoms and presentation.

    Generate imaging studies data in this exact JSON structure:

    {
      "studies": [
        {
          "id": "unique-study-id",
          "type": "X-ray" | "CT" | "MRI" | "Ultrasound" | "Nuclear Medicine" | "Fluoroscopy",
          "bodyPart": "Specific anatomical region (e.g., 'Chest', 'Left Knee', 'Abdomen and Pelvis')",
          "studyName": "Complete study name (e.g., 'Chest X-ray PA and Lateral', 'CT Abdomen/Pelvis with Contrast')",
          "orderDateTime": "YYYY-MM-DD HH:MM format",
          "completedDateTime": "YYYY-MM-DD HH:MM format",
          "urgency": "STAT" | "Urgent" | "Routine",
          "indication": "Clinical reason for ordering the study",
          "technique": "Technical parameters and method used",
          "contrast": {
            "used": true | false,
            "type": "Iodinated contrast" | "Gadolinium" | "Barium" | null,
            "amount": "Amount if applicable or null"
          },
          "findings": "Detailed radiological findings in professional medical language",
          "impression": "Radiologist's final interpretation and diagnosis",
          "clinicalCorrelation": "How findings relate to patient's presentation",
          "recommendations": "Follow-up recommendations or additional studies needed",
          "radiologist": "Dr. [Name], MD",
          "transcriptionDate": "YYYY-MM-DD HH:MM format"
        }
      ],
      "clinicalRationale": "Overall explanation of why these specific imaging studies were selected based on the clinical presentation",
      "priorityOrder": ["List of study IDs in order of clinical priority/urgency"],
      "totalStudies": "Number of studies generated",
      "emergentFindings": [
        "List any critical/emergent findings that require immediate attention",
        "Use 'None identified' if no emergent findings"
      ],
      "followUpRecommendations": [
        "Any recommended follow-up imaging or correlation with clinical findings",
        "Use 'None at this time' if no follow-up needed"
      ]
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Select 1-4 imaging studies that are clinically appropriate for the case presentation
    3. Use authentic radiologist report language and formatting
    4. Include proper medical terminology and anatomical references
    5. Make findings consistent with the patient's presentation and symptoms
    6. Include both normal findings and any relevant abnormalities
    7. Use realistic timestamps that align with the case timeline
    8. Include appropriate urgency levels based on clinical presentation
    9. Provide specific technical details (contrast, positioning, etc.)
    10. Include clinically relevant recommendations
    11. Make all findings educationally valuable for healthcare learners
    12. Ensure findings support or contribute to the differential diagnosis
    13. Use standard radiology department format and professional language
    14. Include pertinent negatives that are clinically significant
    15. Make contrast decisions based on clinical indication
    16. Use appropriate radiologist names and credentials
    17. Ensure study selection matches what would realistically be ordered
    18. Include emergency findings if clinically indicated by the case
    19. Provide realistic follow-up recommendations
    20. Make technical parameters appropriate for each imaging modality

    Generate comprehensive, realistic imaging studies now:
  `;
};

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'generate-imaging-studies',
    description: 'AI-powered imaging studies generation with authentic radiologist reports'
  });
} 