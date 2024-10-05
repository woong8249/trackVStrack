import { useState, useEffect, useRef } from 'react';
import Logo from '@components/Logo';

function TopNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container flex justify-center items-center  h-16">
        {/* Logo */}
        <Logo />

        {/* Center: Search Bar */}
        <div className="flex-grow mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 111.7-1.7l4.35 4.35z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Buttons for large screens */}
        <div className="hidden md:flex items-center space-x-4">
          <button className=" py-[0.5rem] px-[1rem] responsive-text font-bold rounded hover:text-[#9ab867] whitespace-nowrap">
            DashBoard
          </button>

          {/* Divider line */}
          <span className="text-gray-300">|</span>

          <button className="py-[0.5rem] px-[1rem] responsive-text font-bold rounded hover:text-[#9ab867] whitespace-nowrap">
            Real-Time Chart
          </button>
        </div>

        {/* Hamburger Menu for small screens */}
        <div className="md:hidden flex items-center">
          <button
            className="py-[0.5rem] px-[1rem] font-bold rounded focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            &#x22EE;
          </button>

          {isMenuOpen && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
              <button className="block w-full text-left px-4 py-2 font-bold hover:text-[#9ab867]">
                DashBoard
              </button>

              <button className="block w-full text-left px-4 py-2 font-bold hover:text-[#9ab867]">
                Real-Time Chart
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TopNavBar;
