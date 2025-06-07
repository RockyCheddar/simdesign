import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateBriefingPrompt = (caseData: object): string => {
  return `
    You are an expert medical simulation facilitator. Generate a comprehensive 'Pre-Simulation Briefing' lesson plan based on the provided case data. Tailor content to the learner experience level and clinical context. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Structure your output in the following JSON format:

    {
      "learnerBriefingSBAR": {
        "situation": "A clear, clinical handoff statement as if coming from the previous care provider (1-2 sentences). Include patient age, gender, and primary presenting problem.",
        "background": "Essential background information for safe care: relevant medical history, medications, allergies, and how the patient arrived. Focus on details that impact immediate decision-making (2-3 sentences).",
        "assessment": "Current objective findings that learners need to know: most critical vital signs, key physical exam findings, and any diagnostic results already available. Present as if reporting to receiving team.",
        "recommendation": "Clear initial task for learners with appropriate urgency level. Example: 'Please take over care, perform your primary assessment, and initiate appropriate interventions based on your findings.'"
      },
      "keyChallenges": [
        "Identify 2-4 primary clinical, diagnostic, or procedural challenges specific to this case that match the learner experience level. Focus on real-world decision points."
      ],
      "anticipatedPitfalls": [
        "List 4-6 common mistakes, cognitive biases, or missed steps that learners at this level typically make in similar scenarios. Include both clinical and non-clinical errors."
      ],
      "primingQuestions": [
        "Generate 6-8 progressive, open-ended questions to assess baseline knowledge and prime thinking. Start broad, then narrow to case-specific issues. Examples: 'What are your initial thoughts based on this presentation?', 'What additional information would help narrow your differential?', 'What are your immediate priorities?'"
      ]
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Tailor complexity and terminology to the learner experience level from case data
    3. Make SBAR realistic as if from actual clinical handoff
    4. Ensure challenges match the case complexity and learning objectives
    5. Make questions progressive (general → specific → action-oriented)
    6. Keep content clinically accurate and educationally sound
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

    const prompt = generateBriefingPrompt(caseData);

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
    let briefingData;
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
      
      briefingData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      briefingData
    });

  } catch (error) {
    console.error('Error generating briefing:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate briefing'
      },
      { status: 500 }
    );
  }
} 