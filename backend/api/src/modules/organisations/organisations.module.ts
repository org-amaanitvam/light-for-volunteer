import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../../database/entities/organisation.entity';
import { OrganisationMember } from '../../database/entities/organisation-member.entity';
import { Review } from '../../database/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { OrganisationDocument } from '../../database/entities/organisation-document.entity';
import { OrganisationDocumentsModule } from './organisation-documents.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organisation,
      OrganisationMember,
      OrganisationDocument,
      Review,
      User,
    ]),
    OrganisationDocumentsModule,
    StorageModule,
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
})
export class OrganisationsModule {}
