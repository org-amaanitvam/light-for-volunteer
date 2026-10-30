import {
  Body,
  Controller,
  Delete,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';

import {
  DeleteObjectDto,
  PresignDownloadDto,
  PresignUploadDto,
  VerifyUploadDto,
} from '../../dtos/storage/storage.dto';

import { StorageService } from './storage.service';

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(
    private readonly service: StorageService,
  ) {}

  @Post('presign-upload')
  @ApiOperation({
    summary: 'Generate a presigned S3 upload URL',
  })
  createUploadUrl(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: PresignUploadDto,
  ) {
    return this.service.createUploadUrl(user, dto);
  }

  @Post('presign-download')
  @ApiOperation({
    summary: 'Generate a presigned S3 download URL',
  })
  createDownloadUrl(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: PresignDownloadDto,
  ) {
    return this.service.createDownloadUrl(user, dto);
  }

  @Delete('object')
  @ApiOperation({
    summary: 'Delete an S3 object',
  })
  deleteObject(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: DeleteObjectDto,
  ) {
    return this.service.deleteObject(user, dto);
  }
  
@Post('verify-upload')
@ApiOperation({
  summary: 'Verify an uploaded storage object',
})
verifyUpload(
  @CurrentUser() user: JwtAccessPayload,
  @Body() dto: VerifyUploadDto,
) {
  return this.service.verifyUpload(user, dto.key);
}
}