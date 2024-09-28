// entity/Artist.ts
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import type { ArtistFormatWithAddInfo } from 'src/types/processing';
import {
  Column,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';

// 커스텀 변환기 정의
class JsonTransformer implements ValueTransformer {
  to(value: ArtistFormatWithAddInfo): string {
    return JSON.stringify(value);
  }

  from(value: string): ArtistFormatWithAddInfo {
    return JSON.parse(value) as ArtistFormatWithAddInfo;
  }
}

export class Artist {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({
      type: 'varchar', length: 50,
    })
      artistKeyword: string;

    @Column({
      type: 'json',
      transformer: new JsonTransformer(),
    })
      platforms: ArtistFormatWithAddInfo[];
}
