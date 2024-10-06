import Logo from '@components/Logo';
import { useModal } from '@hooks/useModal';
import { SearchBar } from '@components/SearchBar';
function TopNavBar() {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container flex justify-center items-center  h-16">
        {/* Logo */}
        <Logo />
        {/* Center: Search Bar */}
        <SearchBar></SearchBar>

        {/* Right: Buttons for large screens */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="  px-[0.5rem] responsive-text font-bold rounded hover:text-[#9ab867] whitespace-nowrap">
            DashBoard
          </button>

          <span className="text-gray-300">|</span>

          <button className=" px-[0.5rem] responsive-text font-bold rounded hover:text-[#9ab867] whitespace-nowrap">
            Real-Time Chart
          </button>
        </div>

        {/* Hamburger Menu for small screens */}
        <div className="md:hidden flex items-center">
          <button className=" px-[0.5rem] font-bold rounded focus:outline-none" onClick={() => setIsModalOpen(!isModalOpen)}>
            &#x22EE;
          </button>

          {isModalOpen && (
            <div ref={modalRef} className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
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
