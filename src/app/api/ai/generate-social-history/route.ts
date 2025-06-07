import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateSocialHistoryPrompt = (caseData: object): string => {
  return `
    You are an expert healthcare provider collecting comprehensive social history. Generate detailed social history information based on the provided case data. Focus on concise, clinically relevant details that impact patient care. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate social history data in this exact JSON structure. Keep responses concise (1-2 words to 1 sentence max):

    {
      "familyDynamics": {
        "maritalStatus": "Single/Married/Divorced/Widowed/Partnered",
        "children": "Number and ages if relevant, or 'None'",
        "familySupport": "Strong/Moderate/Limited/Estranged",
        "significantRelationships": "Brief description of key relationships"
      },
      "workEnvironment": {
        "occupation": "Specific job title or 'Unemployed/Retired/Student/Disabled'",
        "workStatus": "Full-time/Part-time/Unemployed/Retired/On leave",
        "workStressors": "Brief description or 'None reported'",
        "occupationalHazards": "Relevant exposures or 'None identified'"
      },
      "lifestyleFactors": {
        "exercise": "Frequency and type, or 'Sedentary'",
        "diet": "General pattern like 'Balanced/Fast food/Vegetarian' etc.",
        "sleep": "Hours per night and quality",
        "stressManagement": "Coping mechanisms or 'Poor coping'"
      },
      "livingSituation": {
        "housingType": "House/Apartment/Assisted living/Homeless/Other",
        "livingArrangement": "Lives alone/With family/With roommates/Institutional",
        "housingStability": "Stable/Recent move/Unstable/Temporary",
        "accessibilityNeeds": "None/Wheelchair accessible/Other modifications"
      },
      "supportSystem": {
        "primarySupport": "Family/Friends/Partner/Professional/None",
        "emergencyContact": "Relationship to patient",
        "socialConnections": "Active/Limited/Isolated",
        "communityInvolvement": "Religious/Volunteer/Clubs or 'None'"
      },
      "substanceUse": {
        "tobacco": "Never/Former (quit date)/Current (amount per day)",
        "alcohol": "Never/Social/Daily (amount)/Dependent/Recovery",
        "illicitDrugs": "Never/Former/Current (substances)",
        "prescription": "As prescribed/Misuse/Dependent"
      }
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Base responses on patient demographics, case context, and clinical presentation
    3. Make responses realistic for the patient age, gender, and condition
    4. Keep all responses concise - maximum 1 sentence, often just 1-2 words
    5. Use "Unknown" only if truly cannot be inferred from context
    6. Make substance use patterns realistic for the patient profile
    7. Ensure family and work details are age-appropriate
    8. Consider how social factors might relate to the current presentation
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

    const prompt = generateSocialHistoryPrompt(caseData);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
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
    let socialHistoryData;
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
      
      socialHistoryData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      socialHistoryData
    });

  } catch (error) {
    console.error('Error generating social history:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate social history'
      },
      { status: 500 }
    );
  }
} 