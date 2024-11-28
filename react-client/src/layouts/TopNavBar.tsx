import Logo from '@components/Logo';
import { useModal } from '@hooks/useModal';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {
  FiHome, FiSearch, FiMenu,
  //  FiTrendingUp,
} from 'react-icons/fi';
import { MdInfoOutline } from 'react-icons/md';
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
  const [isServiceInfoOpen, setIsServiceInfoOpen] = useState(false); // 서비스 소개 아코디언 상태

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

              {/* <div className="relative">
                <Link to={'/realtime'}>
                  실시간
                </Link>

                <div className={getBorderClass('realtime')} />
              </div> */}
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

          {/* <Link to="/realtime" className={`flex items-center p-5 rounded-full ${currentPage === 'realtime' ? 'bg-[#c2e7ff]' : 'hover:bg-gray-100'}`}>
            <FiTrendingUp className="mr-4 w-5 h-5" />
            실시간
          </Link> */}

          <hr className="border-gray-300 my-4" />

          {/* 서비스 소개 */}
          <div
            className="flex flex-col"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsServiceInfoOpen((prev) => !prev); }}
              className="flex items-center p-5 rounded-full hover:bg-gray-100 cursor-pointer">
              <MdInfoOutline className="mr-4 w-5 h-5" />
              서비스 소개

              {isServiceInfoOpen ? (
                <FaChevronUp className="ml-auto w-4 h-4" />
              ) : (
                <FaChevronDown className="ml-auto w-4 h-4" />
              )}
            </button>

            {/* 아코디언 내용 */}
            {isServiceInfoOpen && (
            <div className="ml-9 mt-2 text-gray-500 text-sm">
              <p className="mb-2">
                이 서비스는 플랫폼 차트 성과를 쉽게 비교하고 분석할 수 있도록 도와줍니다.
              </p>

              <p className="mb-2">
                <span className="font-semibold text-gray-800">2013년부터의 주간 차트</span>
                를 대상으로 하며, 현재는
                {' '}
                <span className="font-semibold text-gray-800">멜론, 지니, 벅스</span>
                {' '}
                플랫폼을 지원합니다.
              </p>

              <p className="mb-2">
                차후
                <span className="font-semibold text-gray-800">YouTube Music, Spotify, VIBE</span>
                {' '}
                플랫폼이 추가될 예정입니다.
              </p>

              <p className="mb-2">
                모든 플랫폼이 공통적으로
                {' '}
                <span className="font-semibold text-gray-800">주간 차트</span>
                를 제공하기에, 일관된 비교를 위해 주간차트를 대상으로 합니다.
              </p>

              <p className="mt-4">
                추가적인 요구사항이나 문의사항이 있으시면 언제든지
                {' '}

                <span
                className="font-bold text-blue-600 hover:underline"
                >
                  woong8249@gmail.com
                </span>

                {' '}
                으로 연락해주세요.
              </p>
            </div>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
}

export default TopNavbar;
