/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */

import { Color, SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { Updater } from 'use-immer';
import SearchTrackBox from './SearchTrackBox';

interface Prob{
  selectedTracks: SelectedTrack[]; // 상태 값
  setSelectedTracks: Updater<SelectedTrack[]>;
  updateUrl : (tracks:SelectedTrack[]) => void
  containerWidth: number,
}

export function SearchTrackContainer({
  setSelectedTracks,
  selectedTracks,
  updateUrl,
  containerWidth,
}:Prob) {
  const additionalBoxRenderCondition = !!(
    selectedTracks[selectedTracks.length - 1]?.track && selectedTracks.length < 6);
  const additionalBoxRenderCondition2 = selectedTracks.length === 0;

  const totalBoxes = selectedTracks.length + ((additionalBoxRenderCondition
    || additionalBoxRenderCondition2) ? 1 : 0);
  const colorArray = Object.values(Color);

  function selectTrack(id: number, selectedTrack: TrackWithArtistResponse) {
    setSelectedTracks((draft) => {
      const isSameTrack = draft.some((item) => selectedTrack.id === item?.track?.id);
      if (isSameTrack) {
        alert('이미 선택된 곡입니다.');
        return;
      }
      const trackIndex = draft.findIndex((item) => item.id === id);
      if (trackIndex !== -1) {
        draft[trackIndex].track = selectedTrack;
        updateUrl(draft);
      }
    });
  }

  function deleteTrack(id: number) {
    setSelectedTracks((draft) => {
      const index = draft.findIndex((box) => box.id === id);
      if (index !== -1) {
        draft[index].track = null;
      }
    });
  }

  function addSelectBox(id:number) {
    setSelectedTracks((draft) => {
      draft.push({
        id, activate: true, color: colorArray[id], track: null,
      });
    });
  }

  function deleteSelectBox(id: number) {
    setSelectedTracks((draft) => {
      // 해당 id를 가진 박스를 배열에서 삭제
      const index = draft.findIndex((box) => box.id === id);
      if (index !== -1) {
        draft.splice(index, 1); // 배열에서 해당 인덱스의 요소를 제거
      }
    });
  }

  function calculateBoxWidth() {
    const gap = 2 * (totalBoxes - 1);
    if (containerWidth < 640) {
      return '100%';
    }
    if (totalBoxes <= 3) {
      return (containerWidth - gap * 8) / totalBoxes;
    }
    return (containerWidth - gap * 8) / 3;
  }

  if ((additionalBoxRenderCondition || additionalBoxRenderCondition2)) {
    return (
      <div style={{ width: calculateBoxWidth() }}>
        <SearchTrackBox
          selectedTrack={{
            id: selectedTracks.length,
            activate: false,
            color: colorArray[selectedTracks.length],
            track: null,
          }}
          selectTrack={selectTrack}
          addSelectBox={addSelectBox}
          deleteSelectBox={deleteSelectBox}
          deleteTrack={deleteTrack}
        />
      </div>
    );
  }

  return (
    <div style={{ width: calculateBoxWidth() }}>
      <SearchTrackBox
            selectedTrack={selectedTrack}
            selectTrack={selectTrack}
            addSelectBox={addSelectBox}
            deleteSelectBox={deleteSelectBox}
            deleteTrack={deleteTrack}
          />
    </div>
  );
}
