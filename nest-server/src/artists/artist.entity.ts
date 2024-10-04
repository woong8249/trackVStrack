import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from '../tracks/track.entity';
import { ArtistFormatWithAddInfo } from 'src/database/types/processing';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
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
