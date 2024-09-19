import { FaSearch } from 'react-icons/fa'; // Font Awesome 아이콘 사용
import React, {
  Dispatch, SetStateAction,
} from 'react';

interface SearchBarProps {
  children?: React.ReactNode; // children의 타입을 React.ReactNode로 정의
  query? :string
  setQuery? :Dispatch<SetStateAction<string>>
  // setTracks? :Dispatch<SetStateAction<Track[]>>
}

export default function SearchBar({ children, setQuery, query }:SearchBarProps) {
  const input = setQuery ? (
    <input
        type="text"
        placeholder="Search Track or Artist Name"
        value={query}
        onChange={(e) => (setQuery(e.target.value))}
        className="bg-gray-100  rounded-full  focus:outline-none flex-grow px-4 py-2 "
      />
  ) : (
    <input
      type="text"
      placeholder="Search Track or Artist Name"
      className="bg-gray-100  rounded-full  focus:outline-none flex-grow px-4 py-2 "
      />
  );

  return (
    <div className="  bg-gray-100 shadow-md rounded-full  flex items-center p-1  min-w-[240px]">
      <div className="text-gray-400 ml-3">
        <FaSearch />
      </div>

      {children || input}
    </div>

  );
}
