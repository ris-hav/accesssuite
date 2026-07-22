import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateModuleAccessDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  enabled: boolean;
}
