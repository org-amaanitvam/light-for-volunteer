import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { QueryOpportunityDto } from '../../dtos/opportunity/query-opportunity.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'search', status: 'ok', owner: 'Aryan' };
  }

  @Public()
  @ApiOperation({ summary: 'Faceted search & filter across live opportunities' })
  @Get('opportunities')
  searchOpportunities(@Query() query: QueryOpportunityDto) {
    return this.searchService.searchOpportunities(query);
  }

  @Public()
  @ApiOperation({ summary: 'Get facet counts for categories, opportunity types, and location types' })
  @Get('facets')
  getFacets() {
    return this.searchService.getFacets();
  }

  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Rebuild search index from PostgreSQL (Admin only)' })
  @Post('reindex')
  reindex() {
    return this.searchService.reindexAll();
  }
}
