import { SetMetadata } from '@nestjs/common';
import type { Role } from '@lfv/types';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the listed roles. Checked by the global `RolesGuard`
 * after `JwtAuthGuard` has populated `request.user`.
 *
 * ```ts
 * @Roles('admin')
 * @Get('queues')
 * list() { ... }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
