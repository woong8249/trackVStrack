import { useModal } from '@hooks/useModal';
import { TrackComparisonContainer } from '@layouts/TrackComparisonContainer';
import { RxQuestionMarkCircled } from 'react-icons/rx';

export default function ExploreSection2() {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  return (
    <section className="flex flex-wrap gap-2 items-center justify-center mt-[5rem] text-gray-700 w-[100%] md:w-[90%] lg:w-[80%]">
      <div className='bg-white w-full rounded-md'>

        <div className="flex items-center mb-8">
          <div className="text-base px-2">📉 트랙간 차트 비교</div>

          <button onClick ={(e) => { e.stopPropagation(); setIsModalOpen((pre) => !pre); }}>
            <RxQuestionMarkCircled size={20} />
          </button>

          { isModalOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
            <div ref={modalRef} className="px-4 py-4 flex flex-col justify-start items-start bg-white rounded-lg max-w-md">
              <div className='mb-4 text-lg text-gray-600'>📈 트랙간 플랫폼별 차트 비교 </div>

              <p className="mb-2 text-gray-400">
                각 트랙의 플랫폼별 성적을 비교해 보세요.
              </p>

              <p className="text-gray-400">
                타이틀 옆 달력 버튼을 통해 특정 기간을 필터할 수 있습니다.
              </p>
            </div>
          </div>

          )}

        </div>

        <TrackComparisonContainer />

      </div>
    </section>
  );
}
