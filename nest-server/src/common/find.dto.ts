import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

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
}
