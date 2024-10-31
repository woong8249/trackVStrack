/* eslint-disable no-param-reassign */

import { Color, SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { Updater } from 'use-immer';
import SearchTrackBox from './SearchTrackBox';

interface Prob{
  setSelectedTracks: Updater<SelectedTrack[]>;
  calculateBoxWidth: ()=>string,
  selectedTrackLength:number
  selectedTrack:SelectedTrack
  additionalBoxRenderCondition:boolean
  index:number
}

export function SearchTrackBoxContainer({
  setSelectedTracks,
  selectedTrack,
  calculateBoxWidth,
  additionalBoxRenderCondition,
  selectedTrackLength,
  index,
}:Prob) {
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

  return (
    <>
      <div style={{ width: calculateBoxWidth() }}>
        <SearchTrackBox
          selectedTrack={selectedTrack}
          selectTrack={selectTrack}
          addSelectBox={addSelectBox}
          deleteSelectBox={deleteSelectBox}
          deleteTrack={deleteTrack}
        />
      </div>

      {/* 마지막 인덱스에서 추가 박스 렌더링 */}
      { (index === selectedTrackLength - 1 && additionalBoxRenderCondition) && (
      <div key="additional-box" style={{ width: calculateBoxWidth() }}>
        <SearchTrackBox
          selectedTrack={{
            id: selectedTrackLength,
            activate: false,
            color: colorArray[selectedTrackLength],
            track: null,
          }}
          selectTrack={selectTrack}
          addSelectBox={addSelectBox}
          deleteSelectBox={deleteSelectBox}
          deleteTrack={deleteTrack}
        />
      </div>
      )}
    </>
  );
}
