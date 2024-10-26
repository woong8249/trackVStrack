interface LoadingSpinnerProps {
  size?: number; // 사이즈를 조정할 수 있는 프롭스 (기본값 설정 가능)
}

export default function LoadingSpinner({ size = 16 }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center m-8">
      <div
        className="animate-spin rounded-full border-t-4 border-blue-300 border-opacity-75"
        style={{ height: `${size * 4}px`, width: `${size * 4}px`, borderWidth: `${size / 4}px` }}
      />
    </div>
  );
}
