import TopNavBar from '@layouts/TopNavBar';
import { useState } from 'react';

export default function Dashboard() {
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);

  return (
    <div className="p-[1rem] h-screen">
      {/* 상단 헤더 */}
      <TopNavBar page={'dashboard'}></TopNavBar>

      {/* 대시보드 섹션 */}
      <div className="p-[2rem] min-h-screen min-w-[1200px] grid grid-cols-7 gap-4 mt-[4rem]">

        {/* 트랙 섹션 - 5 부분 차지 */}
        <div className="col-span-5 flex flex-col">
          <h3 className="font-bold text-2xl  mb-4">Tracks</h3>

          <div className="border-[1px] border-gray-300 h-[35rem] overflow-auto flex justify-center items-center shadow-md rounded-md">
            {/* Tracks content */}
          </div>
        </div>

        {/* 아티스트 섹션 - 2 부분 차지 */}
        <div className="col-span-2 flex flex-col">
          <h3 className="font-bold text-2xl mb-4">Artists</h3>

          <div className="border-[1px] border-gray-300 h-[35rem] overflow-auto flex justify-center items-center shadow-md rounded-md">
            {/* Artists content */}
          </div>
        </div>

        {/* 분석 섹션 */}
        <div className="col-span-7 flex flex-col mt-[2rem]">
          <h3 className="font-bold text-2xl mb-4">Analysis</h3>

          <div className="border-[1px] border-gray-300] h-[20rem] overflow-auto flex justify-center items-center shadow-md rounded-md">
            {/* Analysis content */}
          </div>
        </div>
      </div>
    </div>
  );
}
