import { useState } from 'react';
import SearchBar from '@components/SearchBar';

export default function SearchModal() {
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  return (
    <div className='w-full' >
      <SearchBar >
        <input
        type="text"
        placeholder="Search Track or Artist Name"
        onClick={() => { setIsModalOpen(true); }}
        onFocus={(e) => e.target.blur()}
        className="bg-gray-100 rounded-full focus:outline-none flex-grow px-4 py-2 "
      />
      </SearchBar>

      {isModalOpen && (

        <div className="bg-black bg-opacity-50 min-w-[20rem] fixed inset-0 z-50 flex items-center justify-center" >
          <div className='bg-white rounded-3xl h-[90vh]'>
            <div className='w-[60vw] px-[2rem] py-[1.5rem]'>
              <SearchBar ></SearchBar>
            </div>

            <button
            className="fixed top-4 right-4 text-gray-600 hover:text-gray-800 font-bold text-[2.5rem]"
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 버블링 방지
              setIsModalOpen(false);
            }}>
              ×
            </button>
          </div>

        </div>

      ) }

    </div>
  );
}
