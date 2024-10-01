// entity/Artist.ts
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import type { ArtistFormatWithAddInfo } from '../../types/processing';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type ValueTransformer,
} from 'typeorm';
import { Track } from './Track';

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

    // owner side
    @ManyToMany(() => Track, (track) => track.artists)
    @JoinTable()
      tracks: Track[];

    @CreateDateColumn({ type: 'timestamp' })
      createDate: Date;

    @UpdateDateColumn({ type: 'timestamp' })
      updateDate: Date;
}
