import { artistsApi, tracksApi } from '@utils/axios';
import useSWR from 'swr';

export async function findTrackById(id:number) {
  return tracksApi.getTrackById(id, { withArtists: true });
}

export async function findArtistById(id:number) {
  return artistsApi.getArtistById(id, { withTracks: true });
}

export function useFindTrackById(id :number) {
  const {
    data: trackByIdData,
    error: trackByIdError,
    isLoading: trackByIdIsLoading,
  } = useSWR(['track', id], () => findTrackById(id), {
    revalidateOnFocus: false, // 페이지로 돌아오거나 브라우저 탭을 다시 포커스할 때 현재 캐시된 데이터를 그대로 사용
    dedupingInterval: 300_000, // 5분간 동일한 key에대해 재요청 x
  });

  return { trackByIdData, trackByIdError, trackByIdIsLoading };
}

export function useFindArtistsById(id :number) {
  const {
    data: artistByIdData,
    error: artistByIdError,
    isLoading: artistByIdIsLoading,
  } = useSWR(['artist', id], () => findArtistById(id), {
    revalidateOnFocus: false, // 페이지로 돌아오거나 브라우저 탭을 다시 포커스할 때 현재 캐시된 데이터를 그대로 사용
    dedupingInterval: 300_000, // 5분간 동일한 key에대해 재요청 x
  });

  return { artistByIdData, artistByIdError, artistByIdIsLoading };
}
