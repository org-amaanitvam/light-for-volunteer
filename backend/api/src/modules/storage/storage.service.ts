import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  DeleteObjectDto,
  PresignDownloadDto,
  PresignUploadDto,
  StoragePurpose,
} from '../../dtos/storage/storage.dto';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly uploadUrlExpiresIn = 300;
  private readonly downloadUrlExpiresIn = 300;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('storage.region');

    this.bucket = this.configService.getOrThrow<string>('storage.bucket');

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('storage.accessKeyId'),
        secretAccessKey:
          this.configService.getOrThrow<string>('storage.secretAccessKey'),
      },
    });
  }

  async createUploadUrl(
    user: JwtAccessPayload,
    dto: PresignUploadDto,
  ) {
    this.validatePurposeForRole(user, dto.purpose);
    this.validateFile(dto);

    const extension = this.getExtension(dto.fileName, dto.contentType);
    const key = this.buildKey(user, dto.purpose, extension);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.uploadUrlExpiresIn,
    });

    return {
      uploadUrl,
      key,
      expiresIn: this.uploadUrlExpiresIn,
      contentType: dto.contentType,
    };
  }

  async createDownloadUrl(
    user: JwtAccessPayload,
    dto: PresignDownloadDto,
  ) {
    this.assertKeyAccess(user, dto.key);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: dto.key,
    });

    const downloadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.downloadUrlExpiresIn,
    });

    return {
      downloadUrl,
      expiresIn: this.downloadUrlExpiresIn,
      key: dto.key,
    };
  }

  async deleteObject(
    user: JwtAccessPayload,
    dto: DeleteObjectDto,
  ) {
    this.assertKeyAccess(user, dto.key);

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: dto.key,
    });

    await this.s3.send(command);

    return {
      success: true,
      key: dto.key,
    };
  }

  private validateFile(dto: PresignUploadDto) {
    const allowedTypes: Record<StoragePurpose, string[]> = {
      [StoragePurpose.RESUME]: ['application/pdf'],

      [StoragePurpose.VERIFICATION]: ['application/pdf'],

      [StoragePurpose.PORTFOLIO]: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
      ],
    };

    const allowed = allowedTypes[dto.purpose];

    if (!allowed.includes(dto.contentType)) {
      throw new BadRequestException(
        `File type ${dto.contentType} is not allowed for ${dto.purpose}`,
      );
    }

    const maxSize = this.getMaxFileSize(dto.purpose);

    if (dto.fileSize > maxSize) {
      throw new BadRequestException(
        `File size exceeds the ${maxSize / (1024 * 1024)} MB limit`,
      );
    }

    const extension = extname(dto.fileName).toLowerCase();

    const allowedExtensions: Record<StoragePurpose, string[]> = {
      [StoragePurpose.RESUME]: ['.pdf'],
      [StoragePurpose.VERIFICATION]: ['.pdf'],
      [StoragePurpose.PORTFOLIO]: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    };

    if (!allowedExtensions[dto.purpose].includes(extension)) {
      throw new BadRequestException(
        `File extension ${extension} is not allowed for ${dto.purpose}`,
      );
    }
  }

  private getMaxFileSize(purpose: StoragePurpose): number {
    switch (purpose) {
      case StoragePurpose.RESUME:
        return 5 * 1024 * 1024;

      case StoragePurpose.VERIFICATION:
        return 10 * 1024 * 1024;

      case StoragePurpose.PORTFOLIO:
        return 10 * 1024 * 1024;
    }
  }

  private getExtension(
    fileName: string,
    contentType: string,
  ): string {
    const extension = extname(fileName).toLowerCase();

    if (extension) {
      return extension;
    }

    const extensions: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    return extensions[contentType] ?? '';
  }

  private buildKey(
    user: JwtAccessPayload,
    purpose: StoragePurpose,
    extension: string,
  ): string {
    const id = randomUUID();

    switch (purpose) {
      case StoragePurpose.RESUME:
        return `resumes/${user.sub}/${id}${extension}`;

      case StoragePurpose.VERIFICATION:
        return `verification-documents/${user.sub}/${id}${extension}`;

      case StoragePurpose.PORTFOLIO:
        return `portfolio/${user.sub}/${id}${extension}`;
    }
  }

  private validatePurposeForRole(
    user: JwtAccessPayload,
    purpose: StoragePurpose,
  ) {
    if (user.role === 'admin') {
      throw new ForbiddenException(
        'Admins cannot upload storage files through this endpoint',
      );
    }

    if (
      purpose === StoragePurpose.RESUME &&
      user.role !== 'volunteer'
    ) {
      throw new ForbiddenException(
        'Only volunteers can upload resumes',
      );
    }

    if (
      purpose === StoragePurpose.PORTFOLIO &&
      user.role !== 'volunteer'
    ) {
      throw new ForbiddenException(
        'Only volunteers can upload portfolio files',
      );
    }

    if (
      purpose === StoragePurpose.VERIFICATION &&
      user.role !== 'organisation'
    ) {
      throw new ForbiddenException(
        'Only organisations can upload verification documents',
      );
    }
  }

  private assertKeyAccess(
    user: JwtAccessPayload,
    key: string,
  ) {
    if (user.role === 'admin') {
      return;
    }

    const allowedPrefixes = [
      `resumes/${user.sub}/`,
      `portfolio/${user.sub}/`,
      `verification-documents/${user.sub}/`,
    ];

    const hasAccess = allowedPrefixes.some((prefix) =>
      key.startsWith(prefix),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this file',
      );
    }
  }
}