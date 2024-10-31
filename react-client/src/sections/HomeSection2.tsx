import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { fetcher, trackEndpoints } from '@utils/axios';
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
    <IoIosArrowRoundBack onClick={onClick} className={`arrow ${className} z-10 `} style={{ color: 'white' }} />
  );
}

function SampleNextArrow(props: CustomArrowProps) {
  const { className, onClick } = props;
  return (
    <IoIosArrowRoundForward onClick={onClick} className={`arrow ${className}`} style={{ color: 'white' }} />
  );
}

export default function HomeSection2() {
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeModalTrack, setActiveModalTrack] = useState<TrackWithArtistResponse | null>(null);
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();

  const settings = {
    dots: true,
    infinite: true,
    lazyLoad: 'progressive' as const,
    speed: 800,
    slidesToScroll: 1,
    slidesToShow: 2,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,

    draggable: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          draggable: true,
        },
      },
    ],
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
      const [endpoint, params] = trackEndpoints.getTracks({
        minWeeksOnChart: 30,
        withArtists: true,
        sort: 'random' as const,
      });
      const response = await fetcher<TrackWithArtistResponse[]>(endpoint, params);

      setTracks(response);
    } catch (err) {
      setError(err as unknown as Error);
    } finally {
      setLoading(false);
    }
  };

  const renderModal = (track: TrackWithArtistResponse) => {
    if (!activeModalTrack || activeModalTrack.id !== track.id) return null;
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white z-30 rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto" ref={modalRef}>
          <div className="w-[40rem] sm:w-[50rem] h-[30rem] sm:h-[35rem] overflow-auto">
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
    <div className="w-full bg-[#eaeff8] flex justify-center items-center py-[10rem]">
      <div>
        <div className="relative">
          <div className="absolute right-1/2 transform -translate-y-[80%] translate-x-[110px] w-[200px] h-[200px] bg-cover bg-center " style={{ backgroundImage: "url('lineChartBg.png')" }}>
          </div>

          <h2 className="relative text-center text-[#444746] text-2xl md:text-3xl lg:text-4xl m-8">여러 플렛폼을 한번에</h2>
        </div>

        <h3 className="relative text-center text-[#444746] mb-12">플랫폼별로 서로 다른 차트 순위를 한눈에 비교해보세요.</h3>

        <Slider {...settings} className="xl:w-[80rem] lg:w-[60rem] sm:w-[30rem] w-[22rem] ">
          {contents}
        </Slider>
      </div>
    </div>
  );
}
