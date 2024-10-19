import { useState, useEffect } from 'react';
import homeMessages from '../constants/homeMessages';
import TopNavBar from '@components/type2/TopNavBar';

export default function Test2MainPage() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false); // 텍스트 페이드 효과
  const intervalTime = 3000;

  useEffect(() => {
    const messageInterval = setTimeout(() => {
      setFadeOut(true); // 페이드 아웃 시작
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % homeMessages.length);
        setFadeOut(false); // 페이드 인
      }, 500);
    }, intervalTime);

    return () => {
      clearTimeout(messageInterval);
    };
  }, [currentMessageIndex]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gray-100">
      <TopNavBar currentPage="home" />

      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/lineBg.jpg)', // 경로 앞에 'url()' 추가
          opacity: 0.2,
        }}
      />

      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-20">
        <div className="w-full lg:w-[464px] h-[150px] mb-[4rem]">
          <div className={`p-10 text-3xl lg:text-4xl text-left transition-opacity duration-500 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            {homeMessages[currentMessageIndex]}
          </div>
        </div>

        {/* 검색 입력란 */}
        <div className="relative w-full sm:w-[544px]">
          <input
            type="text"
            className="w-full px-6 py-5 lg:py-6 border border-gray-300 rounded-full focus:outline-none pr-16"
            placeholder="곡명 또는 아티스트명을 입력하세요"
          />

          <button className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-600 transition duration-300">
            탐색
          </button>
        </div>
      </section>
    </div>
  );
}
