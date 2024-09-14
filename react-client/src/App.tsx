import logo from './assets/logo.png';
import tracks from './assets/track.json';
import TrackOverview from '@components/TrackOverview';

function App() {
  return (
    <div className="bg-[#fff] text-[#3D3D3D]  min-h-screen min-w-[35rem] ">
      <div className="flex justify-center items-center gap-2 pt-[2rem] mb-[1rem]">
        <img alt="logo" src={logo} className='w-[8rem]' />

        <h1 className="text-4xl font-bold italic text-shadow">
          TRACK VS TRACK
        </h1>
      </div>

      <div className="border-b-2 w-3/4 mx-auto"></div>

      <h1 className="text-[black] text-center text-[1.5rem] md:text-[2rem] lg:text-[3rem] font-bold m-[3rem] text-shadow">
        "Easily View and Compare Track Charts."
      </h1>

      <span className="flex justify-center items-center font-[400] text-center text-[0.8rem] md:text-[1.2rem] mb-[3rem] text-[#9A9A9A]">
        "당신의 최애곡의 차트 퍼포먼스를 간편히 확인하세요.
        {' '}
        <br></br>
        {' '}
        또 서로 다른 차트와도 비교해 보세요."
      </span>

      <div className="flex justify-center items-center mb-[5rem]">
        <button className="bg-[#b4ec51] text-[black] py-[0.5rem] px-[1rem] font-bold rounded hover:bg-[#9ab867]">
          Get Started
        </button>
      </div>

      <div className=' flex justify-center items-center gap-[2rem] flex-wrap pb-[3rem]'>
        {tracks.map((track) => <TrackOverview key= {track.id} track={track} />)}
      </div>
    </div>
  );
}

export default App;
