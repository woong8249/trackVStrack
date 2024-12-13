import { Footer } from '@layouts/Footer';
import TopNavBar from '@layouts/TopNavBar';
import HomeSection1 from '@sections/HomeSection1';
import { HomeSection2 } from '@sections/HomeSection2';
import { HomeSection3 } from '@sections/HomeSection3';
import { TrackWithArtistResponse } from '@typings/track';
import { fetcher, trackEndpoints } from '@utils/axios';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchTracks() {
    setLoading(true);
    setError(null);
    try {
      const url = trackEndpoints.getTracks({
        minWeeksOnChart: 30,
        withArtists: true,
        limit: 6,
        sort: 'random' as const,
      });
      const response = await fetcher<TrackWithArtistResponse[]>(url);

      setTracks(response);
    } catch (err) {
      setError(err as unknown as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTracks();
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center min-w-[350px]">
        <TopNavBar currentPage="home" />
        <HomeSection1 />
        <HomeSection2 retryFunc={fetchTracks} tracks={tracks} error={error} loading={loading} />
        <HomeSection3 retryFunc={fetchTracks} tracks={tracks} error={error} loading={loading} />
        <Footer />
      </div>
    </>
  );
}
