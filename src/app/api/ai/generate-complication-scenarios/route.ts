import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateComplicationScenariosPrompt = (caseData: object): string => {
  return `
    You are an expert medical educator specializing in complication management and emergency protocols. Your task is to generate comprehensive complication scenarios for a healthcare simulation case, organized into immediate complications, delayed complications, and emergency protocols. This content must be clinically accurate and educationally valuable for simulation training. Your response MUST be a single, valid JSON object.

    Here is the existing case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate content for these three specific categories:

    **1. IMMEDIATE COMPLICATIONS**: Complications that could occur within 0-2 hours of presentation
    **2. DELAYED COMPLICATIONS**: Complications that could occur 2+ hours after presentation or during extended care
    **3. EMERGENCY PROTOCOLS**: Critical scenarios requiring immediate action and escalation procedures

    Use this exact JSON structure:

    {
      "immediateComplications": [
        {
          "name": "Specific complication name (e.g., 'Respiratory Failure', 'Anaphylactic Shock', 'Septic Shock')",
          "likelihood": "high/moderate/low (based on patient's condition and risk factors)",
          "timeframe": "Specific timeframe when this could occur (e.g., '15-30 minutes', 'Within 1 hour')",
          "description": "2-3 sentence clinical description of how this complication manifests and why it occurs in this specific case context. Include pathophysiology relevant to the current presentation.",
          "earlyWarnings": ["Specific, observable warning sign 1", "Specific, observable warning sign 2", "Specific, observable warning sign 3", "Include vital sign changes, physical exam findings, and patient symptoms"],
          "management": ["Immediate intervention 1", "Immediate intervention 2", "Immediate intervention 3", "Include specific medications with dosages, procedures, and monitoring requirements"]
        }
      ],
      "delayedComplications": [
        {
          "name": "Delayed complication name relevant to this case",
          "likelihood": "high/moderate/low",
          "timeframe": "When this typically occurs (e.g., '6-12 hours', '24-48 hours', 'Days 2-5')",
          "description": "Clinical description of delayed complication development and progression specific to this case",
          "earlyWarnings": ["Early warning sign 1", "Early warning sign 2", "Early warning sign 3", "Include subtle changes that could be missed"],
          "management": ["Management intervention 1", "Management intervention 2", "Management intervention 3", "Include prevention strategies and ongoing monitoring"]
        }
      ],
      "emergencyProtocols": [
        {
          "scenario": "Critical emergency scenario name (e.g., 'Cardiac Arrest', 'Severe Respiratory Distress', 'Hemodynamic Collapse')",
          "triggerSigns": ["Specific trigger sign 1", "Specific trigger sign 2", "Include exact vital sign thresholds and clinical findings that warrant immediate action"],
          "immediateActions": ["First immediate action", "Second immediate action", "Third immediate action", "Include step-by-step ACLS/PALS protocols, medication orders, and procedures"],
          "escalationCriteria": ["When to call rapid response", "When to call physician", "When to transfer to higher level of care", "Include specific decision points and communication requirements"]
        }
      ]
    }

    CLINICAL GUIDELINES:
    1. Generate 2-3 immediate complications most relevant to this case presentation
    2. Generate 2-3 delayed complications that could realistically occur
    3. Generate 2-3 emergency protocols covering the most critical scenarios
    4. Base likelihood assessments on patient's specific risk factors and condition
    5. Include realistic timeframes based on clinical progression patterns
    6. Provide specific, actionable early warning signs that nurses can identify
    7. Include evidence-based management interventions with appropriate detail
    8. Make emergency protocols follow standard healthcare protocols (ACLS, PALS, etc.)
    9. Ensure all content is appropriate for the patient's age, condition, and clinical setting
    10. Use proper medical terminology while remaining educational

    IMPORTANT REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown, explanations, or additional text
    2. All complications must be clinically plausible for this specific case
    3. Early warning signs must be specific and observable
    4. Management interventions must be evidence-based and realistic
    5. Emergency protocols must follow standard medical guidelines
    6. Likelihood assessments should reflect actual clinical risk factors
    7. Timeframes must be medically accurate for the complications described
    8. Content must be educationally valuable for simulation training
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

    const prompt = generateComplicationScenariosPrompt(caseData);

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
    let complicationData;
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
      
      complicationData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      complicationData
    });

  } catch (error) {
    console.error('Error generating complication scenarios:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate complication scenarios'
      },
      { status: 500 }
    );
  }
} 