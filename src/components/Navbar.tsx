import React from 'react';
import { Settings, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenSettings }) => {
  return (
    <nav className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-2 md:ml-0 flex items-center">
          <span className="text-primary-600 font-bold text-xl">Metis</span>
          <span className="text-gray-700 font-bold text-xl">AI</span>
        </div>
      </div>
      
      <div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;