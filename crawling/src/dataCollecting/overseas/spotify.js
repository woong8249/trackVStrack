import config from '../../../config/config.js';
import redisClient from '../../redis/redisClient.js';
import redisKey from '../../../config/redisKey.js';
import winLogger from '../../util/winston.js';

const { spotify } = config;

export default async function getAccessToken() {
  // fetch를 사용한 토큰 요청
  const headers = {
    Authorization: `Basic ${Buffer.from(`${spotify.clientID}:${spotify.clientSecret}`).toString('base64')}`,
  };
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
  });
  const accessToken = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers,
    body,
  }).then(response => response.ok && response.json())
    .then(response => response.access_token)
    .catch(error => console.error('Error:', error));
  await redisClient.set(redisKey.spotifyAccessToken, accessToken);
  redisClient.expire(redisKey.spotifyAccessToken, 60 * 60);
  return accessToken;
}

export async function fetchItem(title, artist) {
  const url = artist ? `https://api.spotify.com/v1/search?q=track:${title}&artist:${artist}&type=track&market=KR&limit=1`
    : `https://api.spotify.com/v1/search?q=track:${title}&type=track&market=KR&limit=1`;

  const accessToken = await redisClient.get(redisKey.spotifyAccessToken) || await getAccessToken();
  winLogger.info('request info', {
    accessToken, url, title, artist,
  });

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  await fetch(url, { headers })
    .then(response => {
      if (!response.ok) {
        console.log(response.status);
      }
      return response.json();
    })
    .then(data => console.dir(data, { depth: 100 }))
    .catch(winLogger.error);
}

await fetchItem('Fate');

export async function fetchTrack(id) {
  const url = `https://api.spotify.com/v1/tracks/${id}?market=KR`;

  const accessToken = await redisClient.get(redisKey.spotifyAccessToken) || await getAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  await fetch(url, { headers })
    .then(response => {
      if (!response.ok) {
        console.log(response.status);
      }
      return response.json();
    })
    .then(data => console.dir(data, { depth: 100 }))
    .catch(winLogger.error);
}

await fetchTrack('2vNPGH1x5ZwxTjlvzLCyc2');
