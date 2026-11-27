import { ForbiddenException } from '@nestjs/common';
import { OrganisationMemberRole } from '../src/database/enums/organisation-member-role.enum';
import { OrganisationMemberStatus } from '../src/database/enums/organisation-member-status.enum';
import { OrganisationAccessService } from '../src/modules/organisations/organisation-access.service';

describe('OrganisationAccessService', () => {
  const find = jest.fn();
  const access = new OrganisationAccessService({ find } as never);

  beforeEach(() => {
    find.mockReset();
  });

  it('prefers the authenticated user’s approved owner membership', async () => {
    const ownerMembership = {
      role: OrganisationMemberRole.OWNER,
      status: OrganisationMemberStatus.APPROVED,
      organisation: { id: 'org-owned' },
    };
    find.mockResolvedValue([
      ownerMembership,
      {
        role: OrganisationMemberRole.VIEWER,
        status: OrganisationMemberStatus.APPROVED,
        organisation: { id: 'org-member' },
      },
    ]);

    await expect(access.findApprovedMembership('user-id')).resolves.toBe(
      ownerMembership,
    );
  });

  it('rejects ambiguous memberships rather than selecting another organisation', async () => {
    find.mockResolvedValue([
      {
        role: OrganisationMemberRole.VIEWER,
        status: OrganisationMemberStatus.APPROVED,
        organisation: { id: 'org-one' },
      },
      {
        role: OrganisationMemberRole.RECRUITER,
        status: OrganisationMemberStatus.APPROVED,
        organisation: { id: 'org-two' },
      },
    ]);

    await expect(access.findApprovedMembership('user-id')).rejects.toThrow(
      /more than one approved organisation membership/i,
    );
  });

  it('denies users without an approved owner membership', async () => {
    find.mockResolvedValue([]);

    await expect(access.requireApprovedOwnerMembership('user-id')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: OrganisationMemberRole.OWNER,
          status: OrganisationMemberStatus.APPROVED,
        }),
      }),
    );
  });
});
