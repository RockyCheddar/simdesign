import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generatePastMedicalHistoryPrompt = (caseData: object): string => {
  return `
    You are an expert healthcare provider collecting comprehensive past medical history. Generate detailed medical history information based on the provided case data. Focus on clinically relevant past conditions that may impact current care. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate past medical history data in this exact JSON structure. Keep responses concise but clinically specific:

    {
      "chronicConditions": [
        "List ongoing medical conditions that require management. Examples: 'Hypertension (diagnosed 2015)', 'Type 2 diabetes mellitus', 'Asthma', 'None' if no chronic conditions"
      ],
      "previousSurgeries": [
        "List past surgical procedures with approximate dates. Examples: 'Appendectomy (2018)', 'Cholecystectomy (laparoscopic, 2020)', 'None' if no surgeries"
      ],
      "previousHospitalizations": [
        "List significant hospitalizations with reason and year. Examples: 'Pneumonia (2019)', 'Myocardial infarction (2021)', 'None' if no hospitalizations"
      ],
      "significantIllnesses": [
        "List major past illnesses that have resolved but may be relevant. Examples: 'COVID-19 (2022)', 'Hepatitis A (childhood)', 'None' if no significant illnesses"
      ],
      "allergies": {
        "medications": "List medication allergies with reactions, or 'NKDA' if no known drug allergies",
        "environmental": "List environmental allergies or 'None known'",
        "food": "List food allergies or 'None known'"
      },
      "immunizations": {
        "status": "Current/Up to date/Behind/Unknown",
        "recent": "List recent immunizations like 'COVID-19 booster (2023)', 'Influenza (annual)' or 'None documented'"
      },
      
      "mentalHealthHistory": {
        "conditions": "Past or current mental health diagnoses or 'None documented'",
        "medications": "Psychiatric medications or 'None'",
        "hospitalizations": "Mental health hospitalizations or 'None'"
      }
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Base responses on patient demographics, current presentation, and case context
    3. Make past medical history realistic for the patient age, gender, and current condition
    4. Include dates when clinically relevant (approximate years are fine)
    5. Consider how past conditions might relate to current presentation
    6. Use "None" or "NKDA" appropriately for negative findings
    7. Make chronic conditions age-appropriate (don't give a 25-year-old 20-year diabetes history)
    8. Include 2-5 items per array unless truly none exist
    9. Make allergies realistic and clinically relevant
    10. Ensure mental health history is handled sensitively and appropriately
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

    const prompt = generatePastMedicalHistoryPrompt(caseData);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
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
    let pastMedicalHistoryData;
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
      
      pastMedicalHistoryData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      pastMedicalHistoryData
    });

  } catch (error) {
    console.error('Error generating past medical history:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate past medical history'
      },
      { status: 500 }
    );
  }
} 