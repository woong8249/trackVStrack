import sample from '@constants/sample.json';
import { TrackComparisonContainer } from '@layouts/TrackComparisonContainer';
import { SelectedTrack } from '@pages/ExplorePage';

export function HomeSection2() {
  return (
    <div className="w-full bg-[#eaeff8]  flex  flex-col justify-center items-center py-[7rem] xl:py-[13rem]">
      <div>
        <div className="relative">
          <div
            className="absolute transform bg-cover bg-center
            w-[100px] h-[100px]  right-1/3 -translate-y-[90%]
            xl:right-1/2 xl:-translate-y-[90%] xl:translate-x-[100px] xl:w-[200px] xl:h-[200px]  "
            style={{
              backgroundImage: "url('lineChartBG2.png')",
              backgroundSize: 'contain', // 비율을 유지하며 이미지가 컨테이너에 맞춰짐
              backgroundRepeat: 'no-repeat', // 이미지를 반복하지 않음
            }}>
          </div>

          <h2 className="relative text-center text-[#444746] text-2xl md:text-3xl lg:text-4xl m-8">트랙간의 차트성적 비교</h2>
        </div>

        <h3 className="relative text-center text-[#444746] mb-12">여러 트랙의 차트성적을 비교해보세요.</h3>
      </div>

      <div className='w-[100vw] sm:w-[80vw] flex items-center gap-4'>
        <TrackComparisonContainer selectedTracks={sample as SelectedTrack[]} />
      </div>

    </div>
  );
}
