import { SyntheticEvent, useState, useRef } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

function DynamicResizableComponent() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const initialWidth = useRef(width);
  const initialHeight = useRef(height);
  const zIndex = isResizing ? 10 : 1;
  const position: 'relative' | 'absolute' = isResizing ? 'absolute' : 'relative';

  // 리사이즈 시작 시 z-index 증가, 플레이스홀더를 위한 크기 고정
  const handleResizeStart = () => {
    initialWidth.current = width; // 리사이즈 시작 시 width 고정
    initialHeight.current = height; // 리사이즈 시작 시 height 고정
    setIsResizing(true); // 리사이즈 중임을 상태로 관리
  };

  // 리사이즈 중에 크기 변경
  const handleResize = (_e: SyntheticEvent, { size }: ResizeCallbackData) => {
    setWidth(size.width);
    setHeight(size.height);
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', padding: '20px' }}>
      {isResizing && (
        <div
          style={{
            width: `${initialWidth.current}px`, // 리사이즈 시작 시의 고정된 width
            height: `${initialHeight.current}px`, // 리사이즈 시작 시의 고정된 height
            display: 'inline-block', // 원래 자리 차지
            visibility: 'hidden', // 공간을 차지하되 보이지 않도록 설정
          }}
        />
      )}

      {/* 실제 리사이징되는 컴포넌트 */}
      <div
        style={{
          position, // 리사이징 중일 때는 absolute로 설정
          zIndex, // 리사이징 중일 때 더 높은 레이어에 위치
          top: position === 'absolute' ? '0' : undefined,
          left: position === 'absolute' ? '0' : undefined,
          width: `${width}px`,
          height: `${height}px`,
          transition: 'all 0.1s ease', // 애니메이션 속도 설정
        }}
      >
        <Resizable
          width={width}
          height={height}
          onResize={handleResize}
          onResizeStart={handleResizeStart} // 리사이즈 시작
          onResizeStop={handleResizeStop} // 리사이즈 끝
          minConstraints={[100, 100]}
          maxConstraints={[800, 400]}
        >
          <div
            style={{
              width: '100%', height: '100%', border: '1px solid black', padding: '10px',
            }}
          >
            <p>
              Width:
              {width}
              px
            </p>

            <p>
              Height:
              {height}
              px
            </p>
          </div>
        </Resizable>
      </div>
    </div>
  );
}

export default DynamicResizableComponent;
