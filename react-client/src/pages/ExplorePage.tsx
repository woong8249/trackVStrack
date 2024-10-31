/* eslint-disable no-unused-vars */

import { useImmer } from 'use-immer';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavbar from '@layouts/TopNavBar';

import ExploreSection1 from '@sections/ExploreSection1';
// import ExploreSection2 from '@sections/ExploreSection2';
import { TrackWithArtistResponse } from '@typings/track';
import { useEffect } from 'react';

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
  track: TrackWithArtistResponse |{id:number} | null;
  color: Color;
}

export default function ExplorePage() {
  const location = useLocation();
  const initialSelectTracks: SelectedTrack[] = [];
  const [selectedTracks, setSelectedTracks] = useImmer<SelectedTrack[]>(initialSelectTracks);
  const colorArray = Object.values(Color);
  const navigate = useNavigate();

  function updateUrl(selectedTracks: SelectedTrack[]) {
    const urlTracks = selectedTracks.map(({
      id, activate, color, track,
    }) => ({
      id,
      activate,
      color,
      track: track ? { id: track.id } : null,
    }));
    const queryParams = new URLSearchParams({ selectedTracks: JSON.stringify(urlTracks) });

    navigate(`?${queryParams.toString()}`, { replace: true });
  }

  async function syncTracks() {
    const queryParams = new URLSearchParams(location.search);
    const selectedTracksParam = queryParams.get('selectedTracks');
    const trackData = location.state?.track ? location.state?.track : null;
    if (selectedTracksParam) {
      try {
        const parsedSelectedTracks = JSON.parse(selectedTracksParam) as SelectedTrack[];
        setSelectedTracks(parsedSelectedTracks);
      } catch (error) {
        console.error('Failed to parse selectedTracks from URL:', error);
      }
    } else if (trackData) {
      const initialSelectTracks = [{
        id: 0, activate: true, color: colorArray[0], track: trackData,
      }];
      updateUrl(initialSelectTracks);
      setSelectedTracks(initialSelectTracks);
    } else {
      const initialSelectTracks = [{
        id: 0, activate: true, color: colorArray[0], track: null,
      }];
      setSelectedTracks(initialSelectTracks);
    }
  }

  useEffect(() => {
    syncTracks();
  }, []);

  return (
    <div className="bg-[#eaeff8] min-h-screen flex flex-col items-center min-w-[350px]">
      <TopNavbar currentPage="explore" />

      <ExploreSection1
        selectedTracks={selectedTracks}
        setSelectedTracks={setSelectedTracks}
        updateUrl={updateUrl}
       />

      {/* <ExploreSection2 selectedTracks={selectedTracks} /> */}
    </div>
  );
}
