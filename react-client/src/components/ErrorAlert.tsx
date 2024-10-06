interface Prob {
    error: Error
    retryFunc : ()=>void

}
export default function ErrorAlert({ error, retryFunc }:Prob) {
  console.error(error);
  const errorMessage = 'Something went wrong. Please try again';
  return (
    <div className="flex flex-col justify-center items-center mt-8">
      {/* 에러 아이콘 */}
      <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-16 h-16 text-red-500 mb-4"
    >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
      />
      </svg>

      <p className="text-lg font-semibold text-red-500">{errorMessage}</p>

      <button
      onClick={retryFunc}
      className="mt-4 px-4 py-2 font-bold bg-blue-500 text-white rounded hover:bg-blue-600"
    >
        Retry
      </button>
    </div>
  );
}
