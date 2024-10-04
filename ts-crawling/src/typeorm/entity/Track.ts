// entity/track.ts

import type { TrackFormatWithAddInfo } from '../../types/processing';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,

} from 'typeorm';
import { Artist } from './Artist';

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
  })
    platforms: Omit<TrackFormatWithAddInfo, 'trackKeyword'>;

  @ManyToMany(() => Artist, (artist) => artist.tracks)
    artists: Artist[];

  @CreateDateColumn({ type: 'timestamp' })
    createDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
    updateDate: Date;
}
