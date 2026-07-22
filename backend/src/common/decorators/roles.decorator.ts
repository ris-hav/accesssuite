import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Attaches a list of allowed roles as metadata on a route handler, readable
// later by RolesGuard via Nest's Reflector. Doesn't enforce anything itself.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
