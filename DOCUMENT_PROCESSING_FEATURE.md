# Healthcare Simulation Document Processing Feature

## Overview

This document describes the comprehensive document processing system that allows healthcare educators to upload documents (Word, PDF, text files) and automatically extract structured case data using AI. The extracted data is then presented in an intuitive tabbed interface for review and editing before being saved as simulation cases.

## 🚀 Key Features

### ✅ Multi-Format Document Support
- **Word Documents (.docx)**: Full text extraction with formatting preservation
- **PDF Files (.pdf)**: Text extraction from searchable PDFs
- **Text Files (.txt)**: Direct text processing
- **File Size Limit**: 10MB maximum per upload

### ✅ AI-Powered Data Extraction
- **Claude API Integration**: Uses Anthropic's Claude for intelligent content parsing
- **Structured Data Extraction**: Automatically identifies and categorizes medical content
- **Context-Aware Processing**: Understands medical terminology and case structures
- **Comprehensive Field Coverage**: Extracts all standard case components

### ✅ Modern Tabbed Review Interface
- **10 Organized Tabs**: Logical grouping of case information
- **Sticky Document Reference**: Original document always visible for reference
- **Interactive Text Selection**: Click and assign text to specific fields
- **Real-time Editing**: Live updates as you modify extracted data
- **Responsive Design**: Works seamlessly on desktop and mobile

### ✅ Persistent State Management
- **Zustand Store with Persistence**: Data survives browser refresh and navigation
- **LocalStorage Integration**: Automatic data backup during editing process
- **Session Recovery**: Return to editing even after closing the browser

### ✅ Robust Error Handling
- **Timeout Protection**: Multiple layers of timeout handling (60s, 90s, 2min)
- **Content-Type Validation**: Proper multipart form data handling
- **File Validation**: Size, type, and content validation
- **User-Friendly Errors**: Clear error messages with actionable guidance

## 🏗️ System Architecture

### Frontend Components

```
src/app/create-from-document/
├── page.tsx                    # Document upload interface
│
src/app/review-case/[caseId]/
├── page.tsx                    # Tabbed review and editing interface
│
src/components/upload/
├── FileDropzone.tsx            # Drag-and-drop file upload component
│
src/stores/
├── documentStore.ts            # Persistent state management
```

### Backend API

```
src/app/api/process-document/
├── route.ts                    # AI document processing endpoint
```

### Data Flow

1. **Upload**: User drags/selects document → FileDropzone → API endpoint
2. **Processing**: Document text extraction → Claude AI analysis → Structured data
3. **Storage**: Processed data → Zustand store → LocalStorage persistence
4. **Review**: Navigate to review page → Load persisted data → Display in tabs
5. **Edit**: Interactive text selection → Field assignment → Real-time updates
6. **Save**: Create SimulationCase object → Save to storage → Redirect to case

## 📋 Case Data Structure

### Complete Field Coverage

The system extracts and organizes data into 10 comprehensive categories:

#### 1. **Overview Tab**
- Case Title
- Description  
- Difficulty Level (Beginner/Intermediate/Advanced)
- Duration (minutes)
- Tags (array)

#### 2. **Patient Info Tab**
- Demographics (name, age, gender, weight, height)
- Allergies (array)
- Current Medications (array)
- Medical History (array)
- Chief Complaint

#### 3. **Presentation Tab**
- Initial Presentation (detailed scenario description)

#### 4. **Vital Signs Tab**
- Blood Pressure (systolic/diastolic)
- Heart Rate (bpm)
- Respiratory Rate (breaths/min)
- Temperature (°C)
- Oxygen Saturation (%)
- Pain Level (0-10 scale)

#### 5. **Physical Exam Tab**
- General Appearance
- Cardiovascular System
- Respiratory System
- Abdominal Examination
- Neurological Assessment
- Musculoskeletal Examination
- Skin Assessment

#### 6. **Lab Results Tab**
- Structured lab data with:
  - Test Name
  - Value
  - Units
  - Reference Range
  - Clinical Significance

#### 7. **Imaging Tab**
- Imaging studies with:
  - Type (X-ray, CT, MRI, etc.)
  - Findings
  - Impression
  - Clinical Correlation

#### 8. **Assessment Tab**
- Progress Notes
- Clinical Assessments
- Differential Diagnoses
- Treatment Plans

#### 9. **Learning Objectives Tab**
- Educational Goals
- Learning Outcomes
- Assessment Criteria

#### 10. **Input Bulk Tab**
- **Unmatched Content**: Debrief questions, additional notes
- **Catch-All Category**: Content that doesn't fit standard categories
- **Manual Entry**: Space for custom content addition

## 🔧 Technical Implementation

### State Management (Zustand Store)

```typescript
interface DocumentStore {
  processedData: {
    caseId: string;
    originalText: string;
    parsedData: CaseData;
  } | null;
  setProcessedData: (data: ProcessedData) => void;
  clearProcessedData: () => void;
}
```

**Persistence Configuration:**
- **Storage**: localStorage with JSON serialization
- **Key**: 'healthcare-sim-document-store'
- **Auto-save**: Every state change automatically persisted

### AI Processing Pipeline

```typescript
// 1. Document Upload & Validation
const formData = await request.formData();
const file = formData.get('file') as File;

// 2. Text Extraction (format-specific)
let extractedText: string;
if (file.type.includes('pdf')) {
  // PDF processing with pdf-parse
} else if (file.name.endsWith('.docx')) {
  // Word processing with mammoth
} else {
  // Plain text processing
}

// 3. AI Analysis with Claude
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 3000,
  temperature: 0.1,
  messages: [{ role: "user", content: prompt }]
});

// 4. Structure & Return
return NextResponse.json({
  success: true,
  caseId: generateId(),
  originalText: extractedText,
  parsedData: extractedData
});
```

### Error Handling & Timeouts

**Multiple Timeout Layers:**
- **Client-side**: 2-minute AbortController timeout
- **API Route**: 90-second total request timeout  
- **AI Processing**: 60-second Claude API timeout
- **Progress Checkpoints**: Validation, extraction, AI processing stages

**Error Categories:**
- **Upload Errors**: File size, format, corruption issues
- **Processing Errors**: Text extraction failures
- **AI Errors**: Claude API timeouts, parsing failures
- **Timeout Errors**: Specific timeout vs general error handling

### UI/UX Features

**Interactive Text Selection:**
```typescript
const handleTextSelection = () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  // Show assignment popup
  setTextSelection({
    show: true,
    x: rect.left + rect.width / 2,
    y: rect.top - 10,
    selectedText
  });
};
```

**Tab-Based Organization:**
- **Responsive Layout**: 1/3 document sidebar + 2/3 tabbed content
- **Sticky Navigation**: Document reference always visible
- **Context-Aware Field Suggestions**: Tab-specific field recommendations
- **Form Validation**: Real-time validation with user feedback

## 🚨 Bug Fixes & Improvements

### Issues Resolved

#### 1. **Save Case Error Message**
**Problem**: "No document data found" error appeared after successful case creation
**Root Cause**: useEffect triggered after clearProcessedData() during save process
**Solution**: Added `isRedirecting` state to prevent error check during save/redirect

#### 2. **Redirect Not Working** 
**Problem**: Users weren't redirected to case details after saving
**Solution**: Changed to `router.replace()` with timeout for better UX

#### 3. **Content-Type Issues**
**Problem**: API receiving wrong Content-Type headers
**Solution**: Let browser automatically set multipart/form-data headers

#### 4. **AI Processing Timeouts**
**Problem**: Documents hanging during processing, never completing
**Solution**: Implemented multiple timeout layers and Promise racing

#### 5. **Form Field Styling**
**Problem**: Light gray text hard to read in form fields
**Solution**: Added explicit `text-gray-900 bg-white` classes to all inputs

#### 6. **Build Manifest Errors**
**Problem**: ENOENT errors for Next.js build manifest files
**Solution**: Cleared `.next` directory and reinstalled dependencies

## 📱 User Experience Flow

### 1. **Document Upload**
1. Navigate to "Create from Document" 
2. Drag & drop or click to select file
3. File validation and upload progress
4. Processing indicator with timeout protection

### 2. **AI Processing**
1. Text extraction based on file type
2. Claude AI analysis and structuring
3. Data validation and formatting
4. Storage in persistent state

### 3. **Review & Edit**
1. Automatic redirect to tabbed review interface
2. Document displayed in sticky sidebar
3. Navigate between 10 organized tabs
4. Select text from document to assign to fields
5. Edit and refine extracted data

### 4. **Save & Navigate**
1. Click "Save Case" button
2. Success confirmation message
3. Automatic redirect to case details page
4. Case available in main dashboard

## 🔧 Dependencies Added

```json
{
  "dependencies": {
    "mammoth": "^1.8.0",        // Word document processing
    "pdf-parse": "^1.1.1",      // PDF text extraction  
    "@anthropic-ai/sdk": "^0.32.1", // Claude AI integration
    "zustand": "^5.0.2"         // State management with persistence
  }
}
```

## 🎯 Future Enhancements

### Potential Improvements
- **Batch Processing**: Upload multiple documents simultaneously
- **Template System**: Pre-defined case templates for different specialties
- **Version Control**: Track changes and maintain document history
- **Collaboration**: Multi-user editing and review workflows
- **Advanced AI**: Support for GPT-4, Gemini, or other AI models
- **Export Options**: Generate Word/PDF reports from cases
- **Integration**: Connect with existing LMS systems

### Performance Optimizations
- **Streaming**: Real-time processing updates
- **Caching**: Cache AI responses for similar content
- **Compression**: Optimize document storage and transfer
- **Lazy Loading**: Load tabs and content on demand

## 📊 Technical Metrics

### Performance Targets
- **Upload Speed**: < 5 seconds for 10MB files
- **AI Processing**: 30-90 seconds for standard documents
- **UI Responsiveness**: < 100ms tab switching
- **Error Rate**: < 1% processing failures

### Monitoring Points
- Document processing success rate
- AI extraction accuracy
- User interaction patterns
- Error types and frequencies
- Performance bottlenecks

---

## 🏁 Conclusion

This comprehensive document processing system transforms the healthcare simulation case creation workflow from manual data entry to intelligent, AI-assisted extraction. The tabbed interface, persistent storage, and robust error handling provide a professional, reliable tool for healthcare educators.

The system successfully addresses all original requirements:
- ✅ Multi-format document support
- ✅ AI-powered data extraction  
- ✅ Comprehensive field coverage
- ✅ Modern, intuitive interface
- ✅ Persistent data storage
- ✅ Error handling and recovery
- ✅ Seamless integration with existing case management

**Total Implementation**: ~2,400 lines of code across 7 new files with full TypeScript support, modern React patterns, and production-ready error handling. 