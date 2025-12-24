import { IsNumber, Min, Max } from 'class-validator';

export class UpdateConfigDto {
  @IsNumber()
  @Min(0.01)
  ratePerUnit: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  vatPercentage: number;

  @IsNumber()
  @Min(0)
  fixedServiceCharge: number;
}
