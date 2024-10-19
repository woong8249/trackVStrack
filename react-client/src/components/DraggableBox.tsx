/* eslint-disable no-unused-vars */
import React from 'react';
import Draggable, { DraggableData } from 'react-draggable';

interface Box {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Prob {
    box:Box,
    handleDragStart: (box:Box) =>void,
    handleDrag : (_e: MouseEvent, data: DraggableData, box: Box)=>void
    handleDragStop : (_e: MouseEvent, data: DraggableData, box: Box) =>void
    draggingBox:Box | null
    isDragging:boolean
    overlapping:boolean
    children?: React.ReactNode; // children 속성 추가
  }

export default function DraggableBox({
  box, children, handleDragStart, handleDrag, handleDragStop, draggingBox, overlapping, isDragging,
}:Prob) {
  return (
    <>
      <Draggable
            defaultPosition={{ x: box.x, y: box.y }}
            onStart={() => handleDragStart(box)}
            onDrag={(e, data) => handleDrag(e as MouseEvent, data, box)}
            onStop={(e, data) => handleDragStop(e as MouseEvent, data, box)}
            position={{ x: box.x, y: box.y }} // 박스의 위치 고정
            // bounds="parent" // 박스가 부모 컨테이너 안에서만 움직이도록 제한
          >
        <div
              className={`absolute rounded-md ${
                overlapping && draggingBox?.id === box.id ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${box.width}px`,
                height: `${box.height}px`,
                cursor: draggingBox?.id === box.id ? 'grabbing' : 'grab',
              }}
            >
          {children && children }
        </div>
      </Draggable>

      {/* 드래그 중인 반투명한 복제 박스 */}
      {isDragging && draggingBox && (
      <div
          className="absolute bg-blue-500 opacity-50 rounded-md"
          style={{
            left: `${draggingBox.x}px`,
            top: `${draggingBox.y}px`,
            width: `${draggingBox.width}px`,
            height: `${draggingBox.height}px`,
            pointerEvents: 'none', // 마우스 이벤트 비활성화
          }}
        />
      )}
    </>
  );
}
