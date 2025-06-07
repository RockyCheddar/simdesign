import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateLaboratoryResultsPrompt = (caseData: object): string => {
  // Check for existing labs
  const existingLabs = (caseData as any)?.scenario?.labResults;
  const instruction = existingLabs && existingLabs.length > 0
    ? `Review existing labs and add 1-2 additional clinically relevant panels. Do not repeat existing tests. Existing: ${JSON.stringify(existingLabs)}`
    : `Generate comprehensive laboratory results organized into clinical panels.`;

  return `
    You are an expert clinical pathologist creating realistic lab results for medical simulation. Generate labs organized into clinical panels with proper reference ranges and age/gender-appropriate values. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    **Task:** ${instruction}

    **Clinical Panel Strategy:**
    1. **Always Include Baseline Panels:**
       - Complete Blood Count (CBC) - hematology screening for infection, anemia, bleeding
       - Comprehensive Metabolic Panel (CMP) - chemistry screening for electrolytes, kidney/liver function
    
    2. **Add Condition-Specific Panels Based on Case Presentation:**
       - Cardiac Markers (if chest pain, SOB, cardiac symptoms or history)
       - Liver Function Tests (if abdominal pain, jaundice, drug concerns, elevated enzymes)
       - Thyroid Function (if weight changes, fatigue, palpitations, metabolism concerns)
       - Inflammatory Markers (if fever, infection, inflammatory conditions suspected)
       - Coagulation Studies (if bleeding, bruising, anticoagulation therapy)
       - Lipid Panel (if cardiovascular risk factors, metabolic concerns)
       - Urinalysis (if urinary symptoms, kidney concerns, diabetes)
       - Arterial Blood Gas (if respiratory distress, acid-base concerns)

    **Reference Range Requirements:**
    - Consider patient age, gender, and demographics from case data
    - Adjust pediatric/geriatric ranges appropriately where needed
    - Use standard clinical laboratory reference ranges
    - Mark isAbnormal=true ONLY if value falls outside YOUR specified reference range
    - Make abnormal values clinically relevant to the case presentation

    **Output JSON Structure:**
    {
      "labPanels": [
        {
          "panelName": "Complete Blood Count (CBC)",
          "category": "Hematology",
          "clinicalRelevance": "Assessment of blood cells, infection, anemia, and bleeding disorders",
          "tests": [
            {
              "test": "WBC",
              "value": "8.5",
              "unit": "K/uL",
              "referenceRange": "4.0-11.0",
              "isAbnormal": false
            },
            {
              "test": "Hemoglobin",
              "value": "11.2", 
              "unit": "g/dL",
              "referenceRange": "12.0-15.5",
              "isAbnormal": true
            }
          ]
        }
      ],
      "orderingPhysician": "Realistic attending physician name",
      "collectionTime": "Realistic time (e.g., 07:30 AM)",
      "processingLab": "Hospital Laboratory or specific lab name",
      "clinicalSummary": "2-3 sentence summary highlighting key abnormal findings and their clinical significance to the case"
    }

    **Specific Panel Guidelines:**
    
    **CBC Should Include:** WBC, RBC, Hemoglobin, Hematocrit, Platelets, MCV, MCH, MCHC. Add differential (Neutrophils, Lymphocytes, etc.) if infection suspected.
    
    **CMP Should Include:** Glucose, BUN, Creatinine, Sodium, Potassium, Chloride, CO2, Calcium, Total Protein, Albumin, AST, ALT, Alkaline Phosphatase, Total Bilirubin.
    
    **Cardiac Markers:** Troponin I, CK-MB, BNP or NT-proBNP based on presentation.
    
    **Generate 3-6 panels total** - don't overwhelm but be clinically comprehensive and relevant to the case.

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Make lab values realistic and consistent with patient presentation
    3. Reference ranges must be clinically accurate and age/gender appropriate
    4. Abnormal values should correlate with the clinical picture
    5. Include both routine screening and condition-specific testing
    6. Use standard laboratory abbreviations and units
    7. Ensure clinical relevance descriptions are educational and specific
    8. Make the clinical summary actionable and case-relevant
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

    const prompt = generateLaboratoryResultsPrompt(caseData);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3500,
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
    let laboratoryResultsData;
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
      
      laboratoryResultsData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      laboratoryResultsData
    });

  } catch (error) {
    console.error('Error generating laboratory results:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate laboratory results'
      },
      { status: 500 }
    );
  }
} 