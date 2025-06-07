import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateBackgroundPrompt = (caseData: object): string => {
  return `
    You are an expert medical scenario writer. Your task is to generate comprehensive background information for a healthcare simulation case, focusing on three key areas: narrative context, patient history summary, and pre-hospital information. This background must be clinically consistent with all provided data. Your response MUST be a single, valid JSON object.

    Here is the existing case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate content for these three specific areas:

    **1. NARRATIVE CONTEXT**: Create an engaging story of how this clinical situation developed
    **2. PATIENT HISTORY SUMMARY**: Summarize relevant background factors impacting this encounter
    **3. PRE-HOSPITAL INFORMATION**: Detail what happened before the patient arrived at the healthcare facility

    Use this exact JSON structure:

    {
      "scenarioNarrative": "Write a compelling 3-4 sentence narrative that tells the story of events leading up to this presentation. Include timeline, circumstances, what the patient was doing when symptoms began, how symptoms progressed, and what prompted seeking medical care. Make it realistic and engaging for simulation participants. Example: 'John was working his night shift as a security guard when he began experiencing crushing chest pain around 2 AM. The pain radiated to his left arm and was accompanied by nausea and diaphoresis. His coworker found him clutching his chest in the break room and immediately called 911. The pain has been constant for the past 45 minutes and is not relieved by rest.'",
      "immediateContextSummary": "**CRITICAL: First check if 'medicalHistory', 'socialHistory', or 'pastMedicalHistory' fields exist in the provided case data. If they contain information, create a 1-2 sentence summary highlighting the MOST RELEVANT points for this specific encounter. If those fields are empty/missing, generate new plausible background based on patient demographics and current presentation.** Focus on factors that directly impact current care: chronic conditions, medications, social factors, allergies, previous surgeries, family history. Example: 'Patient has a 15-year history of hypertension managed with lisinopril and is a current smoker with a 30 pack-year history. He lives alone and has no known drug allergies.'",
      "emsReport": {
        "summary": "Write a detailed paragraph about how the patient arrived at the healthcare facility. For emergency cases: include 911 dispatch details, EMS response time, initial field assessment, patient condition during transport, and any challenges encountered. For non-emergency cases: describe walk-in presentation, scheduled appointment context, or inter-facility transfer details. Include relevant environmental factors and timing.",
        "fieldVitals": { 
          "HR": "Provide heart rate with bpm (should differ slightly from admission vitals to show progression)",
          "BP": "Blood pressure as systolic/diastolic mmHg format", 
          "RR": "Respiratory rate per minute", 
          "SpO2": "Oxygen saturation percentage, include 'on room air' or oxygen delivery method",
          "temp": "Temperature in Fahrenheit with °F"
        },
        "interventions": ["Create 3-5 specific, clinically appropriate interventions performed before arrival. Examples: 'Established 18-gauge IV access in left antecubital fossa', '4L oxygen via nasal cannula administered', 'Cardiac monitor applied showing normal sinus rhythm', '12-lead ECG obtained and transmitted to receiving facility', 'Aspirin 325mg chewed and swallowed', 'Patient positioned in semi-Fowlers position for comfort'. Make interventions match the case acuity and clinical presentation."]
      }
    }

    IMPORTANT REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown, explanations, or additional text
    2. All content must be clinically accurate and consistent with provided case data
    3. Never contradict existing case information
    4. Field vitals should be realistic and slightly different from admission vitals
    5. Interventions must be appropriate for the clinical scenario and setting
    6. Make content educational and realistic for simulation training
    7. Ensure proper medical terminology and realistic timelines
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

    const prompt = generateBackgroundPrompt(caseData);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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
    let backgroundData;
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
      
      backgroundData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      backgroundData
    });

  } catch (error) {
    console.error('Error generating background:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate background'
      },
      { status: 500 }
    );
  }
} 