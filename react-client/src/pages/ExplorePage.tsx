/* eslint-disable no-unused-vars */

import { useImmer } from 'use-immer';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavbar from '@layouts/TopNavBar';

import ExploreSection1 from '@layouts/ExploreSection1';
import { TrackWithArtistResponse } from '@typings/track';
import ExploreSection2 from '@layouts/ExploreSection2';
import { useEffect } from 'react';
import { tracksApi } from '@utils/axios';

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
    const trackData: TrackWithArtistResponse | undefined = location.state?.track;
    if (selectedTracksParam) {
      try {
        const parsedTracks = JSON.parse(selectedTracksParam) as SelectedTrack[];

        // Restore `selectedTracks` with fetched track data for each track ID
        const restoredTracks = parsedTracks.map((track) => ({
          ...track,
          track: track.track ? { id: track.track.id } : null,
        })) as SelectedTrack[];

        const promises = restoredTracks.map(async (track) => {
          const { id } = track.track as { id: number };
          const trackData = await tracksApi.getTrackById(id, { withArtists: true });
          return { ...track, track: trackData };
        });
        const result = await Promise.all(promises) as SelectedTrack[];
        setSelectedTracks(result);
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
        id: 0, activate: true, color: colorArray[0],
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

      <ExploreSection2 selectedTracks={selectedTracks} />
    </div>
  );
}
