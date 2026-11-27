import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UpdateVolunteerProfileDto } from '../../dtos/volunteer-profile/update-volunteer-profile.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { VolunteersService } from './volunteers.service';

@ApiTags('volunteers')
@ApiBearerAuth()
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly service: VolunteersService) {}

  @Roles('volunteer')
  @Get('profile')
  @ApiOperation({ summary: 'Get or create the authenticated volunteer profile' })
  getProfile(@CurrentUser('sub') userId: string) {
    return this.service.getMyProfile(userId);
  }

  @Roles('volunteer')
  @Patch('profile')
  @ApiOperation({ summary: 'Update the authenticated volunteer profile' })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() body: UpdateVolunteerProfileDto,
  ) {
    return this.service.updateMyProfile(userId, body);
  }

  @Public()
  @Get('ping')
  ping() {
    return { module: 'volunteers', status: 'ok', owner: 'Dhruv' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a volunteer public profile by user id' })
  getPublicProfile(@Param('id', ParseUUIDPipe) userId: string) {
    return this.service.getPublicProfile(userId);
  }
}
