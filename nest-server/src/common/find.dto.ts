import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FindDto {
  @IsOptional()
  @IsNumberString()
  limit?: number = 10;

  @IsOptional()
  @IsNumberString()
  offset?: number = 0;

  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  query?: string;
}
