// entity/track.ts
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import type { TrackFormatWithAddInfo } from 'src/types/processing';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';

// 커스텀 변환기 정의
class JsonTransformer implements ValueTransformer {
  to(value: Omit<TrackFormatWithAddInfo, 'trackKeyword'>): string {
    return JSON.stringify(value);
  }

  from(value: Omit<TrackFormatWithAddInfo, 'trackKeyword'>): Omit<TrackFormatWithAddInfo, 'trackKeyword'> {
    return value;
  }
}

@Entity()
export class Track {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    type: 'varchar', length: 100,
  })
    trackKeyword: string;

  @Column({
    type: 'json',
    transformer: new JsonTransformer(),
  })
    platforms: Omit<TrackFormatWithAddInfo, 'trackKeyword'>;
}
