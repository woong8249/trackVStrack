/* eslint-disable no-param-reassign */

import { Color, SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { Updater } from 'use-immer';
import SearchTrackBox from './SearchTrackBox';

interface Prob{
  setSelectedTracks: Updater<SelectedTrack[]>;
  calculateBoxWidth: ()=>string,
  selectedTrack:SelectedTrack
}

export function SearchTrackBoxContainer({
  setSelectedTracks,
  selectedTrack,
  calculateBoxWidth,
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

  function changeBoxActivateToTrue(id:number) {
    setSelectedTracks((draft) => {
      draft.forEach((item) => {
        if (item.id === id) {
          item.activate = true;
        }
      });
    });
  }

  function deleteSelectBox(id: number) {
    setSelectedTracks((draft) => {
      const index = draft.findIndex((box) => box.id === id);
      if (index !== -1) {
        draft.splice(index, 1); // 해당 요소 제거

        // 모든 요소의 id 재할당
        draft.forEach((box, i) => {
          box.id = i;
          box.color = colorArray[i];
        });
      }
    });
  }

  return (
    <div style={{ width: calculateBoxWidth() }}>
      <SearchTrackBox
        selectedTrack={selectedTrack}
        selectTrack={selectTrack}
        changeBoxActivateToTrue={changeBoxActivateToTrue}
        deleteSelectBox={deleteSelectBox}
        deleteTrack={deleteTrack}
      />
    </div>
  );
}
