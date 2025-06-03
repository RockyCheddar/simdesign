# Progression Tab Implementation

## Overview

The Progression Tab is a comprehensive component for managing simulation progression scenarios in healthcare simulation cases. It allows instructors to create, edit, and manage dynamic scenarios that adapt based on learner actions and time progression.

## Features

### 1. **Three Scenario Types**
- **⚡ Conditional Branching**: Scenarios that branch based on learner decisions
- **⏰ Time-Based Evolution**: Natural progression of patient condition over time  
- **⚠️ Complication Scenarios**: Unexpected complications that may arise

### 2. **Scenario Management**
- Create new scenarios with AI generation or manual creation
- Edit scenario titles and descriptions inline
- Duplicate existing scenarios
- Delete scenarios with confirmation
- Reorder scenarios with up/down controls
- View detailed timeline visualizations

### 3. **Timeline Visualization**
- Interactive timeline showing progression over time
- Visual markers for different significance levels (normal, concerning, critical)
- Detailed vital signs display
- Patient responses and clinical events
- Conditional branches for decision-based scenarios

### 4. **AI Generation**
- Simulated AI generation process with progress indicators
- Type-specific parameter configuration
- Mock timeline data generation based on scenario type

## File Structure

```
src/components/progression/
├── ProgressionScenarioCard.tsx     # Individual scenario display card
├── CreateProgressionModal.tsx      # Modal for creating new scenarios
├── TimelineVisualization.tsx       # Timeline display component
├── TimelineModal.tsx              # Modal wrapper for timeline
└── index.ts                       # Component exports

src/types/progression.ts            # TypeScript interfaces
src/components/case-display/tabs/ProgressionTab.tsx  # Main tab component
```

## Key Components

### ProgressionTab
Main component that orchestrates the entire progression management interface:
- Displays scenario type information
- Manages scenario list with CRUD operations
- Handles modal states for creation and timeline viewing
- Provides additional feature buttons (export, import, preview, instructor guide)

### ProgressionScenarioCard
Individual scenario display with:
- Type indicators and complexity badges
- Inline editing for title and description
- Timeline information display
- Action buttons (view timeline, edit, duplicate, delete)
- Confirmation flow for deletion

### CreateProgressionModal
Multi-step modal for scenario creation:
1. **Type Selection**: Choose from three scenario types with examples
2. **Configuration**: Set parameters specific to scenario type
3. **Generation**: AI generation simulation with progress tracking

### TimelineVisualization
Interactive timeline component featuring:
- Visual timeline with significance-based color coding
- Clickable timeline points with detailed information
- Conditional branch display for branching scenarios
- Selected point and branch detail panels

## Usage

### Creating a New Scenario

1. Click "Create New Progression" button
2. Select scenario type (Conditional, Time-Based, or Complication)
3. Choose "Generate with AI" or "Create Manually"
4. Configure scenario parameters:
   - Title and description
   - Complexity level (Simple, Moderate, Complex)
   - Type-specific parameters
5. Submit to create the scenario

### Managing Scenarios

- **Edit**: Click on title/description to edit inline
- **Reorder**: Use up/down arrows to change scenario order
- **View Timeline**: Click "Timeline" button to see detailed progression
- **Duplicate**: Create a copy of existing scenario
- **Delete**: Two-click confirmation for safety

### Timeline Viewing

- Click timeline points to see detailed vital signs and clinical information
- For conditional scenarios, click branches to see outcome details
- Visual indicators show significance levels (green=normal, yellow=concerning, red=critical)

## Type Definitions

### Core Interfaces

```typescript
interface ProgressionScenario {
  id: string;
  type: 'conditional' | 'time-based' | 'complication';
  title: string;
  description: string;
  isGenerated: boolean;
  createdAt: Date;
  timelineData?: TimelineData;
  parameters: ProgressionParameters;
  instructorNotes?: string;
}

interface TimelineData {
  duration: number; // in minutes
  dataPoints: TimelinePoint[];
  branches?: ConditionalBranch[];
}

interface TimelinePoint {
  timeMinutes: number;
  vitalSigns: VitalSigns;
  physicalFindings: string[];
  patientResponse: string;
  clinicalEvents: string[];
  significance: 'normal' | 'concerning' | 'critical';
  instructorNotes?: string;
}
```

## Integration

The Progression tab is integrated into the case display system:

1. Added to `CaseDisplayTabs.tsx` between Treatment and Simulation tabs
2. Updated tab navigation grid from 6 to 7 columns
3. Uses existing `InfoCard` component for consistent styling
4. Follows established patterns for state management and user interactions

## Styling

- Uses Tailwind CSS for consistent styling
- Follows existing design system with blue primary colors
- Responsive design that works on desktop and tablet
- Hover effects and smooth transitions
- Loading states and error handling

## Future Enhancements

The implementation includes placeholders for additional features:
- Export/Import scenario configurations
- Preview mode for testing scenarios
- Instructor guide generation
- Advanced scenario editors for each type
- Integration with actual AI generation services

## Dependencies

- React 19+ with TypeScript
- Tailwind CSS for styling
- No external drag-and-drop libraries (uses simple up/down controls)
- Integrates with existing healthcare simulation types and interfaces 