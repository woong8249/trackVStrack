import { useNavigate } from 'react-router-dom';
import { useRouteError } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  console.error(error);

  useEffect(() => {
    // 카운트다운을 감소시키는 타이머
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // 4초 후 이전 페이지로 이동하는 타이머
    const navigateTimer = setTimeout(() => {
      navigate(-1);
    }, 4000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className="text-center mt-[5rem]">
      <h1 className="mb-4 text-6xl font-semibold text-red-500">404</h1>
      <p className="mb-4 text-lg text-gray-600">Oops! Looks like you're lost.</p>

      <div className="animate-bounce">
        <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
      </div>

      <p className="mt-4 text-gray-600">
        Redirecting you back in
        {' '}
        <span className="font-bold text-red-500">{countdown}</span>
        {' '}
        seconds...
      </p>

      <p className="mt-4 text-gray-600">
        Or go directly
        <a href="/" className="text-blue-500">{' home'}</a>
        .
      </p>
    </div>
  );
}

export default ErrorPage;
