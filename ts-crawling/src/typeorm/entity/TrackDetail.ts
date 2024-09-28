// entity/trackDetail.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Track } from './Track';
import { Artist } from './Artist';

  @Entity()
export class TrackDetail {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToMany(() => Track)
    @JoinTable({
      name: 'track_artist',
      joinColumn: {
        name: 'trackId',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'artistId',
        referencedColumnName: 'id',
      },
    })
      tracks: Track[];

    @ManyToMany(() => Artist)
    @JoinTable({
      name: 'artist_track',
      joinColumn: {
        name: 'artistId',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'trackId',
        referencedColumnName: 'id',
      },
    })
      artists: Artist[];
}
