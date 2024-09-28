/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
// import { type DataSource } from 'typeorm';
import createDataSource from '../typeorm/dataSource';
import { Track } from 'src/typeorm/entity/Track';
// import { Artist } from 'src/typeorm/entity/Artist';
// import { TrackDetail } from 'src/typeorm/entity/TrackDetail';
import ss from 'string-similarity';
import type { TrackFormatWithAddInfo, PlatformWhitAddInfo } from '../types/processing';
import type { PlatformName } from 'src/types/common';

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
      return getAllJsonFiles(filePath); // 디렉터리면 재귀적으로 다시 탐색
    } if (stat.isFile() && extname(filePath) === '.json') {
      return [filePath]; // 파일이면서 .json이면 해당 파일 경로 반환
    }
    return []; // 아니면 빈 배열 반환
  });
}

export async function processTracksAndArtists() {
  // const artistRepository = dataSource.getRepository(Artist);
  // const trackDetailRepository = dataSource.getRepository(TrackDetail);

  const directoryPath = join(__dirname, '../data');
  const tracksData = getAllJsonFiles(directoryPath).map((filePath) => {
    const data = readFileSync(filePath, 'utf8');
    return JSON.parse(data) as TrackFormatWithAddInfo[];
  }).flat();

  // 트랜잭션 시작
  await dataSource.manager.transaction(async (transactionalEntityManager) => {
    for (const trackData of tracksData) {
      const platformName = Object.keys(trackData).find((key) => key !== 'trackKeyword') as PlatformName;
      const existingTracks = await transactionalEntityManager.find(Track, {
        where: { trackKeyword: trackData.trackKeyword },
      });

      let targetTrack: Track | null = null;

      // 비교대상이 없는경우 => 새로운 트랙 생성
      if (existingTracks.length === 0) {
        targetTrack = new Track();
        targetTrack.trackKeyword = trackData.trackKeyword;
        targetTrack.platforms = { [platformName]: trackData[platformName] };

        // 동일한 trackKeyword를 가진 트랙이 존재할 때
      } else {
        for (const existingTrack of existingTracks) {
          // 같은 플랫폼이 있는지 확인
          const isSamePlatform = platformName in existingTrack.platforms;
          // 같은 플랫폼이 있는경우
          if (isSamePlatform) {
            // trackID 비교
            const isSameTrackID = (existingTrack.platforms[platformName] as PlatformWhitAddInfo).trackID === (trackData[platformName] as PlatformWhitAddInfo).trackID;
            // trackID가 같다면 weeklyChartScope만 추가
            if (isSameTrackID) {
              (existingTrack.platforms[platformName]as PlatformWhitAddInfo).weeklyChartScope.push(...(trackData[platformName] as PlatformWhitAddInfo).weeklyChartScope);
              targetTrack = existingTrack;
              break;
            } else {
              // trackID가 다른경우
              targetTrack = new Track();
              targetTrack.trackKeyword = trackData.trackKeyword;
              targetTrack.platforms = { [platformName]: trackData[platformName] };
            }
          } else {
            // 같은 플랫폼이 없는경우
            const ssList:[Track, number][] = existingTracks.map((_existingTrack) => {
              const availablePlatform = _existingTrack.platforms.melon || _existingTrack.platforms.genie || _existingTrack.platforms.bugs as PlatformWhitAddInfo;
              return [_existingTrack, checkSS((trackData[platformName] as PlatformWhitAddInfo).lyrics, availablePlatform.lyrics)];
            });
            const maxSS = ssList.reduce((pre, cur) => {
              if (pre[1] > cur[1]) return pre;
              return cur;
            });
            // 유사도가 0.75 이상인 경우 같은곡으로 판단 => 플랫폼추가
            if (maxSS[1] >= 0.75) {
              Object.assign(existingTrack.platforms, { [platformName]: trackData[platformName] });
              targetTrack = existingTrack;
            } else {
              // 유사도가 0.75 이하인 경우 다른곡으로 판단 => 새로운 Track 추가
              targetTrack = new Track();
              targetTrack.trackKeyword = trackData.trackKeyword;
              targetTrack.platforms = { [platformName]: trackData[platformName] };
            }
            break;
          }
        }
      }
      if (targetTrack) {
        await transactionalEntityManager.save(targetTrack);
      }
    }
  });
}
