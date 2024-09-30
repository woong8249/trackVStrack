// entity/Artist.ts
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import type { ArtistFormatWithAddInfo } from 'src/types/processing';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';

// 커스텀 변환기 정의
class JsonTransformer implements ValueTransformer {
  to(value: Omit<ArtistFormatWithAddInfo, 'artistKeyword'>): string {
    return JSON.stringify(value);
  }

  from(value: Omit<ArtistFormatWithAddInfo, 'artistKeyword'>): Omit<ArtistFormatWithAddInfo, 'artistKeyword'> {
    return value;
  }
}
@Entity()
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
      platforms: Omit<ArtistFormatWithAddInfo, 'artistKeyword'>;
}
