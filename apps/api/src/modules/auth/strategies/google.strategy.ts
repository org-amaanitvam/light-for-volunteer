import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { DEFAULT_ROLE } from '@lfv/types';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

/**
 * Google OAuth 2.0 handshake.
 *
 * `validate()` runs on the callback and implements find-or-provision:
 *  1. existing user with this `googleId` → sign in,
 *  2. existing user with the same email → link `googleId` (local→Google),
 *  3. otherwise provision a new account with the default `volunteer` role.
 *
 * The chosen role is decided later, on `POST /auth/exchange`.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      clientID: config.get<string>('auth.google.clientId') || 'not-configured',
      clientSecret: config.get<string>('auth.google.clientSecret') || 'not-configured',
      callbackURL: config.get<string>('auth.google.callbackUrl'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const googleId = profile?.id;
    if (!googleId) {
      throw new UnauthorizedException('Google did not return a profile id');
    }

    const byGoogle = await this.users.findByGoogleId(googleId);
    if (byGoogle) return byGoogle;

    const email = profile.emails?.[0]?.value?.toLowerCase().trim();
    if (!email) {
      throw new BadRequestException(
        'Your Google account has no email address; add one and try again',
      );
    }

    const byEmail = await this.users.findByEmail(email);
    if (byEmail) {
      if (byEmail.googleId && byEmail.googleId !== googleId) {
        throw new UnauthorizedException(
          'This email is already linked to a different Google account',
        );
      }
      // First Google sign-in for an existing password account → link it.
      return this.users.attachGoogleId(byEmail.id, googleId);
    }

    const displayName =
      profile.displayName?.trim() ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(' ') ||
      email;

    return this.users.create({
      email,
      name: displayName,
      passwordHash: null,
      role: DEFAULT_ROLE,
      googleId,
    });
  }
}
