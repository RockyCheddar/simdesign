import { LearningContext } from '@/types/caseCreation';

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface RefinedObjective {
  original: string;
  refined: string;
  explanation: string;
  accepted: boolean;
}

export interface ObjectiveRefinementResponse {
  refinedObjectives: RefinedObjective[];
  generalFeedback: string;
}

/**
 * Call Claude API with proper error handling
 */
export async function callClaude(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Unknown error occurred',
      };
    }

    return {
      success: true,
      content: data.content,
      usage: data.usage,
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Generate prompt for learning objectives refinement
 */
export function createObjectiveRefinementPrompt(
  learningContext: Partial<LearningContext>,
  objectives: string[]
): string {
  const targetLearners = learningContext.targetLearners || 'healthcare learners';
  const experienceLevel = learningContext.experienceLevel || 'intermediate';
  const clinicalDomain = learningContext.clinicalDomain || 'general healthcare';
  const duration = learningContext.duration || 30;
  const participantCount = learningContext.participantCount || 4;

  return `As a medical education expert specializing in simulation-based learning, refine these learning objectives for a healthcare simulation case.

Context:
- Target Learners: ${formatTargetLearners(targetLearners)}
- Experience Level: ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
- Clinical Domain: ${formatClinicalDomain(clinicalDomain)}
- Duration: ${duration} minutes
- Participant Count: ${participantCount}

Original Objectives:
${objectives.map((obj, index) => `${index + 1}. ${obj}`).join('\n')}

For each objective, ensure it:
- Uses appropriate action verbs (demonstrate, assess, manage, communicate, analyze, evaluate)
- Is specific, measurable, and achievable within the given timeframe
- Aligns with simulation-based healthcare education competencies
- Is appropriate for the target learner level and clinical domain
- Focuses on observable outcomes and behaviors

Please respond in the following JSON format:
{
  "refinedObjectives": [
    {
      "original": "original objective text",
      "refined": "improved objective text",
      "explanation": "brief explanation of changes made"
    }
  ],
  "generalFeedback": "overall feedback about the objectives and simulation design"
}

IMPORTANT: 
- Ensure your response is valid JSON with no control characters
- Escape any quotes, newlines, or special characters within string values
- Do not include any text before or after the JSON object
- Include all original objectives with their refinements`;
}

/**
 * Parse Claude's response for objective refinement
 */
export function parseObjectiveRefinementResponse(content: string): ObjectiveRefinementResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    let jsonString = jsonMatch[0];
    
    // Clean control characters that can break JSON parsing
    // But preserve valid JSON escape sequences
    jsonString = jsonString
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control chars except \t, \n, \r
      .replace(/\u0000/g, '') // Remove null characters
      .replace(/\u0008/g, '') // Remove backspace
      .replace(/\u000B/g, '') // Remove vertical tab
      .replace(/\u000C/g, '') // Remove form feed
      .replace(/\u000E/g, '') // Remove shift out
      .replace(/\u000F/g, ''); // Remove shift in

    // Try parsing with multiple fallback strategies
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (firstError) {
      console.warn('First JSON parse attempt failed, trying with additional cleaning:', firstError);
      
      try {
        // Second attempt: more aggressive cleaning
        const cleanedString = jsonString
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
            // Keep valid JSON escape characters
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return ''; // Remove other control characters
          })
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();
        
        parsed = JSON.parse(cleanedString);
      } catch (secondError) {
        console.warn('Second JSON parse attempt failed, trying manual reconstruction:', secondError);
        
        // Third attempt: try to manually fix common issues
        const manuallyFixed = jsonString
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Replace all control chars with spaces
          .replace(/\s+/g, ' ') // Collapse spaces
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .trim();
        
        parsed = JSON.parse(manuallyFixed);
      }
    }
    
    // Validate the structure
    if (!parsed.refinedObjectives || !Array.isArray(parsed.refinedObjectives)) {
      throw new Error('Invalid response structure');
    }

    // Ensure all objectives have required fields
    const refinedObjectives = parsed.refinedObjectives.map((obj: { original?: string; refined?: string; explanation?: string }) => ({
      original: obj.original || '',
      refined: obj.refined || obj.original || '',
      explanation: obj.explanation || 'No explanation provided',
      accepted: false, // Default to not accepted
    }));

    return {
      refinedObjectives,
      generalFeedback: parsed.generalFeedback || 'No general feedback provided',
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Raw content:', content);
    
    // Fallback: return original objectives if parsing fails
    return {
      refinedObjectives: [],
      generalFeedback: 'Unable to parse AI response. Please try again.',
    };
  }
}

/**
 * Refine learning objectives using AI
 */
export async function refineObjectives(
  learningContext: Partial<LearningContext>,
  objectives: string[]
): Promise<{
  success: boolean;
  data?: ObjectiveRefinementResponse;
  error?: string;
}> {
  if (!objectives.length) {
    return {
      success: false,
      error: 'No objectives provided for refinement',
    };
  }

  const prompt = createObjectiveRefinementPrompt(learningContext, objectives);
  const response = await callClaude(prompt, {
    maxTokens: 3000,
    temperature: 0.3, // Lower temperature for more consistent formatting
  });

  if (!response.success) {
    return {
      success: false,
      error: response.error,
    };
  }

  const parsedData = parseObjectiveRefinementResponse(response.content || '');
  
  if (!parsedData.refinedObjectives.length) {
    return {
      success: false,
      error: 'Failed to parse AI response. Please try again.',
    };
  }

  return {
    success: true,
    data: parsedData,
  };
}

/**
 * Format target learners for display
 */
function formatTargetLearners(targetLearners: string): string {
  const mapping: Record<string, string> = {
    'nursing-students': 'Nursing Students',
    'medical-students': 'Medical Students',
    'residents': 'Residents',
    'practicing-nurses': 'Practicing Nurses',
    'interdisciplinary-team': 'Interdisciplinary Team',
    'other': 'Other Healthcare Professionals',
  };
  
  return mapping[targetLearners] || targetLearners;
}

/**
 * Format clinical domain for display
 */
function formatClinicalDomain(clinicalDomain: string): string {
  const mapping: Record<string, string> = {
    'emergency-department': 'Emergency Department',
    'icu': 'Intensive Care Unit (ICU)',
    'medical-surgical': 'Medical-Surgical',
    'operating-room': 'Operating Room',
    'pediatrics': 'Pediatrics',
    'obstetrics': 'Obstetrics',
    'mental-health': 'Mental Health',
    'community-health': 'Community Health',
    'other': 'Other Clinical Domain',
  };
  
  return mapping[clinicalDomain] || clinicalDomain;
}

/**
 * Validate API key configuration
 */
export async function validateAIConfiguration(): Promise<boolean> {
  try {
    const response = await fetch('/api/ai/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Test connection',
        maxTokens: 10,
      }),
    });

    return response.status !== 500; // 500 indicates missing API key
  } catch {
    return false;
  }
} 