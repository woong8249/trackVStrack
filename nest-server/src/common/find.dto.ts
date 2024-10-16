import {
  IsOptional,
  IsString,
  IsNumberString,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FindDTO {
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsNumberString()
  offset?: number;

  @IsOptional()
  @IsIn(['asc', 'desc', 'random'])
  sort?: 'asc' | 'desc' | 'random' = 'desc';

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true') // 문자열을 boolean으로 변환
  @IsBoolean()
  withArtists?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true') // 문자열을 boolean으로 변환
  @IsBoolean()
  withTracks?: boolean;
}
