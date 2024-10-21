import { useEffect, useState } from 'react';
import homeMessages from '../constants/homeMessages';
import HomeExploreBar from '@components/type2/homeExplorebar';

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
    <section className='w-full pt-[10rem] pb-[10rem] bg-slate-50 relative z-5'>
      <div className='flex flex-col lg:flex-row justify-center items-center h-[300px] relative lg:right-[4rem]'>
        <div className={`w-[340px] text-left text-2xl md:text-3xl lg:text-4xl mb-8 lg:mb-0 transition-opacity duration-500 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          {homeMessages[currentMessageIndex]}
        </div>

        <HomeExploreBar></HomeExploreBar>

      </div>
    </section>
  );
}
