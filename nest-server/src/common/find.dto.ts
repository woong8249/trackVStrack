import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FindDto {
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsNumberString()
  offset?: number;

  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  query?: string;
}
