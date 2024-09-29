/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
import createDataSource from '../typeorm/dataSource';
import { Track } from '../typeorm/entity/Track';
import ss from 'string-similarity';
import type { TrackFormatWithAddInfo, PlatformWhitAddInfo } from '../types/processing';
import type { PlatformName } from 'src/types/common';
import _ from 'lodash';
import winLogger from '../logger/winston';

const dataSource = await createDataSource();

export function checkSS(string1:string, string2:string) {
  const similarity = ss.compareTwoStrings(string1.toLowerCase(), string2.toLowerCase());
  return similarity;
}

function getAllJsonFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const filePaths = entries.map((entry) => join(directory, entry));
  return filePaths.flatMap((filePath) => {
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      return getAllJsonFiles(filePath);
    } if (stat.isFile() && extname(filePath) === '.json') {
      return [filePath];
    }
    return [];
  });
}

export async function processTracksAndArtists() {
  const directoryPath = join(__dirname, '../../data');
  const tracksDataArray = getAllJsonFiles(directoryPath).map((filePath) => {
    const data = readFileSync(filePath, 'utf8');
    return (JSON.parse(data) as TrackFormatWithAddInfo[]);
  });

  const promises = tracksDataArray.map(async (tracksData) => {
    for (const trackData of tracksData) {
      await dataSource.manager.transaction(async (transactionalEntityManager) => {
        const platformName = Object.keys(trackData).find((key) => key !== 'trackKeyword') as PlatformName;
        const existingTracks = await transactionalEntityManager.find(Track, {
          where: { trackKeyword: trackData.trackKeyword },

        });
        let targetTrack: Track | null = null;

        // 0번 비교대상이 없는경우 => 새로운 트랙 생성
        if (existingTracks.length === 0) {
          targetTrack = new Track();
          targetTrack.trackKeyword = trackData.trackKeyword;
          targetTrack.platforms = { [platformName]: trackData[platformName] };
          await transactionalEntityManager.save(targetTrack);
          return;
        }

        // 비교대상이 있는경우
        // 1번: 같은 플랫폼이며 같은 trackID를 가진게 있는지 찾기
        for (const existingTrack of existingTracks) {
          const isSamePlatform = platformName in existingTrack.platforms;
          if (isSamePlatform) { // 같은 플랫폼이 있는경우
            const isSameTrackID = (existingTrack.platforms[platformName] as PlatformWhitAddInfo).trackID === (trackData[platformName] as PlatformWhitAddInfo).trackID;
            if (isSameTrackID) { // trackID가 같다면 weeklyChartScope만 추가
              (existingTrack.platforms[platformName]as PlatformWhitAddInfo).weeklyChartScope.push(...(trackData[platformName] as PlatformWhitAddInfo).weeklyChartScope);
              // eslint-disable-next-line @typescript-eslint/unbound-method
              const weeklyChartScope = _.uniqWith((existingTrack.platforms[platformName]as PlatformWhitAddInfo).weeklyChartScope, _.isEqual);
              (existingTrack.platforms[platformName]as PlatformWhitAddInfo).weeklyChartScope = weeklyChartScope;
              targetTrack = existingTrack;
              await transactionalEntityManager.save(targetTrack);
              return;
            }
          }
        }

        // 2번 다른 플랫폼인경우
        // 아티스트유사도 가장높은것 선택 & 0.75 이상 &가사 유사도 0.75 이상
        // debut 비교로직 추가 => conditional
        // for (const existingTrack of existingTracks) {
        const similarityList:[Track, number, number, string][] = existingTracks.map((_existingTrack) => {
          const availablePlatform = _existingTrack.platforms.melon || _existingTrack.platforms.genie || _existingTrack.platforms.bugs as PlatformWhitAddInfo;
          return [
            _existingTrack,
            checkSS(
              availablePlatform.artists.map((artist) => artist.artistName).join(''),
              (trackData[platformName] as PlatformWhitAddInfo).artists.map((artist) => artist.artistName).join(''),
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
          // eslint-disable-next-line prefer-destructuring
          targetTrack = maxArtistSimilarity[0];
          await transactionalEntityManager.save(targetTrack);
          return;
        }

        // 3번 같은 트랙이 아니라고 판단되는경우
        targetTrack = new Track();
        targetTrack.trackKeyword = trackData.trackKeyword;
        targetTrack.platforms = { [platformName]: trackData[platformName] };

        await transactionalEntityManager.save(targetTrack);
      });
    }
  });

  await Promise.all(promises);
  winLogger.info('done');
}
