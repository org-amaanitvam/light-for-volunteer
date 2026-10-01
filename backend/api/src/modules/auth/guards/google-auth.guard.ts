import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

/**
 * Starts the Google OAuth 2.0 handshake. Fails fast with 503 while
 * `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are unset, instead of letting
 * passport redirect to Google with empty credentials.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    if (!this.config.get<boolean>('auth.google.enabled')) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server',
      );
    }
    return super.canActivate(context);
  }
}
