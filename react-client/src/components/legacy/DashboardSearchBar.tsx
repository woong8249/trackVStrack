import { useModal } from '@hooks/useModal';
import DashboardModalSearch from './legacy/DashboardModalSearch';
import { CiSearch } from 'react-icons/ci';

export default function DashboardSearchBar() {
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
          <CiSearch className="w-5 h-5 font-bold " />
        </div>
      </div>

      {/* 모달: 검색 결과 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          {/* 모달 컨텐츠 */}
          <div
            ref={modalRef}
            className="bg-white w-full max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-lg max-h-[40rem] min-h-[70vh] overflow-y-auto p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            {/* 모달 내부의 검색 상태를 따로 관리 */}
            <DashboardModalSearch />
          </div>
        </div>
      )}
    </div>
  );
}
