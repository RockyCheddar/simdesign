# Healthcare Simulation Case Generator

An AI-powered healthcare simulation case generator built with Next.js 14, TypeScript, and Claude AI. This application helps medical educators create realistic, educational simulation cases for healthcare training with **advanced AI-generated progression scenarios**.

## 🚀 Features

### 🤖 **AI-Powered Progression Scenarios** ⭐ *NEW*
- **Conditional Branching**: Create decision-based scenarios with multiple pathways
- **Time-Based Evolution**: Generate natural disease progression without intervention
- **Complication Scenarios**: Build unexpected clinical events and crisis management training
- **Context-Aware Generation**: Uses existing patient data for personalized scenarios
- **Real-time Progress Tracking**: Visual feedback during AI generation process

### 🏥 **Core Case Generation**
- **AI-Powered Case Generation**: Leverage Claude AI to create realistic medical simulation cases
- **Multi-Step Form Interface**: Intuitive case creation workflow
- **Tab-Based Case Display**: Organized presentation of patient information, scenarios, and learning objectives
- **Timeline Visualization**: Interactive timeline with expandable details and branch pathways

### 🎨 **User Experience**
- **Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **Inline Timeline System**: Toggle timelines without modal interruptions
- **State Management**: Efficient state handling with Zustand
- **Form Validation**: Robust form handling with React Hook Form
- **Real-time Notifications**: User feedback with React Hot Toast
- **TypeScript**: Full type safety throughout the application

## 🎯 **AI Progression Scenarios**

### **Three Scenario Types Available:**

#### 1. **🔀 Conditional Branching Scenarios**
- Decision points with multiple pathways (positive/negative/neutral outcomes)
- Realistic vital sign progressions based on patient data
- Critical decision windows with clinical timing
- Patient-specific risk factors and physiological responses

#### 2. **⏰ Time-Based Evolution Scenarios**  
- Natural disease progression modeling without intervention
- Pathophysiology-based progression patterns
- Compensatory mechanism progression and decompensation points
- Patient-specific timing variations (age, comorbidities, medications)

#### 3. **⚠️ Complication Scenarios**
- Unexpected clinical events and crisis management
- Risk factor-based complications with early warning signs
- Multiple management pathway options
- Realistic complication timing and recognition challenges

### **🎓 Educational Benefits:**
- **Clinical Accuracy**: Evidence-based timing and pathophysiology
- **Personalization**: Patient-specific factors (age, medications, conditions)
- **Assessment Ready**: Built-in instructor notes and teaching points
- **Progressive Complexity**: Multiple difficulty levels available

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **AI Integration**: Anthropic Claude API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Development**: ESLint, Prettier

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Anthropic API key

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd healthcare-sim
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Update the `.env.local` file with your actual values:

```env
# Anthropic Claude API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# NextAuth Configuration (for future authentication)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Application Settings
NODE_ENV=development
APP_NAME="Healthcare Simulation Case Generator"
APP_VERSION=1.2.0
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
healthcare-sim/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   │   └── progression/ # AI progression generation endpoint
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── forms/         # Form components
│   │   ├── progression/   # AI progression scenario components
│   │   └── layout/        # Layout components
│   ├── lib/               # Library configurations
│   │   └── anthropic.ts   # Claude AI integration
│   ├── stores/            # Zustand stores
│   │   └── useAppStore.ts # Main application store
│   ├── types/             # TypeScript type definitions
│   │   ├── index.ts       # Main types
│   │   └── progression.ts # Progression scenario types
│   └── utils/             # Utility functions
│       ├── constants.ts   # Application constants
│       └── helpers.ts     # Helper functions
├── public/                # Static assets
├── AI_GENERATION_PROMPTS.md # Expert AI prompts for scenario generation
├── PROGRESSION_TAB_README.md # Detailed progression system documentation
├── CHANGELOG.md          # Version history and updates
├── .env.local           # Environment variables
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```

## 🎮 **Using AI Progression Scenarios**

### **Creating a New Progression Scenario:**

1. **Navigate to Progression Tab** in any case
2. **Click "Create New Progression Scenario"**
3. **Choose scenario type**: Conditional Branching, Time-Based Evolution, or Complication
4. **Select "Generate with AI"** 
5. **Configure parameters**: 
   - Duration (15-120 minutes)
   - Complexity level (Simple/Moderate/Complex)
   - Specific settings per scenario type
6. **AI generates complete scenario** with realistic clinical timing
7. **View timeline inline** with expandable details

### **Timeline Interaction:**
- Click **"Timeline"** button to toggle inline display
- View **Timeline Summary** for quick overview (event counts, severity stats)
- **Expand sections individually** (Main Timeline, Branch Details)
- **Clinical accuracy** with evidence-based progressions

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Clean build artifacts

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production URL)
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic Claude API key | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js (future use) | No |
| `NEXTAUTH_URL` | Base URL for authentication | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🧪 **Confirmed Working Features**

**Recent successful testing (June 2025):**
```
✅ AI generated: "Time-Based Evolution: Early Sepsis from UTI - Elderly Diabetic"
✅ API endpoint responding correctly (/api/progression/generate)
✅ Case data integration working (hasContextData: true)
✅ Real-time generation logging active
✅ Complete scenario created with timeline data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- User authentication and authorization
- **Advanced scenario analytics** and usage tracking  
- **Scenario sharing** between instructors
- Integration with Learning Management Systems (LMS)
- Mobile application
- Multi-language support
- **Enhanced AI prompts** with specialty-specific templates
- Peer review system
- **Assessment integration** with automatic scoring

---

**🎯 Production Ready**: Complete AI generation integration functional with all three scenario types working, dev server running successfully, and real-time AI scenario generation operational using expertly crafted medical education prompts.

Built with ❤️ for healthcare education
