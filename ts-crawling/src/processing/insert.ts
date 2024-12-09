/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable no-continue */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import type { PlatformName } from '../types/common';
import type { ArtistWithAddInfo, PlatformWhitAddInfo, TrackFormatWithAddInfo } from '../types/processing';
import type { EntityManager } from 'typeorm';
import _ from 'lodash';
import { Track } from '../typeorm/entity/Track';
import { checkSS } from '../util/typeChecker';
import { Artist } from '../typeorm/entity/Artist';
import { compareImages } from '../util/image';

export async function resolveArtists(trackData:TrackFormatWithAddInfo, transactionalEntityManager:EntityManager):Promise<Artist[]> {
  const targetArtists: Artist[] = [];
  const platformName = Object.keys(trackData).find((key) => key !== 'trackKeyword') as PlatformName;
  const existingArtistList :[ArtistWithAddInfo, Artist[]][] = await Promise.all((trackData[platformName] as PlatformWhitAddInfo)
    .artists.map(async (artist) => [artist, await transactionalEntityManager.find(Artist, {
      where: { artistKeyword: artist.artistKeyword },
    })]));

  outerLoop: for await (const [artist, existingArtists] of existingArtistList) {
    const targetArtist = new Artist();
    targetArtist.artistKeyword = artist.artistKeyword;
    targetArtist.platforms = { [platformName]: artist };

    // 아티스트의 비교대상이 없는 경우 => 추가
    if (existingArtists.length === 0) {
      await transactionalEntityManager.save(targetArtist);
      targetArtists.push(targetArtist);
    } else {
      // 비교대상이 있는 경우
      // 1번: 같은 플랫폼이며 같은 ArtistID를 가진 게 있는지 찾기
      for await (const existingArtist of existingArtists) {
        const isSamePlatform = platformName in existingArtist.platforms;
        if (isSamePlatform && artist.artistID === (existingArtist.platforms[platformName] as ArtistWithAddInfo).artistID) {
          await transactionalEntityManager.save(existingArtist);
          targetArtists.push(existingArtist);
          continue outerLoop; // 바꾸거나 추가할 정보없음, 외부 for 루프 넘어가기
        }
      }
      // 2번 다른 플랫폼인경우
      // artistName 유사도비교
      // debut 비교로직 => conditional
      // artistImage 유사도 비교
      const similarityList: [Artist, number, boolean | undefined][] = existingArtists.map((existingArtist) => {
        const availablePlatform = existingArtist.platforms.melon || existingArtist.platforms.genie || existingArtist.platforms.bugs as ArtistWithAddInfo;
        const result: [Artist, number, boolean | undefined] = [existingArtist, checkSS(availablePlatform.artistName, artist.artistName), undefined];
        if (availablePlatform.debut !== 'missing' && artist.debut !== 'missing') {
          result[2] = availablePlatform.debut.split('.')[0] === artist.debut.split('.')[0];
        }
        return result;
      });
      const maxArtistSimilarity = similarityList.reduce((pre, cur) => (pre[1] > cur[1] ? pre : cur));

      const condition1 = maxArtistSimilarity[1] >= 0.3;
      const condition2 = maxArtistSimilarity[2] === undefined ? true : maxArtistSimilarity[2];
      if (condition1 && condition2) {
        Object.assign(maxArtistSimilarity[0].platforms, { [platformName]: artist });
        await transactionalEntityManager.save(maxArtistSimilarity[0]);
        targetArtists.push(maxArtistSimilarity[0]);
        continue; //  루프 넘어가기
      }
      // 3번 다른 플랫폼인경우
      // artistImage 비교(추가 검사) => 오차확률 20% 이하이면 같은 아티스트
      // eslint-disable-next-line no-nested-ternary
      const availablePlatformName = 'bugs' in maxArtistSimilarity[0].platforms ? 'bugs'
        : 'genie' in maxArtistSimilarity[0].platforms ? 'genie'
          : 'melon' as PlatformName;
      const rawMisMatchPercentage = await compareImages(artist.artistImage, (maxArtistSimilarity[0].platforms[availablePlatformName] as ArtistWithAddInfo).artistImage, artist);
      if (rawMisMatchPercentage < 20) {
        Object.assign(maxArtistSimilarity[0].platforms, { [platformName]: artist });
        await transactionalEntityManager.save(maxArtistSimilarity[0]);
        targetArtists.push(maxArtistSimilarity[0]);
        continue; //  루프 넘어가기
      }

      // 4번 다른 플랫폼인경우
      // 같은 Artist가 아니라고 판단되는경우 => 새로운 아티스트 추가
      await transactionalEntityManager.save(targetArtist);
      targetArtists.push(targetArtist);
    }
  }
  return targetArtists;
}

export async function insertTrack(trackData:TrackFormatWithAddInfo, resolvedArtists:Artist[], transactionalEntityManager:EntityManager) {
  const platformName = Object.keys(trackData).find((key) => key !== 'trackKeyword') as PlatformName;
  const existingTracks = await transactionalEntityManager.find(Track, {
    where: { trackKeyword: trackData.trackKeyword },
  });
  let targetTrack: Track = new Track();
  targetTrack = new Track();
  targetTrack.artists = resolvedArtists;

  // 1번 비교대상이 없는경우 => 새로운 트랙 생성
  if (existingTracks.length === 0) {
    targetTrack.trackKeyword = trackData.trackKeyword;
    targetTrack.platforms = { [platformName]: trackData[platformName] };
    await transactionalEntityManager.save(targetTrack);
    return;
  }

  //  2번: 비교대상이 있는경우 +같은 플랫폼 + 같은 trackID를 가진게 있는지 찾기
  for (const existingTrack of existingTracks) {
    const isSamePlatform = platformName in existingTrack.platforms;
    if (isSamePlatform) { // 같은 플랫폼이 있는경우
      const isSameTrackID = (existingTrack.platforms[platformName] as PlatformWhitAddInfo).trackID === (trackData[platformName] as PlatformWhitAddInfo).trackID;
      if (isSameTrackID) { // trackID가 같다면 weeklyChartScope만 추가
        (existingTrack.platforms[platformName]as PlatformWhitAddInfo).weeklyChartScope.push(...(trackData[platformName] as PlatformWhitAddInfo).weeklyChartScope);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const weeklyChartScope = _.uniqWith((existingTrack.platforms[platformName]as PlatformWhitAddInfo).weeklyChartScope, _.isEqual);
        (existingTrack.platforms[platformName]as PlatformWhitAddInfo).weeklyChartScope = weeklyChartScope;
        await transactionalEntityManager.save(existingTrack);
        return;
      }
    }
  }

  // 3번 비교대상이 있는경우 + 다른 플랫폼인경우 + 아티스트유사도 가장높은것 선택 + (artistName 유사사도 0.3 이상 && lyrics 유사도 0.75 이상)
  const similarityList:[Track, number, number, string][] = existingTracks.map((_existingTrack) => {
    const availablePlatform = _existingTrack.platforms.melon || _existingTrack.platforms.genie || _existingTrack.platforms.bugs as PlatformWhitAddInfo;
    return [
      _existingTrack,
      checkSS(
        availablePlatform.artists.map((artist) => artist.artistKeyword).join(''),
        (trackData[platformName] as PlatformWhitAddInfo).artists.map((artist) => artist.artistKeyword).join(''),
      ),
      checkSS((trackData[platformName] as PlatformWhitAddInfo).lyrics, availablePlatform.lyrics),
      availablePlatform.releaseDate, // 아직 안씀
    ];
  });

  const maxArtistSimilarity = similarityList.reduce((pre, cur) => (pre[1] > cur[1] ? pre : cur));
  const condition1 = maxArtistSimilarity[1] >= 0.3;
  const condition2 = maxArtistSimilarity[2] >= 0.75;
  if (condition1 && condition2) {
    Object.assign(maxArtistSimilarity[0].platforms, { [platformName]: trackData[platformName] });
    await transactionalEntityManager.save(maxArtistSimilarity[0]);
    return;
  }

  // 4번 비교대상이 있는경우 + 다른 플랫폼인경우 + 아티스트유사도 가장높은것 선택 + trackImage 유사도 비교(오차확률 20% 이하인경우 같은곡)
  // eslint-disable-next-line no-nested-ternary
  const availablePlatformName = 'bugs' in maxArtistSimilarity[0].platforms ? 'bugs'
    : 'genie' in maxArtistSimilarity[0].platforms ? 'genie'
      : 'melon' as PlatformName;
  const rawMisMatchPercentage = await compareImages(trackData[platformName]?.trackImage as string, (maxArtistSimilarity[0].platforms[availablePlatformName])?.trackImage as string);
  if (rawMisMatchPercentage < 20) {
    Object.assign(maxArtistSimilarity[0].platforms, { [platformName]: trackData[platformName] });
    await transactionalEntityManager.save(maxArtistSimilarity[0]);
    return;
  }

  // 5번 다른곡으로 판단되는 경우
  targetTrack.trackKeyword = trackData.trackKeyword;
  targetTrack.platforms = { [platformName]: trackData[platformName] };
  await transactionalEntityManager.save(targetTrack);
}
