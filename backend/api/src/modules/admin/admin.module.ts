import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../../database/entities/organisation.entity';
import { OrganisationMember } from '../../database/entities/organisation-member.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { Report } from '../../database/entities/report.entity';
import { Review } from '../../database/entities/review.entity';
import { Message } from '../../database/entities/message.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StorageModule } from '../storage/storage.module';
import { Application } from '../../database/entities/application.entity';
import { OrganisationDocument } from '../../database/entities/organisation-document.entity';
import { OrganisationDocumentsModule } from '../organisations/organisation-documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organisation,
      OrganisationMember,
      Opportunity,
      Report,
      Review,
      Message,
      AuditLog,
      Application,
      OrganisationDocument,
    ]),
    StorageModule,
    OrganisationDocumentsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}