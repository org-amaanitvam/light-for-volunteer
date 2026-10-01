import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
}));
