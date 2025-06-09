import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateDebriefingQuestionsPrompt = (caseData: object): string => {
  return `
    You are an expert medical simulation educator specializing in post-simulation debriefing. Generate comprehensive debriefing questions based on the provided case data. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate exactly 10 debriefing questions distributed across 5 categories (2 questions per category). Each question should be:
    - Open-ended and thought-provoking
    - Clinically relevant to the specific case
    - Appropriate for the learner level
    - Designed to facilitate meaningful discussion
    - Progressive from concrete to abstract thinking

    Structure your output in the following JSON format:

    {
      "assessmentQuestions": [
        {
          "category": "assessment",
          "question": "Open-ended question about patient assessment, recognition of problems, or identification of clinical signs",
          "followUp": "Optional follow-up question to deepen the discussion",
          "purpose": "Brief explanation of what this question aims to achieve in the debriefing"
        },
        {
          "category": "assessment", 
          "question": "Second assessment question focusing on different aspect like prioritization or systematic approach",
          "followUp": "Optional follow-up question",
          "purpose": "Purpose of this question for learning"
        }
      ],
      "clinicalReasoningQuestions": [
        {
          "category": "clinical_reasoning",
          "question": "Question about decision-making process, differential diagnosis, or treatment rationale",
          "followUp": "Optional follow-up to explore reasoning deeper",
          "purpose": "What this question aims to uncover about clinical thinking"
        },
        {
          "category": "clinical_reasoning",
          "question": "Second reasoning question about alternative approaches or critical thinking",
          "followUp": "Optional follow-up question",
          "purpose": "Learning objective for this question"
        }
      ],
      "communicationQuestions": [
        {
          "category": "communication",
          "question": "Question about team communication, handoffs, patient/family interaction, or interprofessional collaboration",
          "followUp": "Optional follow-up about communication effectiveness",
          "purpose": "Communication skill this question targets"
        },
        {
          "category": "communication",
          "question": "Second communication question focusing on different aspect like conflict resolution or leadership",
          "followUp": "Optional follow-up question",
          "purpose": "Purpose for communication development"
        }
      ],
      "reflectionQuestions": [
        {
          "category": "reflection",
          "question": "Self-reflection question about personal performance, emotions, or learning moments",
          "followUp": "Optional follow-up to encourage deeper self-awareness",
          "purpose": "Personal insight this question promotes"
        },
        {
          "category": "reflection",
          "question": "Second reflection question about growth, challenges, or confidence building",
          "followUp": "Optional follow-up question",
          "purpose": "Reflective skill this develops"
        }
      ],
      "learningQuestions": [
        {
          "category": "learning",
          "question": "Question about knowledge gaps, future learning needs, or application to real practice",
          "followUp": "Optional follow-up about specific learning goals",
          "purpose": "Learning outcome this question supports"
        },
        {
          "category": "learning",
          "question": "Second learning question about takeaways, preparation for similar cases, or system improvements",
          "followUp": "Optional follow-up question",
          "purpose": "Educational goal this question addresses"
        }
      ]
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Exactly 10 questions total (2 per category)
    3. Tailor complexity and terminology to the learner experience level from case data
    4. Make questions specific to the medical condition and clinical scenario
    5. Include both individual and team-focused questions
    6. Use the case's learning objectives to guide question focus
    7. Ensure questions flow logically from concrete observations to abstract applications
    8. Keep questions clear, concise, and professionally appropriate
    9. Include optional follow-up questions that can deepen discussion
    10. Make purpose statements educational and actionable

    Focus on creating questions that will lead to meaningful debriefing conversations specific to this case scenario.
  `;
};

export async function POST(request: NextRequest) {
  console.log('Generating debriefing questions with Claude...');
  
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

    const prompt = generateDebriefingQuestionsPrompt(caseData);

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
    let debriefingQuestionsData;
    try {
      debriefingQuestionsData = JSON.parse(cleanedText);
      console.log('✅ Debriefing questions JSON parsing successful');
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      debriefingQuestionsData,
      success: true
    });

  } catch (error) {
    console.error('Error generating debriefing questions:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate debriefing questions'
      },
      { status: 500 }
    );
  }
} 