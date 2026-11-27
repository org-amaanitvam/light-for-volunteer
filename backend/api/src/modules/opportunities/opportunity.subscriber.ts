import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { SearchService } from '../search/search.service';

/**
 * TypeORM Subscriber that ensures the search index remains synchronized
 * with any database mutation of an Opportunity (inserts, updates, status changes, deletions).
 *
 * Owner: Aryan.
 */
@Injectable()
@EventSubscriber()
export class OpportunitySubscriber implements EntitySubscriberInterface<Opportunity> {
  private readonly logger = new Logger(OpportunitySubscriber.name);

  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
    private readonly searchService: SearchService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Opportunity;
  }

  async afterInsert(event: InsertEvent<Opportunity>): Promise<void> {
    if (event.entity?.status === OpportunityStatus.LIVE) {
      await this.searchService.syncOpportunity(event.entity);
    }
  }

  async afterUpdate(event: UpdateEvent<Opportunity>): Promise<void> {
    if (event.entity) {
      const opp = event.entity as Opportunity;
      if (opp.status === OpportunityStatus.LIVE) {
        await this.searchService.syncOpportunity(opp);
      } else {
        await this.searchService.removeOpportunity(opp.id);
      }
    }
  }

  async afterRemove(event: RemoveEvent<Opportunity>): Promise<void> {
    if (event.entityId) {
      await this.searchService.removeOpportunity(String(event.entityId));
    }
  }
}
