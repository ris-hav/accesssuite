import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@demo.accesssuite.dev' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'DemoAdmin123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
