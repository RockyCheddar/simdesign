import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  generateCasePrompt,
  estimateGenerationTime,
  CaseGenerationRequest,
  CaseGenerationResponse
} from '@/lib/caseGenerationService';
import { GeneratedCaseData } from '@/types/caseCreation';

// Initialize Anthropic client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Server-side case generation function
const generateComprehensiveCase = async (
  request: CaseGenerationRequest
): Promise<CaseGenerationResponse> => {
  try {
    // Validate input
    if (!request.learningContext || !request.refinedObjectives || !request.parameterAnswers) {
      return {
        success: false,
        error: 'Missing required data for case generation',
        details: 'Learning context, objectives, and parameter answers are required'
      };
    }

    // Generate the prompt
    const prompt = generateCasePrompt(request);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (!response.content[0] || response.content[0].type !== 'text') {
      return {
        success: false,
        error: 'Invalid response from Claude API',
        details: 'API returned unexpected response format'
      };
    }

    // Parse the JSON response - handle markdown code blocks
    let caseData: GeneratedCaseData;
    try {
      let responseText = response.content[0].text;
      
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
      
      caseData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', response.content[0].text);
      
      return {
        success: false,
        error: 'Failed to parse AI response',
        details: `JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Response may be malformed.`
      };
    }

    // Validate the generated case structure
    const validationError = validateGeneratedCase(caseData);
    if (validationError) {
      return {
        success: false,
        error: 'Generated case validation failed',
        details: validationError
      };
    }

    return {
      success: true,
      data: caseData
    };

  } catch (error) {
    console.error('Error generating comprehensive case:', error);
    return {
      success: false,
      error: 'Case generation failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Validate generated case structure
const validateGeneratedCase = (caseData: unknown): string | null => {
  try {
    // Type guard to check if caseData is an object
    if (!caseData || typeof caseData !== 'object') {
      return 'Case data is not a valid object';
    }

    const data = caseData as Record<string, unknown>;

    // Check required top-level sections
    const requiredSections = ['overview', 'patient', 'presentation'];
    for (const section of requiredSections) {
      if (!data[section]) {
        return `Missing required section: ${section}`;
      }
    }

    // Validate overview section
    const overview = data.overview as Record<string, unknown> | undefined;
    if (!overview?.caseTitle || (typeof overview.caseTitle === 'string' && overview.caseTitle.length > 80)) {
      return 'Case title is missing or too long (max 80 characters)';
    }

    // Validate vital signs structure
    const presentation = data.presentation as Record<string, unknown> | undefined;
    const vitalSigns = presentation?.vitalSigns as Record<string, unknown> | undefined;
    if (!vitalSigns) {
      return 'Missing vital signs in presentation';
    }

    const requiredVitals = ['temperature', 'heartRate', 'bloodPressure', 'respiratoryRate', 'oxygenSaturation'];
    for (const vital of requiredVitals) {
      if (!vitalSigns[vital]) {
        return `Missing vital sign: ${vital}`;
      }
    }

    // Validate patient demographics
    const patient = data.patient as Record<string, unknown> | undefined;
    const demographics = patient?.demographics as Record<string, unknown> | undefined;
    if (!demographics?.fullName || !demographics?.age) {
      return 'Missing required patient demographics';
    }

    return null; // No validation errors
  } catch (error) {
    return `Validation error: ${error instanceof Error ? error.message : 'Unknown validation error'}`;
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { learningContext, refinedObjectives, parameterAnswers } = body;

    // Validate required fields
    if (!learningContext || !refinedObjectives || !parameterAnswers) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'learningContext, refinedObjectives, and parameterAnswers are required'
        },
        { status: 400 }
      );
    }

    // Validate refinedObjectives is an array
    if (!Array.isArray(refinedObjectives) || refinedObjectives.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid learning objectives',
          details: 'refinedObjectives must be a non-empty array'
        },
        { status: 400 }
      );
    }

    // Create the generation request
    const generationRequest: CaseGenerationRequest = {
      learningContext,
      refinedObjectives,
      parameterAnswers
    };

    // Estimate generation time for client
    const estimatedTime = estimateGenerationTime(learningContext, parameterAnswers);

    // Generate the comprehensive case
    const result = await generateComprehensiveCase(generationRequest);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Case generation failed',
          details: result.details || 'Unknown error occurred during generation'
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: result.data,
      estimatedTime,
      message: 'Case generated successfully'
    });

  } catch (error) {
    console.error('API Error - Generate Comprehensive Case:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown server error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'generate-comprehensive-case',
    description: 'AI-powered comprehensive case generation with smart defaults'
  });
} 