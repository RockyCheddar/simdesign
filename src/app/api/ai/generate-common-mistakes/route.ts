import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateCommonMistakesPrompt = (caseData: object): string => {
  return `
    You are an expert medical simulation educator. Generate common mistakes that learners typically make in this specific simulation case. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate exactly 6 common mistakes that learners at this level typically make in similar scenarios. Each mistake should be:
    - Specific to the medical condition and clinical scenario
    - Realistic and commonly observed in simulation settings
    - Appropriate for the learner experience level
    - Include actionable correction strategies
    - Cover different aspects of clinical care

    Structure your output in the following JSON format:

    {
      "mistakes": [
        {
          "mistake": "Clear description of the specific mistake learners commonly make",
          "category": "assessment|clinical_reasoning|communication|technical|safety|prioritization",
          "whyItHappens": "Brief explanation of why this mistake occurs (cognitive bias, knowledge gap, stress response, etc.)",
          "correctApproach": "What the learner should have done instead - specific and actionable",
          "preventionStrategy": "How instructors can help prevent this mistake in future scenarios - teaching tip or intervention"
        }
      ]
    }

    MISTAKE CATEGORIES:
    - assessment: Patient evaluation, vital signs interpretation, physical exam
    - clinical_reasoning: Diagnosis, treatment decisions, priority setting  
    - communication: Team communication, handoffs, patient interaction
    - technical: Procedures, equipment use, medication administration
    - safety: Patient safety, infection control, environmental hazards
    - prioritization: Task sequencing, time management, triage decisions

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Exactly 6 mistakes total
    3. Distribute across different categories when possible
    4. Make mistakes specific to the case scenario (not generic)
    5. Tailor complexity to the learner experience level from case data
    6. Focus on mistakes that actually impact patient care or learning outcomes
    7. Include both cognitive and technical errors
    8. Make prevention strategies practical for instructors
    9. Keep descriptions concise but specific
    10. Ensure mistakes are realistic and commonly observed

    Focus on mistakes that are educationally valuable to address and specific to this medical scenario.
  `;
};

export async function POST(request: NextRequest) {
  console.log('Generating common mistakes with Claude...');
  
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

    const prompt = generateCommonMistakesPrompt(caseData);

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

    // Log the raw response for debugging
    console.log('Raw Claude response (first 200 chars):', content.text.substring(0, 200));
    console.log('Raw Claude response (last 200 chars):', content.text.substring(Math.max(0, content.text.length - 200)));

    // Clean the response text by removing any markdown formatting
    let cleanedText = content.text.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned response text (first 300 chars):', cleanedText.substring(0, 300));
    console.log('Cleaned response text (last 100 chars):', cleanedText.substring(Math.max(0, cleanedText.length - 100)));

    // Parse the JSON response
    let commonMistakesData;
    try {
      commonMistakesData = JSON.parse(cleanedText);
      console.log('✅ Common mistakes JSON parsing successful');
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      commonMistakesData,
      success: true
    });

  } catch (error) {
    console.error('Error generating common mistakes:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate common mistakes'
      },
      { status: 500 }
    );
  }
} 