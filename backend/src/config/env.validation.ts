import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @MinLength(32) // long enough that a placeholder/weak value can't slip through
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  CORS_ORIGIN: string;
}

// Runs once, synchronously, the moment ConfigModule.forRoot() initializes —
// so a missing or malformed env var crashes the app immediately at startup
// with a clear message, instead of failing confusingly on the first request
// that happens to touch that value (or worse, silently misbehaving).
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`);
  }
  return validatedConfig;
}
