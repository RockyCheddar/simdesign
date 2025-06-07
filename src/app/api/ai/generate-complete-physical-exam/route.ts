import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const generateCompletePhysicalExamPrompt = (caseData: object): string => {
  return `
    You are an expert healthcare provider conducting a comprehensive systematic physical examination. Generate detailed physical examination findings based on the provided case data, ensuring findings are realistic, clinically relevant, and align with any existing physical exam findings already documented. Your response MUST be a single, valid JSON object.

    Here is the case data:
    \`\`\`json
    ${JSON.stringify(caseData, null, 2)}
    \`\`\`

    Generate complete physical examination data in this exact JSON structure. Make findings realistic and relevant to the case:

    {
      "generalAppearance": {
        "overallAppearance": "Overall patient appearance and demeanor. Example: 'Well-appearing, alert, oriented x3, in no acute distress'",
        "posture": "Patient positioning and posture. Example: 'Sitting upright comfortably'",
        "hygiene": "Personal hygiene assessment. Example: 'Good personal hygiene and grooming'",
        "speechPattern": "Speech characteristics. Example: 'Clear, coherent speech at normal pace'"
      },
      "heent": {
        "head": "Head examination findings. Example: 'Normocephalic, atraumatic, no visible deformities'",
        "eyes": "Eye examination findings. Example: 'PERRL, EOMI, no scleral icterus, conjunctivae clear'",
        "ears": "Ear examination findings. Example: 'External auditory canals clear, TMs intact bilaterally'",
        "nose": "Nasal examination findings. Example: 'Nares patent, no discharge or congestion'",
        "throat": "Throat and oral examination. Example: 'Oropharynx clear, no erythema or exudate, teeth in good repair'"
      },
      "neck": {
        "inspection": "Visual neck examination. Example: 'No visible masses, deformities, or scars'",
        "palpation": "Neck palpation findings. Example: 'Supple, no lymphadenopathy or masses'",
        "thyroid": "Thyroid examination. Example: 'Non-palpable, no enlargement or nodules'",
        "jugularVeins": "JVP assessment. Example: 'JVP not elevated, normal venous pulsations'"
      },
      "cardiovascular": {
        "inspection": "Cardiac inspection. Example: 'No visible heaves, lifts, or deformities'",
        "palpation": "Cardiac palpation. Example: 'PMI at 5th ICS, MCL, no thrills or heaves'",
        "auscultation": "Heart sounds. Example: 'RRR, S1/S2 normal, no murmurs, rubs, or gallops'",
        "peripheralPulses": "Pulse examination. Example: '2+ bilaterally in radial, brachial, dorsalis pedis, posterior tibial'"
      },
      "respiratory": {
        "inspection": "Chest inspection. Example: 'Symmetric chest expansion, no use of accessory muscles, no deformities'",
        "palpation": "Chest palpation. Example: 'No tactile fremitus abnormalities, equal expansion'",
        "percussion": "Chest percussion. Example: 'Resonant throughout all lung fields'",
        "auscultation": "Lung sounds. Example: 'Clear to auscultation bilaterally, no wheezes, rales, or rhonchi'"
      },
      "abdomen": {
        "inspection": "Abdominal inspection. Example: 'Soft, non-distended, no visible masses or scars'",
        "auscultation": "Bowel sounds. Example: 'Normal bowel sounds in all four quadrants'",
        "palpation": "Abdominal palpation. Example: 'Soft, non-tender, no organomegaly or masses'",
        "percussion": "Abdominal percussion. Example: 'Tympanic, liver span 8-10cm at MCL'"
      },
      "musculoskeletal": {
        "gait": "Gait assessment. Example: 'Steady, normal gait pattern, no limping or instability'",
        "range": "Range of motion. Example: 'Full range of motion in all major joints'",
        "strength": "Muscle strength. Example: '5/5 strength in upper and lower extremities bilaterally'",
        "deformities": "Deformities or abnormalities. Example: 'No obvious deformities, swelling, or joint abnormalities'"
      },
      "neurological": {
        "mentalStatus": "Mental status exam. Example: 'Alert, oriented x3 (person, place, time), appropriate mood and affect'",
        "cranialNerves": "Cranial nerve assessment. Example: 'CN II-XII grossly intact on screening examination'",
        "motorExam": "Motor examination. Example: '5/5 strength throughout, normal muscle tone and bulk'",
        "sensoryExam": "Sensory testing. Example: 'Intact to light touch, vibration, and position sense'",
        "reflexes": "Deep tendon reflexes. Example: '2+ DTRs bilaterally in biceps, triceps, patellar, Achilles'",
        "coordination": "Coordination testing. Example: 'Finger-to-nose and heel-to-shin testing intact bilaterally'"
      },
      "skin": {
        "color": "Skin color and perfusion. Example: 'Normal skin color, good capillary refill <2 seconds'",
        "texture": "Skin texture and temperature. Example: 'Warm, dry, intact throughout'",
        "lesions": "Skin lesions or abnormalities. Example: 'No rashes, lesions, or unusual pigmentation noted'",
        "turgor": "Skin turgor assessment. Example: 'Good skin turgor, no tenting'"
      },
      "keyAbnormalFindings": [
        "List any significant abnormal findings that stand out and relate to the case presentation",
        "Include clinical correlations to current symptoms or chief complaint",
        "Use 'No significant abnormal findings noted' if examination is normal"
      ],
      "clinicalSummary": "Brief 2-3 sentence summary of overall physical exam findings and their clinical significance in context of the case"
    }

    REQUIREMENTS:
    1. Response must be ONLY the JSON object - no markdown or additional text
    2. Ensure findings are consistent with any existing physical exam findings in the case data
    3. Make abnormal findings clinically relevant to the patient's presentation and chief complaint
    4. Use proper medical terminology and standard physical examination language
    5. Include both normal findings (to show thorough examination) and any relevant abnormalities
    6. Make findings age-appropriate and realistic for the patient demographics
    7. Consider how physical findings might relate to the patient's current condition
    8. Use standard medical abbreviations appropriately (PERRL, EOMI, RRR, etc.)
    9. Ensure findings are specific enough to be educationally valuable
    10. Include pertinent negatives that are clinically significant for the case
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

    const prompt = generateCompletePhysicalExamPrompt(caseData);

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
    let completePhysicalExamData;
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
      
      completePhysicalExamData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed');
      console.error('Parse error:', parseError);
      console.error('Full raw response:', content.text);
      throw new Error('AI response was not valid JSON format');
    }

    return NextResponse.json({
      completePhysicalExamData
    });

  } catch (error) {
    console.error('Error generating complete physical exam:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate complete physical exam'
      },
      { status: 500 }
    );
  }
} 