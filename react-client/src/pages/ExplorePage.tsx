/* eslint-disable no-unused-vars */

import { useImmer } from 'use-immer';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavbar from '@layouts/TopNavBar';

import ExploreSection1 from '@sections/ExploreSection1';
import ExploreSection2 from '@sections/ExploreSection2';
import ExploreSection3 from '@sections/ExploreSection3';
import { TrackWithArtistResponse } from '@typings/track';
import { useEffect } from 'react';
import { Footer } from '@layouts/Footer';

export enum Color {
  Blue = '#3b82f6', // Equivalent of bg-blue-500
  Red = '#ef4444', // Equivalent of bg-red-500
  Green = '#10b981', // Equivalent of bg-green-500
  Yellow = '#f59e0b', // Equivalent of bg-yellow-500
  Purple = '#8b5cf6', // Equivalent of bg-purple-500
  Black = '#000000', // Equivalent of bg-black
}
export type Track =TrackWithArtistResponse |{ id:number } | null;

export interface SelectedTrack {
  id: number;
  activate: boolean;
  track: Track
  color: Color;
}

export default function ExplorePage() {
  const location = useLocation();
  const colorArray = Object.values(Color);
  const initialSelectTracks = [{
    id: 0, activate: true, color: colorArray[0], track: null,
  }];
  const [selectedTracks, setSelectedTracks] = useImmer<SelectedTrack[]>(initialSelectTracks);
  const navigate = useNavigate();
  function updateUrl() {
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

  async function syncSelectedTracksWithURL() {
    try {
      const queryParams = new URLSearchParams(location.search);
      const selectedTracksParam = queryParams.get('selectedTracks');
      const trackData = location.state?.track ? location.state?.track : null;
      if (selectedTracksParam) {
        const parsedSelectedTracks = JSON.parse(selectedTracksParam) as SelectedTrack[];
        setSelectedTracks(parsedSelectedTracks);
      } else if (trackData) {
        const initialSelectTracks = [{
          id: 0, activate: true, color: colorArray[0], track: trackData,
        }];
        setSelectedTracks(initialSelectTracks);
      }
    } catch (error) {
      console.warn('Failed to parse selectedTracks from URL:', error);
      navigate('/explore', { replace: true });
    }
  }

  useEffect(() => {
    syncSelectedTracksWithURL();
  }, []);

  useEffect(() => {
    updateUrl();
  }, [selectedTracks]);

  return (
    <div className="bg-[#eaeff8] min-h-screen flex flex-col items-center min-w-[350px]">
      <TopNavbar currentPage="explore" />

      <ExploreSection1
        selectedTracks={selectedTracks}
        setSelectedTracks={setSelectedTracks}
       />

      <ExploreSection2 selectedTracks={selectedTracks} />
      <ExploreSection3 selectedTracks={selectedTracks} />
      <Footer />
    </div>
  );
}
