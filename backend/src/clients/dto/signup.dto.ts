import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(2)
  clientName: string;

  @ApiProperty({ example: 'admin@acme.example' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'SomeStrongPassword1!' })
  @IsString()
  @MinLength(8)
  adminPassword: string;
}
