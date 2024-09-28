// entity/track.ts
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import type { TrackFormatWithAddInfo } from 'src/types/processing';
import {
  Column,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';

// 커스텀 변환기 정의
class JsonTransformer implements ValueTransformer {
  to(value: Omit<TrackFormatWithAddInfo, 'trackKeyword'>): string {
    return JSON.stringify(value);
  }

  from(value: string): Omit<TrackFormatWithAddInfo, 'trackKeyword'> {
    return JSON.parse(value) as Omit<TrackFormatWithAddInfo, 'trackKeyword'>;
  }
}

export class Track {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    type: 'varchar', length: 50,
  })
    trackKeyword: string;

  @Column({
    type: 'json',
    transformer: new JsonTransformer(),
  })
    platforms: Omit<TrackFormatWithAddInfo, 'trackKeyword'>;
}
