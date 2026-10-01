import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@lfv/types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { JwtAccessPayload } from '../interfaces/jwt-payload.interface';

/**
 * Enforces `@Roles(...)` metadata. Runs after `JwtAuthGuard`, so
 * `request.user` holds the verified JWT payload.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() metadata → authentication alone is enough.
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: JwtAccessPayload }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!required.includes(user.role)) {
      throw new ForbiddenException(
        `Role '${user.role}' is not permitted to access this resource`,
      );
    }
    return true;
  }
}
