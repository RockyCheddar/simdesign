# Document Processing Feature

## Overview

The Document Processing feature allows users to upload medical case documents (PDF or DOCX) and automatically extract structured case data using AI. This feature streamlines the process of creating simulation cases from existing medical documentation.

## Features

### 1. Document Upload
- **Supported Formats**: PDF (.pdf) and Microsoft Word (.docx) files
- **File Size Limit**: 10MB maximum
- **Drag & Drop Interface**: User-friendly file selection with drag-and-drop support
- **File Validation**: Automatic validation of file type and size

### 2. AI-Powered Text Extraction
- **PDF Processing**: Uses `pdf-parse` library to extract text from PDF documents
- **DOCX Processing**: Uses `mammoth` library to extract text from Word documents
- **Claude AI Integration**: Sends extracted text to Claude API for structured data extraction

### 3. Interactive Review Interface
- **Two-Column Layout**: Original document text on the left, editable form on the right
- **Text Highlighting**: Select text from the original document to assign to specific fields
- **Real-time Editing**: All extracted data fields are editable before saving
- **Field Mapping**: Popup interface for assigning selected text to case fields

### 4. Structured Data Extraction
The AI extracts and structures the following information:
- **Case Information**: Title, description, difficulty, duration, tags, learning objectives
- **Patient Information**: Name, age, gender, weight, height, allergies, medications, medical history, chief complaint
- **Scenario Details**: Initial presentation, vital signs, physical examination findings

## Implementation Details

### API Route: `/api/process-document`
**Location**: `src/app/api/process-document/route.ts`

**Functionality**:
- Handles multipart/form-data file uploads
- Validates file type and size
- Extracts text using appropriate library (mammoth for DOCX, pdf-parse for PDF)
- Sends text to Claude AI with structured prompt
- Returns both original text and parsed data

**Error Handling**:
- File validation errors
- Text extraction failures
- AI API call failures
- Comprehensive error messages

### Frontend Components

#### 1. FileDropzone Component
**Location**: `src/components/upload/FileDropzone.tsx`

**Features**:
- Drag-and-drop file selection
- File type and size validation
- Visual feedback for drag states
- File preview with removal option
- Accessibility features (keyboard navigation, ARIA labels)

#### 2. Document Upload Page
**Location**: `src/app/create-from-document/page.tsx`

**Features**:
- Protected route (requires authentication)
- Step-by-step instructions
- File upload interface
- Processing status indicators
- Error handling and display

#### 3. Review & Edit Page
**Location**: `src/app/review-case/[caseId]/page.tsx`

**Features**:
- Two-column responsive layout
- Text selection and field assignment
- Comprehensive form editing
- Real-time data updates
- Save functionality with validation

### State Management
**Location**: `src/stores/documentStore.ts`

**Zustand Store Features**:
- Processing state management
- Error state handling
- Processed data storage
- Session-based data persistence

## User Workflow

1. **Access Feature**: Click "From Document" button on dashboard
2. **Upload Document**: Drag & drop or select PDF/DOCX file
3. **Process Document**: Click "Process Document" to extract data
4. **Review & Edit**: Review extracted data in two-column interface
5. **Assign Text**: Highlight text to assign to specific fields (optional)
6. **Save Case**: Save the structured case to local storage

## Technical Requirements

### Dependencies
```json
{
  "mammoth": "^1.6.0",
  "pdf-parse": "^1.1.1",
  "@types/pdf-parse": "^1.1.1"
}
```

### Environment Variables
```
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### AI Prompt Structure
The system uses a comprehensive prompt that:
- Instructs Claude to extract structured medical data
- Provides clear JSON schema requirements
- Handles missing data with reasonable defaults
- Ensures consistent output format

## Error Handling

### File Upload Errors
- Invalid file type (not PDF or DOCX)
- File size exceeds 10MB limit
- No file selected
- File corruption or read errors

### Processing Errors
- Text extraction failures
- AI API rate limits or failures
- Invalid JSON response from AI
- Network connectivity issues

### User Experience
- Clear error messages
- Loading states during processing
- Progress indicators
- Graceful fallbacks

## Security Considerations

### File Validation
- Strict file type checking
- File size limitations
- Content validation before processing

### API Security
- Environment variable protection for API keys
- Request validation and sanitization
- Error message sanitization

### Data Privacy
- No persistent storage of uploaded documents
- Session-based data management
- Local storage for final case data

## Future Enhancements

### Potential Improvements
1. **Batch Processing**: Support for multiple document uploads
2. **Template Matching**: Pre-defined templates for common case types
3. **OCR Support**: Image-based PDF text extraction
4. **Export Options**: Export to various formats (JSON, PDF, etc.)
5. **Collaboration**: Share and collaborate on extracted cases
6. **Version Control**: Track changes and revisions
7. **Integration**: Connect with external medical databases

### Performance Optimizations
1. **Caching**: Cache processed results for re-editing
2. **Streaming**: Stream large document processing
3. **Background Processing**: Queue system for large files
4. **Compression**: Optimize file transfer and storage

## Testing

### Manual Testing Checklist
- [ ] Upload valid PDF document
- [ ] Upload valid DOCX document
- [ ] Test file size validation (>10MB)
- [ ] Test invalid file types
- [ ] Test text selection and assignment
- [ ] Test form editing and validation
- [ ] Test case saving functionality
- [ ] Test error handling scenarios

### Automated Testing
Consider implementing:
- Unit tests for text extraction functions
- Integration tests for API endpoints
- E2E tests for complete workflow
- Performance tests for large documents

## Troubleshooting

### Common Issues
1. **"No text could be extracted"**: Document may be image-based or corrupted
2. **"API key not configured"**: Check ANTHROPIC_API_KEY environment variable
3. **"File size too large"**: Reduce file size or split document
4. **"Processing timeout"**: Large documents may take longer to process

### Debug Information
- Check browser console for detailed error messages
- Monitor network requests in developer tools
- Verify API key configuration in server logs
- Check file format and content validity

## Support

For technical support or feature requests related to the document processing feature, please refer to the main project documentation or contact the development team. 