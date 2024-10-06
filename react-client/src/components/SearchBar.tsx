/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useModal } from '@hooks/useModal';
import ModalSearch from './ModalSearch';

export function SearchBar() {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();

  return (
    <div className="flex-grow mx-4">
      <div className="relative">
        {/* 첫 번째 검색창 (외부 검색창) */}
        <input
          type="text"
          placeholder="Search for tracks or artists..."
          onClick={() => setIsModalOpen(true)} // 클릭 시 모달 열림
          className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* 검색 아이콘 */}
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

      {/* 모달: 검색 결과 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          {/* 모달 컨텐츠 */}
          <div
            ref={modalRef}
            className="bg-white w-full max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-lg max-h-[40rem] min-h-[70vh] overflow-y-auto p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
            >
            {/* 모달 내부의 검색 상태를 따로 관리 */}
            <ModalSearch />
          </div>
        </div>
      )}
    </div>
  );
}
