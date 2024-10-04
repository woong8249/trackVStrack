import { IsNumberString } from 'class-validator';

export class FindOneByIdDTO {
  @IsNumberString()
  id: number;
}
