import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Logo() {
  return (
    <Link to={'/'}>
      <div className="flex justify-center items-center gap-2 min-w-[150px] md:min-w-[300px]">
        <img
        alt="logo"
        src={logo}
        className='min-w-[60px] max-w-[100px]'
        />

        <h1 className= 'min-w-[220px] text-[1.5rem] sm:text-[2rem]  font-bold italic text-shadow'>
          TRACK VS TRACK
        </h1>
      </div>
    </Link>
  );
}
