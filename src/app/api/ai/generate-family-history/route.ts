import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateFamilyHistoryPrompt = (caseData: object): string => {
  return `
    You are an expert healthcare provider collecting comprehensive family history. Generate detailed family medical history based on the provided case data, focusing on hereditary patterns and risk factors relevant to the patient's current presentation and overall health. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate family history data in this exact JSON structure. Keep responses concise but clinically informative:

    {
      "parents": {
        "father": "Include age (living/deceased), major medical conditions with onset ages when relevant, lifestyle factors if significant. Example: '68 years old, Hypertension (age 45), Type 2 diabetes (age 52), Former smoker (quit 15 years ago), Living'",
        "mother": "Include age (living/deceased), major medical conditions with onset ages, relevant health history. Example: '65 years old, Breast cancer (treated 2018, in remission), Osteoporosis, Regular medical care, Living'"
      },
      "siblings": {
        "brothers": "List brothers with ages and significant conditions, or 'No brothers' if none. Example: '1 brother (45) - Asthma since childhood, otherwise healthy'",
        "sisters": "List sisters with ages and significant conditions, or 'No sisters' if none. Example: '1 sister (50) - No significant medical history, regular preventive care'"
      },
      "grandparents": {
        "paternal": "Grandfather and grandmother status/health. Example: 'Grandfather deceased at 75 (stroke), Grandmother deceased at 82 (natural causes, no major illness)'",
        "maternal": "Grandfather and grandmother status/health. Example: 'Grandfather deceased at 70 (lung cancer, heavy smoker), Grandmother living at 88 (mild dementia, otherwise healthy)'"
      },
      "significantFamilyHistory": [
        "List 3-4 key family history patterns or significant findings. Examples: 'Strong cardiovascular history on paternal side', 'Cancer history on maternal line requiring enhanced screening', 'No known genetic disorders', 'Diabetes pattern suggests hereditary component'"
      ],
      "hereditaryRisks": [
        "List 2-4 specific risk factors or recommendations based on family history. Examples: 'Increased risk for cardiovascular disease - recommend lipid monitoring', 'Enhanced breast cancer screening due to maternal history', 'Diabetes monitoring advised due to paternal history', 'No significant hereditary risks identified'"
      ]
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Base family history on patient demographics, current presentation, and realistic hereditary patterns
    3. Make family history age-appropriate and realistic for the patient's age and background
    4. Include specific ages when clinically relevant (especially for onset of diseases)
    5. Consider how family history might relate to current presentation
    6. Use "No [relationship]" appropriately when family members don't exist
    7. Make hereditary risks specific and actionable for healthcare providers
    8. Include both positive family history and pertinent negatives
    9. Consider common hereditary patterns (cardiovascular, cancer, diabetes, mental health)
    10. Ensure recommendations are evidence-based and clinically appropriate
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

    const prompt = generateFamilyHistoryPrompt(caseData);

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
    let familyHistoryData;
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
      
      familyHistoryData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      familyHistoryData
    });

  } catch (error) {
    console.error('Error generating family history:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate family history'
      },
      { status: 500 }
    );
  }
} 