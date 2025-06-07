import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateClinicalNarrativePrompt = (caseData: object): string => {
  return `
    You are an expert emergency medicine physician and clinical documentation specialist. Generate realistic clinical narrative and notes that follow proper medical documentation standards. Create a comprehensive clinical story that shows the patient's journey from pre-hospital through initial hospital evaluation. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate clinical narrative and notes in this exact JSON structure. Use proper medical terminology and realistic clinical flow:

    {
      "preHospitalReport": {
        "emsUnit": "Realistic EMS unit designation (e.g., 'Medic 12', 'Rescue 7')",
        "responseTime": "Time format HH:MM",
        "chiefComplaint": "Brief EMS chief complaint",
        "narrative": "Detailed EMS narrative using proper EMS documentation style. Include circumstances of call, patient found condition, interventions attempted, patient response. 3-4 sentences.",
        "fieldVitals": "EMS vital signs in standard format: 'BP X/X, HR X, RR X, O2 X% on RA/NC'",
        "interventions": ["List 2-4 pre-hospital interventions performed", "Use standard EMS abbreviations and procedures"],
        "transportTime": "Transport duration (e.g., '12 minutes', '8 minutes')"
      },
      "initialEncounterNote": {
        "physician": "Realistic physician name with credentials (e.g., 'Dr. Sarah Chen, MD')",
        "department": "Emergency Medicine or appropriate department",
        "timestamp": "Hospital arrival time in HH:MM format",
        "chiefComplaint": "Patient's chief complaint in their words",
        "hpi": "HISTORY OF PRESENT ILLNESS: Formal HPI using proper medical documentation format. Include onset, location, duration, character, alleviating/aggravating factors, radiation, timing, severity. 4-6 sentences using medical terminology.",
        "reviewOfSystems": "REVIEW OF SYSTEMS: Brief pertinent positives and negatives relevant to chief complaint. 2-3 sentences.",
        "physicalExam": "PHYSICAL EXAMINATION: Brief focused exam findings relevant to presentation. Use standard abbreviations and format.",
        "assessment": "ASSESSMENT: Clinical impression with differential diagnosis. Use medical terminology.",
        "plan": "PLAN: Numbered list of diagnostic and therapeutic interventions. 4-6 items using standard medical abbreviations."
      },
      "progressNotes": [
        {
          "timestamp": "Time 30-60 minutes after initial encounter",
          "author": "Realistic healthcare provider name and credentials",
          "department": "Emergency or appropriate department",
          "type": "nursing",
          "note": "Brief nursing assessment note. Include patient status, vital signs if changed, interventions, response. 1-2 sentences using nursing documentation style."
        },
        {
          "timestamp": "Time 60-120 minutes after initial encounter", 
          "author": "Different healthcare provider name and credentials",
          "department": "Appropriate specialty if consult, otherwise same department",
          "type": "physician" or "consultation" or "procedure",
          "note": "Clinical update, test results, change in condition, or specialist consultation. Use appropriate medical documentation style. 2-3 sentences."
        },
        {
          "timestamp": "Time 90-180 minutes after initial encounter",
          "author": "Another healthcare provider",
          "department": "Appropriate department",
          "type": "nursing" or "physician",
          "note": "Additional clinical update showing progression of care. 1-2 sentences."
        }
      ],
      "clinicalSummary": "Brief 2-3 sentence summary of the clinical course and current status. Highlight key findings and next steps."
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Base all documentation on the provided case data and patient presentation
    3. Use realistic medical abbreviations and terminology throughout
    4. Make timeline progression logical and realistic (30-180 minutes total)
    5. Include appropriate vital sign changes and clinical responses
    6. Make interventions and assessments consistent with the case presentation
    7. Use proper medical documentation formatting and style
    8. Include both objective findings and clinical reasoning
    9. Make progress notes show realistic evolution of care
    10. Ensure all timestamps follow logical chronological order
    11. Make provider names diverse and realistic
    12. Use standard medical department names
    13. Include appropriate level of medical detail for simulation education
    14. Make EMS documentation style authentic to pre-hospital care
    15. Ensure initial encounter note follows proper admission note format
  `;
};

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

    const prompt = generateClinicalNarrativePrompt(caseData);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
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
    let clinicalNarrativeData;
    try {
      let responseText = content.text;
      
      console.log('Raw Claude response (first 200 chars):', responseText.substring(0, 200));
      console.log('Raw Claude response (last 200 chars):', responseText.substring(responseText.length - 200));
      
      // More robust markdown code block removal
      if (responseText.includes('```')) {
        // Find the first occurrence of ```json or ``` and remove everything before it
        const jsonStart = responseText.indexOf('```json');
        const codeStart = responseText.indexOf('```');
        
        if (jsonStart !== -1) {
          responseText = responseText.substring(jsonStart + 7); // Remove ```json
        } else if (codeStart !== -1) {
          responseText = responseText.substring(codeStart + 3); // Remove ```
        }
        
        // Find the last occurrence of ``` and remove everything after it
        const lastCodeBlock = responseText.lastIndexOf('```');
        if (lastCodeBlock !== -1) {
          responseText = responseText.substring(0, lastCodeBlock);
        }
      }
      
      // Clean up any extra whitespace and newlines
      responseText = responseText.trim();
      
      // Remove any leading/trailing text that's not JSON
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
      }
      
      console.log('Cleaned response text (first 300 chars):', responseText.substring(0, 300));
      console.log('Cleaned response text (last 100 chars):', responseText.substring(responseText.length - 100));
      
      clinicalNarrativeData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      clinicalNarrativeData
    });

  } catch (error) {
    console.error('Error generating clinical narrative:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate clinical narrative'
      },
      { status: 500 }
    );
  }
} 