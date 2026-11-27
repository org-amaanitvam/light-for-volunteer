import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../../database/entities/organisation.entity';
import { OrganisationDocument } from '../../database/entities/organisation-document.entity';
import { OrganisationMember } from '../../database/entities/organisation-member.entity';
import { StorageModule } from '../storage/storage.module';
import { OrganisationDocumentRulesService } from './organisation-document-rules.service';
import { OrganisationDocumentsController } from './organisation-documents.controller';
import { OrganisationDocumentsService } from './organisation-documents.service';
import { OrganisationAccessService } from './organisation-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organisation,
      OrganisationMember,
      OrganisationDocument,
    ]),
    StorageModule,
  ],
  controllers: [OrganisationDocumentsController],
  providers: [
    OrganisationDocumentRulesService,
    OrganisationAccessService,
    OrganisationDocumentsService,
  ],
  exports: [
    OrganisationDocumentRulesService,
    OrganisationAccessService,
    OrganisationDocumentsService,
  ],
})
export class OrganisationDocumentsModule {}
