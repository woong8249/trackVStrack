/* eslint-disable no-unused-vars */
import DraggableBox from '@components/DraggableBox';
import { ReactNode, useState } from 'react';
import { DraggableData } from 'react-draggable';

interface Box {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const getOverlapArea = (
  boxes:Box[],
  x: number,
  y: number,
  width: number,
  height: number,
  currentBoxId: number,
): { overlapX: number; overlapY: number } | null => {
  const overlappingBox = boxes.find((box) => {
    if (box.id === currentBoxId) return false; // 자기 자신과는 비교하지 않음

    const isOverlappingX = x < box.x + box.width && x + width > box.x;
    const isOverlappingY = y < box.y + box.height && y + height > box.y;

    return isOverlappingX && isOverlappingY; // 교집합이 있으면 true
  });

  // 겹치는 박스가 있다면 교집합 영역 반환
  if (overlappingBox) {
    const overlapX = Math.max(overlappingBox.x, x);
    const overlapY = Math.max(overlappingBox.y, y);
    return { overlapX, overlapY }; // 교집합 영역 좌표 반환
  }

  return null; // 교집합이 없으면 null 반환
};

const findNearestNonOverlappingPosition = (
  boxes:Box[],
  overlapX: number,
  overlapY: number,
  width: number,
  height: number,
  currentBoxId: number,
): { x: number; y: number } => {
  const step = 10; // 이동할 단위

  // 4방향을 탐색하기 위한 초기 좌표와 방향 설정
  const directions = [
    { dx: 0, dy: -step, name: 'up' }, // 위로
    { dx: 0, dy: step, name: 'down' }, // 아래로
    { dx: -step, dy: 0, name: 'left' }, // 왼쪽으로
    { dx: step, dy: 0, name: 'right' }, // 오른쪽으로
  ];

  let nearestPosition = { x: overlapX, y: overlapY }; // 기본값은 교집합 위치
  let minDistance = Infinity; // 최소 이동 거리

  // 각 방향을 탐색
  directions.forEach((direction) => {
    let tempX = overlapX;
    let tempY = overlapY;
    let distance = 0;

    // 왼쪽으로 이동할 때는 박스의 왼쪽 끝을 기준으로 이동
    if (direction.name === 'left') {
      tempX -= width; // 박스의 왼쪽 끝을 기준으로 이동
    }

    // 위쪽으로 이동할 때는 박스의 상단 끝을 기준으로 이동
    if (direction.name === 'up') {
      tempY -= height; // 박스의 상단 끝을 기준으로 이동
    }

    // 해당 방향으로 계속 이동하며 겹치지 않는 공간을 찾음
    while (getOverlapArea(boxes, tempX, tempY, width, height, currentBoxId)) {
      tempX += direction.dx;
      tempY += direction.dy;
      distance += step; // 이동 거리를 누적
    }

    // 가장 적은 거리로 이동할 수 있는 방향을 선택
    if (distance < minDistance) {
      minDistance = distance;
      nearestPosition = { x: tempX, y: tempY };
    }
  });

  return nearestPosition; // 겹치지 않는 최단거리 위치 반환
};

interface Prob{
  box:Box
  boxes : Box[]
  setBoxes: (boxes:Box[]) =>void
  children: ReactNode
}

export default function DraggableBoxWrapper({
  box, boxes, setBoxes, children,
}:Prob) {
  const [draggingBox, setDraggingBox] = useState<Box | null>(null); // 드래그 중인 박스
  const [isDragging, setIsDragging] = useState<boolean>(false); // 드래그 상태
  const [overlapping, setOverlapping] = useState<boolean>(false); // 겹침 여부

  const handleDragStart = (box: Box) => {
    setDraggingBox(box);
    setIsDragging(true);
  };

  const handleDrag = (_e: MouseEvent, data: DraggableData, box: Box) => {
    const { x, y } = data;

    // 겹침 여부 확인
    const overlap = getOverlapArea(boxes, x, y, box.width, box.height, box.id);
    if (overlap) {
      setOverlapping(true);
    } else {
      setOverlapping(false);
    }
  };

  const handleDragStop = (_e: MouseEvent, data: DraggableData, box: Box) => {
    let { x, y } = data;
    const overlap = getOverlapArea(boxes, x, y, box.width, box.height, box.id);
    if (overlap) {
      const nearestPosition = findNearestNonOverlappingPosition(
        boxes,
        overlap.overlapX,
        overlap.overlapY,
        box.width,
        box.height,
        box.id,
      );
      x = nearestPosition.x;
      y = nearestPosition.y;
    }

    const updatedBoxes = boxes.map((b) => (b.id === box.id ? { ...b, x, y } : b));
    setBoxes(updatedBoxes);
    setDraggingBox(null);
    setIsDragging(false);
    setOverlapping(false);
  };

  return (
    boxes.length > 1 && (
    <DraggableBox
          key={box.id}
          box={box}
          handleDrag={handleDrag}
          handleDragStart={handleDragStart}
          handleDragStop={handleDragStop}
          draggingBox={draggingBox}
          isDragging={isDragging}
          overlapping={overlapping}
        >
      {children}
    </DraggableBox>
    )
  );
}
