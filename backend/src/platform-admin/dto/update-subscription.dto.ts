import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../../../generated/prisma/enums';

export class UpdateSubscriptionDto {
  @ApiProperty({
    enum: SubscriptionStatus,
    example: SubscriptionStatus.SUSPENDED,
  })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}
