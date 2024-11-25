/* eslint-disable no-restricted-syntax */

import fs from 'fs';
import path from 'path';
import type { PlatformWhitAddInfo, TrackFormatWithAddInfo } from '../src/types/processing';
import type { PlatformName } from '../src/types/common';
import { findAllJsonFilePaths } from '../src/util/json';

const jsonFilePaths = findAllJsonFilePaths(path.join(__dirname, 'data'));

for await (const filePath of jsonFilePaths) {
  const trackFormatWithAddInfos = JSON.parse(fs.readFileSync(filePath, 'utf8')) as TrackFormatWithAddInfo[];
  let fileModified = false;

  for await (const trackFormatWithAddInfo of trackFormatWithAddInfos) {
    trackFormatWithAddInfo.trackKeyword = trackFormatWithAddInfo.trackKeyword.replace(/\s+/g, '');
    fileModified = true;
    // const platformName = Object.keys(trackFormatWithAddInfo).find((key) => key !== 'trackKeyword') as PlatformName;
    // const { artists } = trackFormatWithAddInfo[platformName] as PlatformWhitAddInfo;

    // for await (const artist of artists) {
    //   const { artistImage } = artist;
    //   if (!artistImage) {
    //     console.log(platformName, artist, filePath);
    //     artist.artistImage = 'missing'; // artistImage가 없는 경우 'missing'으로 설정
    //     fileModified = true; // 파일이 수정되었음을 표시
    //   }
    // }
  }

  if (fileModified) {
    // 수정된 내용을 다시 파일에 저장
    fs.writeFileSync(filePath, JSON.stringify(trackFormatWithAddInfos, null, 2), 'utf8');
    console.log(`File updated: ${filePath}`);
  }
}
