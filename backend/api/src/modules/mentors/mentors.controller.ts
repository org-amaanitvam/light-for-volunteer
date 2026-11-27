import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Patch } from '@nestjs/common';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { MentorsService } from './mentors.service';

@ApiTags('mentors')
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentors: MentorsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List registered mentors for the public directory' })
  list() {
    return this.mentors.list();
  }

  @Roles('mentor')
  @Get('me')
  getMine(@CurrentUser('sub') userId: string) {
    return this.mentors.getMine(userId);
  }

  @Roles('mentor')
  @Patch('me')
  updateMine(@CurrentUser('sub') userId: string, @Body() body: UpdateMentorProfileDto) {
    return this.mentors.updateMine(userId, body);
  }
}
