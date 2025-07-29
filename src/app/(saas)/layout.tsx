import { ReactNode } from 'react';

interface SaaSLayoutProps {
  children: ReactNode;
}

export default function SaaSLayout({ children }: SaaSLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed-width Left Sidebar */}
      <aside className="w-64 bg-gray-800 text-white h-screen flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Case Study SaaS</h2>
          <p className="text-gray-300 text-sm mt-1">AI-Powered Platform</p>
        </div>
        
        <nav className="flex-1 p-6">
          <div className="space-y-4">
            <div className="text-gray-400 text-xs uppercase tracking-wide font-semibold">
              Navigation
            </div>
            
            {/* Placeholder navigation items */}
            <div className="space-y-2">
              <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded transition-colors">
                Dashboard
              </div>
              <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded transition-colors">
                Case Library
              </div>
              <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded transition-colors">
                Create Case
              </div>
              <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded transition-colors">
                Settings
              </div>
            </div>
          </div>
        </nav>
        
        <div className="p-6 border-t border-gray-700">
          <div className="text-gray-400 text-xs">
            Navigation items will be implemented as the SaaS features are developed.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 bg-white overflow-auto">
        {children}
      </main>
    </div>
  );
} 