// entity/Artist.ts

import type { ArtistFormatWithAddInfo } from '../../types/processing';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from './Track';

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
