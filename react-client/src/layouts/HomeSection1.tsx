import { useEffect, useState } from 'react';
import homeMessages from '../constants/homeMessages';

export default function HomeSection1() {
  const intervalTime = 3000;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false); // 텍스트 페이드 효과

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
    <section className='w-full pt-[10rem] pb-[10rem] bg-slate-50'>
      <div className='flex flex-col lg:flex-row justify-center items-center h-[300px] relative lg:right-[4rem]'>
        <div className={`w-[340px] text-left text-2xl md:text-3xl lg:text-4xl mb-8 lg:mb-0 transition-opacity duration-500 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          {homeMessages[currentMessageIndex]}
        </div>

        <div className='relative lg:left-[2rem] '>
          <input
              type="text"
              className="w-[380px] md:w-[450px] lg:w-[540px] h-[66px] p-8 border border-gray-300 rounded-full focus:outline-none"
              placeholder="곡명 또는 아티스트명을 입력하세요"
            />

          <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-blue-500 text-white px-8 py-2 rounded-full shadow-md hover:bg-blue-600 transition duration-300">
            탐색
          </button>
        </div>
      </div>
    </section>
  );
}
