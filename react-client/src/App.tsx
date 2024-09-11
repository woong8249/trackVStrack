import logo from './assets/logo.png';
import textLogo from './assets/text-logo.png';
import tracks from './assets/track.json';
import TrackOverview from '@components/TrackOverview';

function App() {
  return (
    <div className="bg-black min-h-screen min-w-[35rem] ">
      <div className="flex justify-center items-center pt-[2rem] mb-[1rem]">
        <img alt="logo" src={logo} className='w-[8rem]' />
        <img alt="logo" src={textLogo} className='w-[16rem] h-[3rem]' />
      </div>

      <h1 className="text-red-500 text-center text-[1.5rem] md:text-[2rem] lg:text-[3rem] font-bold mb-[3rem]">
        "Easily View and Compare Track Charts."
      </h1>

      <span className="text-white flex justify-center items-center text-center text-[0.8rem] md:text-[1.2rem] mb-[3rem]">
        "당신의 최애곡의 차트 퍼포먼스를 간편히 확인하세요.
        {' '}
        <br></br>
        {' '}
        또 서로 다른 차트와도 비교해 보세요."
      </span>

      <div className="flex justify-center items-center mb-[5rem]">
        <button className="bg-red-500 text-white py-[0.5rem] px-[1rem] font-bold rounded hover:bg-red-800">
          Get Started
        </button>
      </div>

      <div className=' flex justify-center items-center gap-[1rem] flex-wrap pb-[3rem]'>
        {tracks.map((track) => <TrackOverview key= {track.id} track={track} />)}
      </div>
    </div>
  );
}

export default App;
