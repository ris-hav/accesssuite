import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MODULE_KEY = 'requireModule';

// Tags a route with the ModuleCatalog `key` it belongs to (e.g. 'reports').
// ModuleAccessGuard reads this and checks the caller's Client has it enabled.
export const RequireModule = (moduleKey: string) =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleKey);
