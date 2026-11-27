import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationMember } from '../../database/entities/organisation-member.entity';
import { OrganisationMemberRole } from '../../database/enums/organisation-member-role.enum';
import { OrganisationMemberStatus } from '../../database/enums/organisation-member-status.enum';

@Injectable()
export class OrganisationAccessService {
  constructor(
    @InjectRepository(OrganisationMember)
    private readonly members: Repository<OrganisationMember>,
  ) {}

  async findApprovedMembership(userId: string): Promise<OrganisationMember | null> {
    const memberships = await this.members.find({
      where: {
        user: { id: userId },
        status: OrganisationMemberStatus.APPROVED,
      },
      relations: { organisation: true, user: true },
    });

    const owned = memberships.filter(
      (membership) => membership.role === OrganisationMemberRole.OWNER,
    );
    if (owned.length === 1) {
      const owner = owned[0];
      if (owner) return owner;
    }
    if (owned.length > 1 || memberships.length > 1) {
      throw new ConflictException(
        'More than one approved organisation membership exists; use an organisation-specific route',
      );
    }
    return memberships[0] ?? null;
  }

  async findApprovedOwnerMembership(
    userId: string,
  ): Promise<OrganisationMember | null> {
    const memberships = await this.members.find({
      where: {
        user: { id: userId },
        role: OrganisationMemberRole.OWNER,
        status: OrganisationMemberStatus.APPROVED,
      },
      relations: { organisation: true, user: true },
    });

    if (memberships.length > 1) {
      throw new ConflictException(
        'More than one approved owner membership exists; use an organisation-specific route',
      );
    }
    return memberships[0] ?? null;
  }

  findApprovedOwnerMembershipForOrganisation(
    organisationId: string,
  ): Promise<OrganisationMember | null> {
    return this.members.findOne({
      where: {
        organisation: { id: organisationId },
        role: OrganisationMemberRole.OWNER,
        status: OrganisationMemberStatus.APPROVED,
      },
      relations: { user: true },
    });
  }

  async requireApprovedMembership(userId: string): Promise<OrganisationMember> {
    const membership = await this.findApprovedMembership(userId);
    if (!membership?.organisation) {
      throw new ForbiddenException('Approved organisation membership is required');
    }
    return membership;
  }

  async requireApprovedOwnerMembership(userId: string): Promise<OrganisationMember> {
    const membership = await this.findApprovedOwnerMembership(userId);
    if (!membership?.organisation) {
      throw new ForbiddenException('Approved organisation owner membership is required');
    }
    return membership;
  }
}
