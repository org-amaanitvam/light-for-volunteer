import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
provider: process.env.STORAGE_PROVIDER ?? 'r2',
region: process.env.R2_REGION ?? 'auto',
endpoint: process.env.R2_ENDPOINT ?? '',
bucket: process.env.R2_BUCKET_NAME ?? '',
accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
}));
