/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */

import { SearchTrackContainer } from '@layouts/SearchTrackContainer';
import { Color, SelectedTrack } from '@pages/ExplorePage';

import { useEffect, useRef, useState } from 'react';
import { Updater } from 'use-immer';

interface Prob{
    selectedTracks: SelectedTrack[]; // 상태 값
    setSelectedTracks: Updater<SelectedTrack[]>;
}

export default function ExploreSection1({
  setSelectedTracks,
  selectedTracks,
}:Prob) {
  const colorArray = Object.values(Color);
  const totalBoxes = selectedTracks.length;
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLInputElement>(null);

  function calculateBoxWidth() {
    const gap = 2 * (totalBoxes - 1);
    if (containerWidth < 640) {
      return '100%';
    }
    if (totalBoxes <= 3) {
      return `${(containerWidth - gap * 8) / totalBoxes}px`;
    }
    return `${(containerWidth - gap * 8) / 3}px`;
  }

  useEffect(() => {
    if (selectedTracks.length === 1) {
      setSelectedTracks((draft) => {
        draft.forEach((box) => { box.activate = true; });
      });
    }
    const additionalBoxRenderCondition = !!(
      selectedTracks[selectedTracks.length - 1]?.track && selectedTracks.length < 6);

    if (additionalBoxRenderCondition) {
      setSelectedTracks((draft) => {
        draft.push({
          id: draft.length,
          activate: false,
          color: colorArray[draft.length],
          track: null,
        });
      });
    }
  }, [selectedTracks]);

  // 브라우저 리사이즈 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width } = entry.contentRect;
      setContainerWidth(width);
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.unobserve(container);
    };
  }, [containerRef]);

  return (
    <section
      ref={containerRef}
      className="flex flex-wrap gap-2 items-center justify-center mt-[5rem] w-[100%] md:w-[90%] lg:w-[80%]"
    >
      {selectedTracks.map((selectedTrack, index) => (
        <SearchTrackContainer
          key={index}
          setSelectedTracks={setSelectedTracks}
          selectedTrack={selectedTrack}
          calculateBoxWidth={calculateBoxWidth} />
      ))}

    </section>
  );
}
