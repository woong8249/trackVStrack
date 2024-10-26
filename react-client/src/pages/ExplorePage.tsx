/* eslint-disable no-unused-vars */

import { useImmer } from 'use-immer';
import { useLocation } from 'react-router-dom';
import TopNavbar from '@layouts/TopNavBar';

import ExploreSection1 from '@layouts/ExploreSection1';
import { TrackWithArtistResponse } from '@typings/track';
import ExploreSection2 from '@layouts/ExploreSection2';

// ideal1 :추가될때마다 url을 수정해 state가 유지되는 척 만들기 => 단점 fetch를 다시해야함
// 캐시되는 방식이 더 좋을 수 있음
// 이슈파서 하기

export enum Color {
  Blue = 'bg-blue-500',
  Red = 'bg-red-500',
  Green = 'bg-green-500',
  Yellow = 'bg-yellow-500',
  Purple = 'bg-purple-500',
  Black = 'bg-black',
}

export interface SelectedTrack {
  id: number;
  activate: boolean;
  track?: TrackWithArtistResponse | null;
  color: Color;
}

export default function ExplorePage() {
  const location = useLocation();
  const trackData: TrackWithArtistResponse | undefined = location.state?.track;
  const colorArray = Object.values(Color);
  const initialSelectTrackBoxes = [{
    id: 0, activate: true, color: colorArray[0], track: trackData,
  }];

  const [
    selectedTracks,
    setSelectedTracks,
  ] = useImmer<SelectedTrack[]>(initialSelectTrackBoxes);

  return (
    <div className="bg-[#eaeff8] min-h-screen flex flex-col items-center min-w-[350px]">
      <TopNavbar currentPage="explore" />

      <ExploreSection1
        selectedTracks={selectedTracks}
        setSelectedTracks={setSelectedTracks}
       />

      <ExploreSection2 selectedTracks={selectedTracks} />
    </div>
  );
}
