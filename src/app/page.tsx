import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Welcome to Our Healthcare Training Platform
        </h1>
        
        <p className="text-lg text-gray-600 mb-12 max-w-2xl">
          Choose your preferred training environment to get started with healthcare case studies and simulations.
        </p>

        <div className="space-y-6">
          {/* Button to Old Simulation System */}
          <Link 
            href="/old-simulation"
            className="block w-full max-w-md mx-auto"
          >
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
              Go to Old Simulation System
            </button>
          </Link>

          {/* Button to New Case Study SaaS */}
          <Link 
            href="/saas"
            className="block w-full max-w-md mx-auto"
          >
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
              Go to New Case Study SaaS
            </button>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Select the system that best fits your current training needs</p>
        </div>
      </div>
    </div>
  );
}
