import Logo from '@components/Logo';
import { useModal } from '@hooks/useModal';
import React from 'react';
import {
  FiHome, FiSearch, FiTrendingUp, FiMessageSquare, FiMenu,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

type TopNavbarProps = {
  currentPage: 'home'|'explore'|'realtime';
};

function TopNavbar({ currentPage }: TopNavbarProps) {
  const {
    isModalOpen,
    setIsModalOpen,
    modalRef,
  } = useModal();

  function handleToggleButton(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsModalOpen((prev) => !prev);
  }

  // 페이지 아래에 효과를 주는 함수
  function getBorderClass(page: string) {
    return currentPage === page ? 'absolute top-10 left-0 w-full h-1 bg-blue-500 rounded-t-full' : '';
  }

  return (
    <div className='relative z-10'>
      <nav className="fixed top-0 right-0 z-10 w-full bg-white border-b border-gray-200">
        <div className="z-10 flex items-center justify-between px-4 pr-8 py-2">
          <div className="flex items-center">
            <Logo />

            <div className="hidden md:flex space-x-14 ml-8 text-gray-500">
              <div className="relative">
                <Link to={'/'} >
                  홈
                </Link>

                <div className={getBorderClass('home')} />
              </div>

              <div className="relative">
                <Link to={'/explore'}>
                  탐색
                </Link>

                <div className={getBorderClass('explore')} />
              </div>

              <div className="relative">
                <Link to={'/realtime'}>
                  실시간
                </Link>

                <div className={getBorderClass('realtime')} />
              </div>
            </div>
          </div>

          <div>
            <button onClick={handleToggleButton} className='hover:bg-gray-300 rounded-full p-2'>
              <FiMenu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* 모달에 애니메이션 추가 */}
      <nav
      ref={modalRef}
        className={`fixed top-0 right-0 z-5 h-full bg-white shadow-md w-[20rem] transition-transform transform duration-300 ${
          isModalOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col  p-2 mt-16 text-gray-500">
          <Link to="/" className={`flex items-center p-5 rounded-full ${currentPage === 'home' ? 'bg-[#c2e7ff]' : 'hover:bg-gray-100'}`}>
            <FiHome className="mr-4 w-5 h-5" />
            홈
          </Link>

          <Link to="/explore" className={`flex items-center p-5 rounded-full ${currentPage === 'explore' ? 'bg-[#c2e7ff]' : 'hover:bg-gray-100'}`}>
            <FiSearch className="mr-4 w-5 h-5" />
            탐색
          </Link>

          <Link to="/realtime" className={`flex items-center p-5 rounded-full ${currentPage === 'realtime' ? 'bg-[#c2e7ff]' : 'hover:bg-gray-100'}`}>
            <FiTrendingUp className="mr-4 w-5 h-5" />
            실시간 인기
          </Link>

          <hr className="border-gray-300 my-4" />

          {/* 의견 보내기 */}
          <Link to="/feedback" className="flex items-center p-5 rounded-full hover:bg-gray-100">
            <FiMessageSquare className="mr-4 w-5 h-5" />
            의견 보내기
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default TopNavbar;
