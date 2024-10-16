import { FindDTO } from './find.dto';
import { IsNumberString, IsOptional } from 'class-validator';

export class FindWithChartDurationDTO extends FindDTO {
  @IsOptional()
  @IsNumberString()
  minWeeksOnChart?: number;
}
