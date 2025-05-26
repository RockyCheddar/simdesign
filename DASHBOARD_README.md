# Dashboard & Case Creation System

This document describes the dashboard and case creation system implementation for the Healthcare Simulation Platform.

## Overview

The dashboard serves as the main interface for users to manage their simulation cases and access the case creation wizard. It provides a comprehensive view of all cases with filtering, searching, and sorting capabilities.

## Components

### Dashboard (`src/components/dashboard/Dashboard.tsx`)

The main dashboard component that provides:

- **Case Management**: View, search, filter, and sort simulation cases
- **Statistics**: Display total cases and storage usage
- **Navigation**: Access to case creation and other features
- **User Interface**: Professional healthcare-themed design

#### Features

- **Search**: Search cases by title, description, or tags
- **Filtering**: Filter by difficulty level (beginner, intermediate, advanced)
- **Sorting**: Sort by date created, title, or difficulty
- **Case Actions**: View, export, and delete cases
- **Empty State**: Helpful guidance when no cases exist
- **Responsive Design**: Works on desktop and mobile devices

### Case Storage (`src/utils/caseStorage.ts`)

Provides localStorage-based case management:

```typescript
// Save a case
saveCase(case: SimulationCase): void

// Load a specific case
loadCase(caseId: string): SimulationCase | null

// Load all cases
loadAllCases(): SimulationCase[]

// Delete a case
deleteCase(caseId: string): boolean

// Export case as JSON
exportCaseAsJSON(caseId: string): void

// Get storage statistics
getStorageStats(): { totalCases: number; storageUsed: string }

// Clear all cases
clearAllCases(): void
```

### Mock Data (`src/utils/mockData.ts`)

Provides realistic sample cases for demonstration:

- **Acute Myocardial Infarction** (Intermediate, 45min)
- **Pediatric Asthma Exacerbation** (Beginner, 30min)
- **Geriatric Fall Assessment** (Advanced, 60min)

Each case includes:
- Complete patient demographics
- Vital signs and clinical presentation
- Learning objectives
- Tags and difficulty levels
- Realistic medical scenarios

### Case Card (`src/components/dashboard/CaseCard.tsx`)

Individual case display component featuring:

- **Case Information**: Title, difficulty, duration, patient demographics
- **Learning Objectives**: Clear display of educational goals
- **Tags**: Visual categorization
- **Actions**: View, Export JSON, Delete with confirmation
- **Status Indicators**: Visual feedback for case status

### Empty State (`src/components/dashboard/EmptyState.tsx`)

Helpful guidance when no cases exist:

- **Getting Started Guide**: Step-by-step instructions
- **Action Buttons**: Create case or upload JSON
- **Educational Content**: Tips for effective case creation

## Case Creation System

### Case Creation Wizard (`src/components/case-creation/CaseCreationWizard.tsx`)

Multi-step wizard for creating simulation cases:

1. **Learning Context & Objectives** - Define target audience and goals
2. **AI Objectives Refinement** - Review and improve objectives
3. **Parameter Questions** - Answer scenario-specific questions
4. **Case Preview** - Review all parameters before generation
5. **Case Generation** - AI generates the complete case

### State Management (`src/stores/caseCreationStore.ts`)

Zustand-based store managing:

- **Form Data**: All step data and user inputs
- **Navigation**: Step progression and validation
- **Validation**: Real-time form validation
- **Progress**: Generation progress tracking

### Step Components

#### 1. Learning Context Step (`src/components/case-creation/steps/LearningContextStep.tsx`)
- Case title and description
- Experience level selection
- Clinical domain specification
- Duration and participant count
- Learning objectives management

#### 2. Objectives Refinement Step (`src/components/case-creation/steps/ObjectivesRefinementStep.tsx`)
- AI-enhanced objective suggestions
- Educational best practices integration
- Bloom's taxonomy alignment
- Custom objective addition

#### 3. Parameter Questions Step (`src/components/case-creation/steps/ParameterQuestionsStep.tsx`)
- AI-generated contextual questions
- Multiple question types (text, select, multiselect, range, boolean)
- Categorized by clinical scenario, resources, complexity, assessment
- Progress tracking

#### 4. Case Preview Step (`src/components/case-creation/steps/CasePreviewStep.tsx`)
- Complete parameter review
- Complexity score calculation
- Generation time estimation
- Modification options

#### 5. Case Generation Step (`src/components/case-creation/steps/CaseGenerationStep.tsx`)
- Real-time generation progress
- Phase-by-phase updates
- Error handling
- Success confirmation

### Navigation Components

#### Progress Stepper (`src/components/case-creation/ProgressStepper.tsx`)
- Visual step progression
- Click navigation to previous steps
- Progress percentage
- Step descriptions

#### Form Navigation (`src/components/case-creation/FormNavigation.tsx`)
- Previous/Next navigation
- Validation enforcement
- Cancel confirmation
- Generation controls

## Routes

### Main Routes
- `/` - Dashboard (protected)
- `/login` - Authentication
- `/create-case` - Case creation wizard (protected)

### Route Protection
All main routes are protected using the `ProtectedRoute` component, which:
- Checks authentication status
- Redirects to login if unauthenticated
- Shows loading states
- Handles role-based access (future feature)

## Usage Examples

### Creating a New Case

```typescript
// Navigate to case creation
router.push('/create-case');

// The wizard will guide through:
// 1. Define learning context
// 2. Refine objectives with AI
// 3. Answer parameter questions
// 4. Preview case details
// 5. Generate case with AI
```

### Managing Cases

```typescript
// Load all cases
const cases = loadAllCases();

// Search and filter
const filteredCases = cases.filter(case => 
  case.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
  (filterDifficulty === 'all' || case.difficulty === filterDifficulty)
);

// Export a case
exportCaseAsJSON(caseId);

// Delete a case
deleteCase(caseId);
```

### Storage Management

```typescript
// Get storage statistics
const stats = getStorageStats();
console.log(`Total cases: ${stats.totalCases}`);
console.log(`Storage used: ${stats.storageUsed}`);

// Clear all data (with confirmation)
clearAllCases();
```

## Styling

The dashboard uses a professional healthcare theme with:

- **Color Palette**: Blue primary, gray neutrals, semantic colors
- **Typography**: Clear hierarchy with readable fonts
- **Spacing**: Consistent padding and margins
- **Components**: Cards, buttons, forms with hover states
- **Responsive**: Mobile-first design approach

## Future Enhancements

### Planned Features
1. **Case Viewing**: Detailed case view and editing
2. **Collaboration**: Share cases with team members
3. **Templates**: Pre-built case templates
4. **Analytics**: Usage statistics and insights
5. **Export Options**: PDF, Word, LMS integration
6. **Version Control**: Case versioning and history
7. **Advanced Search**: Full-text search with filters
8. **Bulk Operations**: Multi-case management

### Technical Improvements
1. **Real AI Integration**: Connect to actual AI services
2. **Database Storage**: Replace localStorage with proper database
3. **File Upload**: Support for media and documents
4. **Offline Support**: PWA capabilities
5. **Performance**: Virtualization for large case lists
6. **Testing**: Comprehensive test coverage

## Development

### Adding New Case Types
1. Update `SimulationCase` type in `src/types/index.ts`
2. Add new fields to case creation steps
3. Update validation in `caseCreationStore.ts`
4. Modify case card display if needed

### Customizing the Dashboard
1. Modify `Dashboard.tsx` for layout changes
2. Update `CaseCard.tsx` for case display
3. Customize `EmptyState.tsx` for branding
4. Adjust styles in component files

### Extending Case Creation
1. Add new steps in `src/components/case-creation/steps/`
2. Update `FORM_STEPS` in `src/types/caseCreation.ts`
3. Modify `CaseCreationWizard.tsx` to include new steps
4. Update store validation logic

## Security Considerations

- **Data Storage**: Cases stored in localStorage (client-side only)
- **Authentication**: Required for all dashboard access
- **Validation**: Client-side validation for all inputs
- **Sanitization**: User inputs should be sanitized before display
- **Export Security**: JSON exports are client-generated

## Performance

- **Lazy Loading**: Components loaded on demand
- **Efficient Filtering**: Client-side filtering for small datasets
- **Optimized Rendering**: React best practices followed
- **Memory Management**: Proper cleanup of event listeners
- **Bundle Size**: Tree-shaking enabled for optimal builds

This dashboard system provides a solid foundation for healthcare simulation case management with room for future enhancements and customization. 