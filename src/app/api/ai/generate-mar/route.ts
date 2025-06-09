import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateMARPrompt = (caseData: object): string => {
  return `
    You are an expert clinical pharmacist and nursing educator. Generate a realistic Medication Administration Record (MAR) for a healthcare simulation case. This will show an 8-hour medication timeline with both scheduled and PRN medications. Your response MUST be a single, valid JSON object.

    Case Data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Create a MAR that shows:
    1. **Current simulation time** and **8-hour window** around it
    2. **Scheduled medications** with administration status
    3. **PRN medications** with availability status

    Use this exact JSON structure:

    {
      "currentTime": "09:30",
      "timeWindow": ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
      "scheduledMedications": [
        {
          "name": "Medication name (e.g., 'Lisinopril')",
          "dose": "Dose with units (e.g., '10 mg')",
          "route": "Route (e.g., 'PO', 'IV', 'IM', 'Inhaled')",
          "frequency": "Schedule (e.g., 'daily', 'BID', 'TID', 'q6h')",
          "indication": "Clinical reason (e.g., 'Hypertension', 'Pain management')",
          "administrations": [
            {
              "time": "09:00",
              "status": "due/given/overdue/held",
              "actualTime": "09:05",
              "reason": "Reason if held (e.g., 'Patient NPO', 'BP too low')"
            }
          ]
        }
      ],
      "prnMedications": [
        {
          "name": "PRN medication name",
          "dose": "Dose with units",
          "route": "Route",
          "indication": "When to use (e.g., 'Pain >5/10', 'Nausea', 'Anxiety')",
          "lastGiven": "07:30",
          "nextAvailable": "11:30",
          "recentAdministrations": [
            {
              "time": "07:30",
              "reason": "Patient reported pain 7/10"
            }
          ]
        }
      ]
    }

    **Status Definitions:**
    - **given**: Already administered (show actual time)
    - **due**: Scheduled for current time or within 30 min
    - **overdue**: Scheduled time has passed without administration
    - **held**: Intentionally not given (provide reason)

    **MAR Requirements:**
    1. Include patient's home medications + any acute treatment medications
    2. Create realistic administration history for past hours
    3. Show 2-4 scheduled medications maximum
    4. Include 1-3 relevant PRN medications
    5. Make current time within the case timeframe
    6. Create educational scenarios (missed dose, held medication, etc.)
    7. Ensure medication timing aligns with typical nursing schedules
    8. Consider patient condition when determining held medications

    **Important:**
    - Response MUST be valid JSON only
    - Include realistic medication names appropriate for the patient
    - Time format: "HH:MM" (24-hour)
    - Create clinically relevant scenarios for learning
    - Ensure PRN timing restrictions are realistic (e.g., q4h, q6h)
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

    const prompt = generateMARPrompt(caseData);

    console.log('Generating MAR with Claude...');

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

    // Parse the JSON response
    let marData;
    try {
      let responseText = content.text;
      
      console.log('Raw Claude response (first 200 chars):', responseText.substring(0, 200));
      console.log('Raw Claude response (last 200 chars):', responseText.substring(responseText.length - 200));
      
      // Clean markdown code blocks
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
      
      // Extract JSON content
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
      }
      
      console.log('Cleaned response text (first 300 chars):', responseText.substring(0, 300));
      console.log('Cleaned response text (last 100 chars):', responseText.substring(responseText.length - 100));
      
      marData = JSON.parse(responseText);
      console.log('✅ MAR JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ MAR JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response (first 500 chars):', content.text.substring(0, 500));
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      marData
    });

  } catch (error) {
    console.error('Error generating MAR:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate MAR'
      },
      { status: 500 }
    );
  }
} 