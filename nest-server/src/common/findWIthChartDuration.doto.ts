import { FindDTO } from './find.dto';
import { IsNumberString } from 'class-validator';

export class FindWithChartDurationDTO extends FindDTO {
  @IsNumberString()
  minWeeksOnChart: number;
}
