/* eslint-disable no-nested-ternary */
import { describe, expect, test } from 'vitest';

import createDataSource from '../src/typeorm/dataSource';
import { Track } from '../src/typeorm/entity/Track';
import { Artist } from '../src/typeorm/entity/Artist';
import type { PlatformName } from '../src/types/common';
import type { ArtistWithAddInfo, PlatformWhitAddInfo } from '../src/types/processing';
import { checkSS } from '../src/util/typeChecker';
import { compareImages } from '../src/util/image';
import winLogger from '../src/logger/winston';

const dataSource = await createDataSource();
const trackRepo = dataSource.getRepository(Track);
const artistRepo = dataSource.getRepository(Artist);

describe.skip(`
    Classification test between tracks with the same trackKeyword.
    Even if they have the same trackKeyword, 
    they will be classified as different tracks if the lyric similarity, artistName similarity, or trackImage similarity is low.`, async () => {
  const listOFTracksWithSameTrackKeyword = (await trackRepo
    .createQueryBuilder('track')
    .select('trackKeyword')
    .groupBy('trackKeyword')
    .having('COUNT(trackKeyword) >= :count', { count: 2 })
    .getRawMany()
    .then(async (list) => Promise.all(list.map(async ({ trackKeyword }) => trackRepo.find({ where: { trackKeyword: trackKeyword as string } })))));

  // 최대 50개그룹만 테스트
  listOFTracksWithSameTrackKeyword.slice(0, 50).forEach((tracks) => {
    const mapData = tracks.map((track) => {
      const { platforms, id } = track;
      const availablePlatformName = 'bugs' in platforms ? 'bugs' : 'genie' in platforms ? 'genie' : 'melon' as PlatformName;
      const { lyrics, trackImage, artists } = (platforms[availablePlatformName] as PlatformWhitAddInfo);
      const artistNameJoin = artists.map((artist) => artist.artistName).join('');
      return {
        id, trackKeyword: track.trackKeyword, artistNameJoin, lyrics, trackImage,
      };
    });
    test.each(mapData)('Check trackKeyword : $trackKeyword , artistNameJoin : $artistNameJoin', async ({
      id, trackKeyword, artistNameJoin, lyrics, trackImage,
    }) => {
      await Promise.all(
        mapData.filter((data) => data.id !== id)
          .map(async (data) => {
            const {
              artistNameJoin: comparisonArtistNameJoin,
              lyrics: comparisonLyrics,
              trackImage: comparisonTrackImage,
            } = data;

            const artistNameSimilarity = checkSS(artistNameJoin, comparisonArtistNameJoin);
            const lyricsSimilarity = checkSS(lyrics, comparisonLyrics);
            const condition1 = artistNameSimilarity < 0.3 && lyricsSimilarity < 0.75;
            if (condition1) {
              winLogger.debug(trackKeyword, { condition1, lyricsSimilarity, artistNameSimilarity });
              expect(condition1).toBe(true);
            } else {
              const rawMisMatchPercentage = await compareImages(trackImage, comparisonTrackImage);
              const condition2 = rawMisMatchPercentage > 20;
              winLogger.debug(trackKeyword, {
                condition2, rawMisMatchPercentage, trackImage, comparisonTrackImage,
              });
              expect(condition2).toBe(true);
            }
          }),
      );
    });
  });
});

describe.skip(`
    Classification test between artist with the same artistKeyword.
    Even if they have the same artistKeyword, 
    they will be classified as different artist if the artistName similarity, or artistImage similarity is low.`, async () => {
  const listOFTracksWithSameArtistKeyword = await artistRepo
    .createQueryBuilder('artist')
    .select('artistKeyword')
    .groupBy('artistKeyword')
    .having('COUNT(artistKeyword) >= :count', { count: 2 })
    .getRawMany()
    .then(async (list) => Promise.all(list.map(async ({ artistKeyword }) => artistRepo.find({ where: { artistKeyword: artistKeyword as string } }))));

  // 최대 50개그룹만 테스트
  listOFTracksWithSameArtistKeyword.slice(0, 50).forEach((artists) => {
    const mapData = artists.map((artist) => {
      const { platforms, id } = artist;
      const availablePlatformName = 'bugs' in platforms ? 'bugs' : 'genie' in platforms ? 'genie' : 'melon' as PlatformName;
      const { artistImage, artistName, artistKeyword } = (platforms[availablePlatformName] as ArtistWithAddInfo);
      return {
        id, artistImage, artistName, artistKeyword,
      };
    });
    test.each(mapData)('Check artistKeyword : $artistKeyword, artistName :$artistName ', async ({
      id, artistImage, artistName, artistKeyword,
    }) => {
      await Promise.all(
        mapData.filter((data) => data.id !== id) // 자기자신 제외
          .map(async (data) => {
            const { artistImage: comparisonArtistImage, artistName: comparisonArtistName } = data;
            const artistNameSimilarity = checkSS(artistName, comparisonArtistName);
            const condition1 = artistNameSimilarity < 0.3;
            if (condition1) {
              winLogger.debug(artistKeyword, {
                condition1, artistNameSimilarity, artistName, comparisonArtistName,
              });
              expect(condition1).toBe(true);
            } else {
              const rawMisMatchPercentage = await compareImages(artistImage, comparisonArtistImage);
              const condition2 = rawMisMatchPercentage > 20;
              winLogger.debug(artistKeyword, {
                condition2, rawMisMatchPercentage, artistName, artistImage, comparisonArtistName, comparisonArtistImage,
              });
              expect(condition2).toBe(true);
            }
          }),
      );
    });
  });
});

// 1번조건: lyrics 유사도가 다르거나 & artistName 유사도가 낮을것이다.
// 2번 조건: trackImage가 유사도가 매우 낮을것이다.
// 1. trackKeyword가 같은 track들은
// 1번조건이 만족하지않으면 2번조건을 만족할 것이다.

// 1. 번조건 : artistName 유사도가 낮을 것이다.
// 2. artistIamge 유사도가 매우 낮을것이다.

// const artistKeywords:{artistKeyword:string}[] = await artistRepo
//   .createQueryBuilder('artist')
//   .select('artistKeyword')
//   .groupBy('artistKeyword')
//   .having('COUNT(artistKeyword) >= 2')
//   .getRawMany();

// const artists = await Promise.all(artistKeywords.map((artistKeyword) => artistRepo.find({ where: { artistKeyword: artistKeyword.artistKeyword } })));
// fs.writeFileSync(path.join(__dirname, 'sample.json'), JSON.stringify(artists));

// // SELECT trackKeyword, COUNT(*) AS count
// // FROM Track
// // GROUP BY trackKeyword
// // HAVING COUNT(*) >= 2

// // SELECT artistKeyword, COUNT(*) AS count
// // FROM Artist
// // GROUP BY artistKeyword
// // HAVING COUNT(*) >= 2
