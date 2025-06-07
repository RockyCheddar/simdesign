import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const masterPrompt = `
Extract structured medical case data from this document. Return ONLY valid JSON in the exact format below:

{{DOCUMENT_TEXT}}

Required JSON output:
{
  "title": "Case title (extract or create descriptive title)",
  "description": "2-3 sentence case summary", 
  "difficulty": "beginner|intermediate|advanced",
  "duration": 45,
  "tags": ["relevant", "medical", "keywords"],
  "learningObjectives": ["objective 1", "objective 2", "objective 3"],
  "patientInfo": {
    "name": "Patient name or 'Jane Doe'",
    "age": 0,
    "gender": "male|female|other", 
    "weight": 70,
    "height": 170,
    "allergies": ["allergy list"],
    "medications": ["medication list"],
    "medicalHistory": ["history items"],
    "chiefComplaint": "Primary complaint"
  },
  "scenario": {
    "initialPresentation": "Patient presentation details",
    "vitalSigns": {
      "bloodPressure": {"systolic": 120, "diastolic": 80},
      "heartRate": 80,
      "respiratoryRate": 16, 
      "temperature": 37.0,
      "oxygenSaturation": 98,
      "painLevel": 0
    },
    "physicalExam": {
      "general": "General appearance",
      "cardiovascular": "CV findings",
      "respiratory": "Resp findings", 
      "abdominal": "Abd findings",
      "neurological": "Neuro findings",
      "musculoskeletal": "MSK findings",
      "skin": "Skin findings"
    },
    "labResults": [],
    "imagingResults": [],
    "progressNotes": []
  },
  "inputBulk": "Any unmatched content like debrief questions, instructions, etc."
}

Rules:
- Extract all available data from document
- Use defaults where data missing  
- Put unmatched content in inputBulk
- Ensure valid JSON with correct data types
- Be thorough but concise
`;

async function getClaudeResponse(text: string) {
  try {
    const prompt = masterPrompt.replace('{{DOCUMENT_TEXT}}', text);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000, // Reduced from 4000
      temperature: 0.1, // Lower temperature for more consistent output
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        // Clean the response to ensure it's valid JSON
        let jsonText = content.text.trim();
        
        // Remove any markdown formatting if present
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        console.error('Raw response:', content.text);
        throw new Error('Invalid JSON response from Claude');
      }
    }
    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileName.endsWith('.pdf')) {
      // Use dynamic import to avoid module loading issues
      const pdf = (await import('pdf-parse')).default;
      const data = await pdf(buffer);
      return data.text;
    } else {
      throw new Error('Unsupported file type. Only .docx and .pdf files are supported.');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  // Set a timeout for the entire request
  const startTime = Date.now();
  const MAX_PROCESSING_TIME = 90000; // 90 seconds
  
  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx') && !fileName.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .docx and .pdf files are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (limit to 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`);

    // Check timeout
    if (Date.now() - startTime > MAX_PROCESSING_TIME) {
      return NextResponse.json(
        { error: 'Request timeout during file validation' },
        { status: 408 }
      );
    }

    // Extract text from the file
    const originalText = await extractTextFromFile(file);
    
    if (!originalText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      );
    }

    console.log(`Extracted ${originalText.length} characters from file`);

    // Check timeout before AI processing
    if (Date.now() - startTime > MAX_PROCESSING_TIME) {
      return NextResponse.json(
        { error: 'Request timeout during text extraction' },
        { status: 408 }
      );
    }

    // Limit text length to prevent very long processing times
    const maxTextLength = 50000; // 50k characters
    const textToProcess = originalText.length > maxTextLength 
      ? originalText.substring(0, maxTextLength) + '\n\n[Text truncated due to length]'
      : originalText;

    // Send to Claude for processing with timeout protection
    const parsedData = await Promise.race([
      getClaudeResponse(textToProcess),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI processing timeout')), 60000) // 60 second timeout for AI
      )
    ]);

    console.log('Successfully processed document with Claude');

    // Final timeout check
    if (Date.now() - startTime > MAX_PROCESSING_TIME) {
      return NextResponse.json(
        { error: 'Request timeout during response preparation' },
        { status: 408 }
      );
    }

    return NextResponse.json({
      originalText,
      parsedData,
    });

  } catch (error) {
    console.error('Error processing document:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return NextResponse.json(
          { error: 'Processing timeout. Please try with a smaller document or try again later.' },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the document' },
      { status: 500 }
    );
  }
} 