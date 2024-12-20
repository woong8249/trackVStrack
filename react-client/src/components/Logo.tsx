import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to={'/'}>
      <div className="flex justify-center items-center gap-2 mx-[1rem]">
        {/* Logo Image */}
        <img
          alt="logo"
          src={'logo/logo.png'}
          className="w-[3rem] h-[3rem]"
        />

        {/* Title */}
        <h1 className="text-lg font-bold italic ">
          TRACK VS TRACK
        </h1>
      </div>
    </Link>
  );
}
