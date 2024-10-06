export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
    </div>
  );
}
