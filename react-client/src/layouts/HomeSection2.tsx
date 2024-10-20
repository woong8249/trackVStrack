/* eslint-disable jsx-a11y/click-events-have-key-events */
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { tracksApi } from '@utils/axios';
import LoadingSpinner from '@components/LoadingSpinner';
import ErrorAlert from '@components/ErrorAlert';
import TrackInfoCard from '@components/TrackInfoCard';
import ChartGraph from '@components/ChartGraph';
import { useModal } from '@hooks/useModal';
import { FaExpandAlt } from 'react-icons/fa';
import { TrackWithArtistResponse } from '@typings/track';
import Slider, { CustomArrowProps } from 'react-slick';
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from 'react-icons/io';

function SamplePrevArrow(props: CustomArrowProps) {
  const { className, onClick } = props;
  return (
    <IoIosArrowRoundBack onClick={onClick} className={`arrow ${className} z-10`} style={{ color: 'white' }} />
  );
}

function SampleNextArrow(props: CustomArrowProps) {
  const { className, onClick } = props;
  return (
    <IoIosArrowRoundForward onClick={onClick} className={`arrow ${className} z-10`} style={{ color: 'white' }} />
  );
}

export default function HomeSection2() {
  const sliderRef = useRef<Slider | null>(null);
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeModalTrack, setActiveModalTrack] = useState<TrackWithArtistResponse | null>(null);
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();

  const settings = {
    infinite: true,
    lazyLoad: 'progressive' as const,
    speed: 600,
    slidesToScroll: 2,
    slidesToShow: 2,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    waitForAnimate: false,
    draggable: false,

    afterChange: (currentSlide: number) => {
      if (currentSlide === 0) {
        sliderRef.current?.slickGoTo(2);
      }
    },
    onInit: () => {
      if (sliderRef.current) {
        setTimeout(() => {
          sliderRef.current?.slickNext();
        }, 300);
      }
    },
  };

  const handleModalOpen = (track: TrackWithArtistResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModalTrack(track); // 클릭한 트랙의 모달을 활성화
    setIsModalOpen(true); // 모달을 열기
  };

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tracksApi.getTracks({
        minWeeksOnChart: 30,
        withArtists: true,
        sort: 'random',
      }) as TrackWithArtistResponse[];
      setTracks(response);
    } catch (err) {
      setError(err as unknown as Error);
    } finally {
      setLoading(false);
    }
  };

  // 모달을 렌더링하는 함수
  const renderModal = (track: TrackWithArtistResponse) => {
    if (!activeModalTrack || activeModalTrack.id !== track.id) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          ref={modalRef}
          className="bg-white z-50 rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto"
          onClick={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
        >
          <div className="w-[40rem] sm:w-[50rem] h-[25rem] sm:h-[35rem] overflow-auto">
            <TrackInfoCard track={track} />
            <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
            <ChartGraph track={track} />
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  const renderSlides = () => tracks.map((track) => (
    <div key={track.id.toString()} className="w-[600px] p-2">
      <div className="relative">
        <div className="border-[1px] bg-[white] border-gray-300 rounded-md relative">
          <TrackInfoCard track={track} />
          <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
          <ChartGraph track={track} />
        </div>

        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => handleModalOpen(track, e)}
            className="bg-transparent text-green-600 p-2 rounded-full hover:text-green-800"
          >
            <FaExpandAlt size={20} />
          </button>
        </div>

        {/* 모달 렌더링 */}
        {isModalOpen && renderModal(track)}
      </div>
    </div>
  ));

  const contents = renderSlides();

  useEffect(() => {
    fetchTracks();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} retryFunc={fetchTracks} />;

  return (
    <div className="w-full bg-gray-100 flex justify-center items-center py-[10rem]">
      <div>
        <h2 className="text-center text-[#444746] text-2xl md:text-3xl lg:text-4xl m-8">
          여러 플렛폼을 한번에
        </h2>

        <h3 className="text-center text-[#444746] mb-12">
          플랫폼마다 조금씩 상이한 차트순위를 한번에 살펴보세요.
        </h3>

        <Slider ref={sliderRef} {...settings} className="w-[70rem]">
          <div></div>
          <div></div>
          {contents}
        </Slider>
      </div>
    </div>
  );
}
