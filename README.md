# Healthcare Simulation Case Generator

An AI-powered healthcare simulation case generator built with Next.js 14, TypeScript, and Claude AI. This application helps medical educators create realistic, educational simulation cases for healthcare training.

## 🚀 Features

- **AI-Powered Case Generation**: Leverage Claude AI to create realistic medical simulation cases
- **Multi-Step Form Interface**: Intuitive case creation workflow
- **Tab-Based Case Display**: Organized presentation of patient information, scenarios, and learning objectives
- **Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **State Management**: Efficient state handling with Zustand
- **Form Validation**: Robust form handling with React Hook Form
- **Real-time Notifications**: User feedback with React Hot Toast
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **AI Integration**: Anthropic Claude API
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
APP_VERSION=1.0.0
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
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── lib/               # Library configurations
│   │   └── anthropic.ts   # Claude AI integration
│   ├── stores/            # Zustand stores
│   │   └── useAppStore.ts # Main application store
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Main types
│   └── utils/             # Utility functions
│       ├── constants.ts   # Application constants
│       └── helpers.ts     # Helper functions
├── public/                # Static assets
├── .env.local            # Environment variables
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

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
- Case sharing and collaboration
- Advanced analytics and reporting
- Integration with Learning Management Systems (LMS)
- Mobile application
- Multi-language support
- Case templates and presets
- Peer review system

---

Built with ❤️ for healthcare education
