import Logo from '@components/Logo';
import { useModal } from '@hooks/useModal';
import DefaultSearchBar from '@components/legacy/DefaultSearchBar';
import { Link } from 'react-router-dom';
import DashboardSearchBar from '@components/legacy/DashboardSearchBar';

interface prob {
  page?: 'dashboard' | 'real-time';
}

function TopNavBar({ page }: prob) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();

  return (
    <nav className="fixed z-50 top-0  left-0 w-full bg-white shadow-md">
      <div className="container flex justify-center items-center h-16">
        {/* Logo */}
        <Logo />
        {/* Center: Search Bar */}
        {page === 'dashboard' ? <DashboardSearchBar /> : <DefaultSearchBar />}

        {/* Right: Buttons for large screens */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to={{ pathname: '/dashboard' }}>
            <button
            className={`px-[0.5rem] responsive-text font-bold rounded hover:text-[#9ab867] whitespace-nowrap ${
              page === 'dashboard' ? 'text-[#9ab867]' : ''
            }`}
          >
              DashBoard
            </button>
          </Link>

          <span className="text-gray-300">|</span>

          <button
            className={`px-[0.5rem] responsive-text font-bold rounded hover:text-[#9ab867] whitespace-nowrap ${
              page === 'real-time' ? 'text-[#9ab867]' : ''
            }`}
          >
            Real-Time Chart
          </button>
        </div>

        {/* Hamburger Menu for small screens */}
        <div className="md:hidden flex items-center">
          <button
            className="px-[0.5rem] font-bold rounded focus:outline-none"
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            &#x22EE;
          </button>

          {isModalOpen && (
            <div
              ref={modalRef}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg"
            >
              <Link to={{ pathname: '/dashboard' }}>
                <button
                className={`block w-full text-left px-4 py-2 font-bold hover:text-[#9ab867] ${
                  page === 'dashboard' ? 'text-[#9ab867]' : ''
                }`}
              >
                  DashBoard
                </button>
              </Link>

              <button
                className={`block w-full text-left px-4 py-2 font-bold hover:text-[#9ab867] ${
                  page === 'real-time' ? 'text-[#9ab867]' : ''
                }`}
              >
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
