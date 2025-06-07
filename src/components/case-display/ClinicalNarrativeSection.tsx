import React, { useState } from 'react';
import InfoCard from './components/InfoCard';

interface ProgressNote {
  timestamp: string;
  author: string;
  department: string;
  type: string;
  note: string;
}

interface PreHospitalReport {
  emsUnit: string;
  responseTime: string;
  chiefComplaint: string;
  narrative: string;
  fieldVitals: string;
  interventions: string[];
  transportTime: string;
}

interface InitialEncounterNote {
  physician: string;
  department: string;
  timestamp: string;
  chiefComplaint: string;
  hpi: string;
  reviewOfSystems: string;
  physicalExam: string;
  assessment: string;
  plan: string;
}

interface ClinicalNarrativeData {
  preHospitalReport: PreHospitalReport;
  initialEncounterNote: InitialEncounterNote;
  progressNotes: ProgressNote[];
  clinicalSummary: string;
}

interface ClinicalNarrativeSectionProps {
  data?: ClinicalNarrativeData;
  isGenerating: boolean;
  onGenerate: () => void;
  onDataUpdate?: (updatedData: ClinicalNarrativeData) => void;
}

const ClinicalNarrativeSection: React.FC<ClinicalNarrativeSectionProps> = ({
  data,
  isGenerating,
  onGenerate,
  onDataUpdate,
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'pre-hospital': false,
    'initial-encounter': false,
    'progress-notes': false
  });
  
  const [subGeneratorStates, setSubGeneratorStates] = useState({
    progressNote: false,
    specialistConsult: false,
    nursingAssessment: false,
    procedureNote: false
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const addProgressNote = async () => {
    if (!data || !onDataUpdate) return;
    
    setSubGeneratorStates(prev => ({ ...prev, progressNote: true }));
    try {
      const response = await fetch('/api/ai/generate-progress-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caseData: data, 
          existingNotes: data.progressNotes 
        })
      });
      
      if (response.ok) {
        const { progressNoteData } = await response.json();
        const updatedData = {
          ...data,
          progressNotes: [...data.progressNotes, progressNoteData]
        };
        onDataUpdate(updatedData);
      }
    } catch (error) {
      console.error('Error generating progress note:', error);
    } finally {
      setSubGeneratorStates(prev => ({ ...prev, progressNote: false }));
    }
  };

  const addSpecialistConsult = async () => {
    if (!data || !onDataUpdate) return;
    
    setSubGeneratorStates(prev => ({ ...prev, specialistConsult: true }));
    try {
      const response = await fetch('/api/ai/generate-specialist-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caseData: data, 
          existingNotes: data.progressNotes 
        })
      });
      
      if (response.ok) {
        const { specialistConsultData } = await response.json();
        const updatedData = {
          ...data,
          progressNotes: [...data.progressNotes, specialistConsultData]
        };
        onDataUpdate(updatedData);
      }
    } catch (error) {
      console.error('Error generating specialist consult:', error);
    } finally {
      setSubGeneratorStates(prev => ({ ...prev, specialistConsult: false }));
    }
  };

  const addNursingAssessment = async () => {
    if (!data || !onDataUpdate) return;
    
    setSubGeneratorStates(prev => ({ ...prev, nursingAssessment: true }));
    try {
      const response = await fetch('/api/ai/generate-nursing-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caseData: data, 
          existingNotes: data.progressNotes 
        })
      });
      
      if (response.ok) {
        const { nursingAssessmentData } = await response.json();
        const updatedData = {
          ...data,
          progressNotes: [...data.progressNotes, nursingAssessmentData]
        };
        onDataUpdate(updatedData);
      }
    } catch (error) {
      console.error('Error generating nursing assessment:', error);
    } finally {
      setSubGeneratorStates(prev => ({ ...prev, nursingAssessment: false }));
    }
  };

  const addProcedureNote = async () => {
    if (!data || !onDataUpdate) return;
    
    setSubGeneratorStates(prev => ({ ...prev, procedureNote: true }));
    try {
      const response = await fetch('/api/ai/generate-procedure-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caseData: data, 
          existingNotes: data.progressNotes 
        })
      });
      
      if (response.ok) {
        const { procedureNoteData } = await response.json();
        const updatedData = {
          ...data,
          progressNotes: [...data.progressNotes, procedureNoteData]
        };
        onDataUpdate(updatedData);
      }
    } catch (error) {
      console.error('Error generating procedure note:', error);
    } finally {
      setSubGeneratorStates(prev => ({ ...prev, procedureNote: false }));
    }
  };

  const CollapsibleSection: React.FC<{
    title: string;
    sectionKey: string;
    children: React.ReactNode;
    badge?: string;
    icon?: string;
  }> = ({ title, sectionKey, children, badge, icon }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="border border-gray-200 rounded-lg mb-4 bg-white shadow-sm">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-150 flex items-center justify-between rounded-t-lg border-b border-gray-200"
          aria-expanded={isExpanded}
          aria-controls={`section-${sectionKey}`}
        >
          <div className="flex items-center space-x-3">
            {icon && <span className="text-lg">{icon}</span>}
            <span className="font-semibold text-gray-900 text-left">{title}</span>
            {badge && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {isExpanded ? (
            <span className="text-gray-500">▼</span>
          ) : (
            <span className="text-gray-500">▶</span>
          )}
        </button>
        {isExpanded && (
          <div id={`section-${sectionKey}`} className="p-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (!data) {
    return (
      <InfoCard title="📋 Clinical Narrative & Notes">
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generate Clinical Documentation
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create comprehensive clinical narrative including pre-hospital report, 
              initial encounter note, and progress notes with timeline.
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Clinical Documentation...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Generate Clinical Narrative & Notes
              </>
            )}
          </button>
        </div>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="📋 Clinical Narrative & Notes">
      <div className="space-y-4">

        {/* Pre-Hospital Report */}
        <CollapsibleSection
          title="Pre-Hospital Report"
          sectionKey="pre-hospital"
          icon="🚑"
          badge={data.preHospitalReport.emsUnit}
        >
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="font-semibold text-gray-700">Response Time:</span>
                <span className="ml-2 font-mono text-sm">{data.preHospitalReport.responseTime}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Transport Time:</span>
                <span className="ml-2 font-mono text-sm">{data.preHospitalReport.transportTime}</span>
              </div>
            </div>
            
                         <div className="mb-4">
               <div className="font-semibold text-gray-700 mb-1">Chief Complaint:</div>
               <div className="text-gray-800 italic font-medium">"{data.preHospitalReport.chiefComplaint}"</div>
             </div>
 
             <div className="mb-4">
               <div className="font-semibold text-gray-700 mb-1">Field Vitals:</div>
               <div className="font-mono text-sm bg-white p-2 rounded border text-gray-800">
                 {data.preHospitalReport.fieldVitals}
               </div>
             </div>
 
             <div className="mb-4">
               <div className="font-semibold text-gray-700 mb-1">EMS Narrative:</div>
               <div className="bg-white p-3 rounded border text-sm leading-relaxed text-gray-800">
                 {data.preHospitalReport.narrative}
               </div>
             </div>
 
             <div>
               <div className="font-semibold text-gray-700 mb-2">Pre-Hospital Interventions:</div>
               <ul className="list-disc list-inside space-y-1">
                 {data.preHospitalReport.interventions.map((intervention, index) => (
                   <li key={index} className="text-sm text-gray-800 font-medium">{intervention}</li>
                 ))}
               </ul>
             </div>
          </div>
        </CollapsibleSection>

        {/* Initial Encounter Note */}
        <CollapsibleSection
          title="Initial Encounter Note"
          sectionKey="initial-encounter"
          icon="👩‍⚕️"
          badge={data.initialEncounterNote.timestamp}
        >
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Note Header */}
            <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-blue-900">{data.initialEncounterNote.physician}</div>
                  <div className="text-sm text-blue-700">{data.initialEncounterNote.department}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-blue-900">
                    {data.initialEncounterNote.timestamp}
                  </div>
                </div>
              </div>
            </div>

                         {/* Note Content */}
             <div className="p-4 space-y-4 font-mono text-sm leading-relaxed">
               <div>
                 <div className="font-bold text-gray-900 mb-1">CHIEF COMPLAINT:</div>
                 <div className="ml-4 italic text-gray-800">"{data.initialEncounterNote.chiefComplaint}"</div>
               </div>
 
               <div>
                 <div className="font-bold text-gray-900 mb-1">HISTORY OF PRESENT ILLNESS:</div>
                 <div className="ml-4 whitespace-pre-line text-gray-800">{data.initialEncounterNote.hpi}</div>
               </div>
 
               <div>
                 <div className="font-bold text-gray-900 mb-1">REVIEW OF SYSTEMS:</div>
                 <div className="ml-4 text-gray-800">{data.initialEncounterNote.reviewOfSystems}</div>
               </div>
 
               <div>
                 <div className="font-bold text-gray-900 mb-1">PHYSICAL EXAMINATION:</div>
                 <div className="ml-4 whitespace-pre-line text-gray-800">{data.initialEncounterNote.physicalExam}</div>
               </div>
 
               <div>
                 <div className="font-bold text-gray-900 mb-1">ASSESSMENT:</div>
                 <div className="ml-4 text-gray-800">{data.initialEncounterNote.assessment}</div>
               </div>
 
               <div>
                 <div className="font-bold text-gray-900 mb-1">PLAN:</div>
                 <div className="ml-4 whitespace-pre-line text-gray-800">{data.initialEncounterNote.plan}</div>
               </div>
             </div>
          </div>
        </CollapsibleSection>

        {/* Progress Notes */}
        <CollapsibleSection
          title="Progress Notes"
          sectionKey="progress-notes"
          icon="📝"
          badge={`${data.progressNotes.length} entries`}
        >
          <div className="space-y-3">
            {data.progressNotes.map((note, index) => (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {index < data.progressNotes.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-full bg-gray-300"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  
                  {/* Note content */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{note.author}</div>
                          <div className="text-xs text-gray-600">{note.department} • {note.type}</div>
                        </div>
                        <div className="font-mono text-sm font-semibold text-gray-700">
                          {note.timestamp}
                        </div>
                      </div>
                                         </div>
                     <div className="p-4">
                       <div className="text-sm leading-relaxed text-gray-800 font-medium">
                         {note.note}
                       </div>
                     </div>
                  </div>
                </div>
              </div>
                         ))}
           </div>
         </CollapsibleSection>

         {/* Add Individual Notes Section */}
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <h4 className="text-sm font-semibold text-blue-900 mb-3">Add Individual Notes</h4>
           <div className="grid grid-cols-2 gap-3">
             <button
               onClick={addProgressNote}
               disabled={subGeneratorStates.progressNote}
               className="inline-flex items-center justify-center px-3 py-2 text-sm bg-white text-blue-700 font-medium rounded-md border border-blue-300 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
             >
               {subGeneratorStates.progressNote ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Adding...
                 </>
               ) : (
                 <>
                   <span className="mr-2">📝</span>
                   Add Progress Note
                 </>
               )}
             </button>

             <button
               onClick={addSpecialistConsult}
               disabled={subGeneratorStates.specialistConsult}
               className="inline-flex items-center justify-center px-3 py-2 text-sm bg-white text-blue-700 font-medium rounded-md border border-blue-300 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
             >
               {subGeneratorStates.specialistConsult ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Adding...
                 </>
               ) : (
                 <>
                   <span className="mr-2">🩺</span>
                   Add Specialist Consult
                 </>
               )}
             </button>

             <button
               onClick={addNursingAssessment}
               disabled={subGeneratorStates.nursingAssessment}
               className="inline-flex items-center justify-center px-3 py-2 text-sm bg-white text-blue-700 font-medium rounded-md border border-blue-300 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
             >
               {subGeneratorStates.nursingAssessment ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Adding...
                 </>
               ) : (
                 <>
                   <span className="mr-2">👩‍⚕️</span>
                   Add Nursing Assessment
                 </>
               )}
             </button>

             <button
               onClick={addProcedureNote}
               disabled={subGeneratorStates.procedureNote}
               className="inline-flex items-center justify-center px-3 py-2 text-sm bg-white text-blue-700 font-medium rounded-md border border-blue-300 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
             >
               {subGeneratorStates.procedureNote ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Adding...
                 </>
               ) : (
                 <>
                   <span className="mr-2">⚕️</span>
                   Add Procedure Note
                 </>
               )}
             </button>
           </div>
         </div>

         {/* Clinical Summary - moved to bottom */}
         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
           <div className="flex">
             <div className="ml-3">
               <h3 className="text-sm font-semibold text-yellow-800 mb-1">Clinical Summary</h3>
               <div className="text-sm text-yellow-700">
                 {data.clinicalSummary}
               </div>
             </div>
           </div>
         </div>

         {/* Regenerate Button - moved to bottom */}
         <div className="flex justify-center pt-4">
           <button
             onClick={onGenerate}
             disabled={isGenerating}
             className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 focus:ring-2 focus:ring-green-200 disabled:opacity-50 transition-colors duration-200"
           >
             {isGenerating ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Regenerating...
               </>
             ) : (
               <>
                 <span className="mr-2">🔄</span>
                 Regenerate Clinical Notes
               </>
             )}
           </button>
         </div>
       </div>
     </InfoCard>
   );
 };

export default ClinicalNarrativeSection; 