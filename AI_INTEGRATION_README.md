# AI Integration for Healthcare Simulation Platform

This document describes the AI integration setup and functionality for the healthcare simulation platform, specifically the objectives refinement feature using Claude AI.

## Overview

The AI integration enhances the case creation process by providing intelligent refinement of learning objectives based on educational best practices and simulation-based learning principles.

## Features

### 🤖 AI-Powered Objectives Refinement
- **Context-Aware Analysis**: AI considers target learners, experience level, clinical domain, and duration
- **Educational Best Practices**: Applies Bloom's taxonomy and simulation-based learning principles
- **Side-by-Side Comparison**: Shows original vs. refined objectives with explanations
- **Selective Acceptance**: Users can accept/reject individual suggestions
- **Comprehensive Feedback**: Provides general recommendations for simulation design

### 🔧 Technical Implementation
- **Claude Sonnet 4**: Uses the latest Claude model for high-quality responses
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Comprehensive error management and fallback options
- **TypeScript Support**: Fully typed interfaces and error-safe implementations
- **Timeout Management**: 30-second timeout for API calls

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Anthropic API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. API Key Setup

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to your `.env.local` file

### 3. Dependencies

The required dependencies are already included:

```json
{
  "@anthropic-ai/sdk": "^0.24.3"
}
```

## API Architecture

### Route Handler: `/api/ai/claude`

**Location**: `src/app/api/ai/claude/route.ts`

**Features**:
- Rate limiting (10 requests per minute per IP)
- Request timeout (30 seconds)
- Comprehensive error handling
- IP-based client identification

**Request Format**:
```typescript
{
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}
```

**Response Format**:
```typescript
{
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

### AI Service Layer

**Location**: `src/utils/aiService.ts`

**Key Functions**:

#### `refineObjectives(learningContext, objectives)`
Main function for objective refinement:
- Generates context-aware prompts
- Calls Claude API
- Parses and validates responses
- Returns structured refinement data

#### `createObjectiveRefinementPrompt(context, objectives)`
Creates specialized prompts for medical education:
- Incorporates simulation context
- Applies educational frameworks
- Ensures JSON response format

#### `parseObjectiveRefinementResponse(content)`
Safely parses AI responses:
- Extracts JSON from text responses
- Validates response structure
- Provides fallback handling

#### `validateAIConfiguration()`
Checks API setup:
- Tests API key validity
- Verifies service availability
- Returns configuration status

## Component Integration

### ObjectivesRefinementStep Component

**Location**: `src/components/case-creation/steps/ObjectivesRefinementStep.tsx`

**Features**:
- **Loading States**: Shows progress during AI processing
- **Error Handling**: Displays user-friendly error messages
- **Configuration Check**: Validates API setup on mount
- **Interactive UI**: Side-by-side comparison with accept/reject buttons
- **Bulk Actions**: Accept all or reject all functionality
- **Context Display**: Shows simulation parameters for reference

**State Management**:
```typescript
interface RefinedObjectives {
  originalObjectives: string[];
  aiImprovedObjectives: RefinedObjective[];
  selectedObjectives: string[];
  feedback?: string;
  isLoading?: boolean;
  error?: string;
}
```

## Usage Flow

### 1. User Journey
1. User completes Step 1 (Learning Context & Objectives)
2. Proceeds to Step 2 (AI Objectives Refinement)
3. System validates AI configuration
4. User clicks "Refine with AI" button
5. AI analyzes objectives with context
6. User reviews side-by-side comparison
7. User accepts/rejects individual suggestions
8. System updates selected objectives for next steps

### 2. AI Processing
1. **Context Assembly**: Combines learning parameters
2. **Prompt Generation**: Creates specialized medical education prompt
3. **API Call**: Sends request to Claude with timeout
4. **Response Parsing**: Extracts and validates JSON response
5. **Error Handling**: Manages failures gracefully
6. **State Update**: Updates UI with results

## Error Handling

### API Errors
- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests
- **408 Timeout**: Request took too long
- **500 Server Error**: API configuration issues

### Client Errors
- **Network Issues**: Connection problems
- **Parsing Errors**: Invalid AI responses
- **Validation Errors**: Missing required data

### User Experience
- Clear error messages
- Retry functionality
- Fallback to original objectives
- Configuration guidance

## Rate Limiting

### Current Limits
- **10 requests per minute** per IP address
- **30-second timeout** per request
- **Sliding window** implementation

### Implementation
```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
```

## Security Considerations

### API Key Protection
- Server-side only (never exposed to client)
- Environment variable storage
- No logging of API keys

### Input Validation
- Prompt sanitization
- Request size limits
- Type checking

### Rate Limiting
- IP-based tracking
- Prevents abuse
- Protects API costs

## Monitoring & Debugging

### Logging
- API errors logged server-side
- Client errors logged to console
- Usage tracking available

### Debug Information
- Request/response timing
- Token usage statistics
- Error categorization

## Future Enhancements

### Planned Features
1. **Custom Prompts**: User-defined refinement criteria
2. **Multiple Models**: Support for different AI models
3. **Batch Processing**: Refine multiple objective sets
4. **Learning Analytics**: Track refinement effectiveness
5. **Offline Mode**: Cached suggestions for common scenarios

### Performance Optimizations
1. **Response Caching**: Cache common refinements
2. **Streaming Responses**: Real-time AI output
3. **Background Processing**: Async refinement
4. **Smart Retries**: Exponential backoff

## Troubleshooting

### Common Issues

#### "AI Service Not Available"
- Check API key in `.env.local`
- Verify Anthropic account status
- Test API key validity

#### "Rate limit exceeded"
- Wait 1 minute before retrying
- Check for multiple users on same IP
- Consider upgrading API plan

#### "Request timeout"
- Check internet connection
- Verify API service status
- Try with shorter objectives

#### "Failed to parse AI response"
- Retry the request
- Check for API service issues
- Report persistent problems

### Debug Steps
1. Check browser console for errors
2. Verify environment variables
3. Test API key with curl
4. Check network connectivity
5. Review server logs

## API Costs

### Estimation
- **Input**: ~200-500 tokens per request
- **Output**: ~1000-2000 tokens per response
- **Cost**: Approximately $0.01-0.03 per refinement

### Optimization
- Efficient prompt design
- Appropriate token limits
- Rate limiting protection

## Support

For issues with AI integration:
1. Check this documentation
2. Review error messages
3. Test API configuration
4. Contact development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Dependencies**: @anthropic-ai/sdk ^0.24.3 