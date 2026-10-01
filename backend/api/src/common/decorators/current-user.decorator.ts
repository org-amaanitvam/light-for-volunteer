import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the authenticated principal into a controller method.
 *
 * By default that is the verified JWT payload
 * (`{ sub, email, role, typ }`) placed there by `JwtStrategy`.
 *
 * ```ts
 * @Get('me')
 * me(@CurrentUser() user: JwtAccessPayload) { ... }
 *
 * @Get('email')
 * email(@CurrentUser('email') email: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (data && user && typeof user === 'object') {
      return (user as Record<string, unknown>)[data];
    }
    return user;
  },
);
