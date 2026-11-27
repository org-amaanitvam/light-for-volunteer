import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { ApplicationStatus } from '../../database/enums/application-status.enum';

@Injectable()
export class CertificatesService {
  constructor(@InjectRepository(Application) private readonly applications: Repository<Application>) {}

  async listForVolunteer(userId: string) {
    const completed = await this.applications.find({
      where: { volunteer: { id: userId }, status: ApplicationStatus.COMPLETED },
      relations: { opportunity: { organisation: true } },
      order: { completed_at: 'DESC', applied_at: 'DESC' },
    });
    return completed.map((application) => ({
      id: application.id,
      certificateNumber: this.certificateNumber(application.id),
      opportunityTitle: application.opportunity.title,
      organisation: application.opportunity.organisation?.org_name ?? 'Partner organisation',
      completedAt: application.completed_at ?? application.applied_at,
      hoursVolunteered: application.completed_hours ?? 0,
      verified: true,
    }));
  }

  async createPdf(userId: string, applicationId: string): Promise<{ filename: string; content: Buffer }> {
    const application = await this.applications.findOne({
      where: { id: applicationId, volunteer: { id: userId }, status: ApplicationStatus.COMPLETED },
      relations: { volunteer: true, opportunity: { organisation: true } },
    });
    if (!application) throw new NotFoundException('Certificate not found for a completed opportunity');

    const certNumber = this.certificateNumber(application.id);
    const completedAt = application.completed_at ?? application.applied_at;
    const lines = [
      'CERTIFICATE OF COMPLETION',
      'This certificate is presented to',
      application.volunteer.name,
      `for completing ${application.opportunity.title}`,
      `with ${application.opportunity.organisation?.org_name ?? 'our partner organisation'}`,
      `Completed on ${new Date(completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}`,
      `Verified volunteer hours: ${application.completed_hours ?? 0}`,
      `Certificate ID: ${certNumber}`,
      'Light For Volunteer | Amaanitvam Foundation',
    ];
    return { filename: `${certNumber}.pdf`, content: this.renderPdf(lines) };
  }

  private certificateNumber(applicationId: string): string {
    return `LFV-${applicationId.replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  }

  private renderPdf(lines: string[]): Buffer {
    const safe = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '?').replace(/([\\()])/g, '\\$1');
    const positions = [530, 475, 430, 380, 340, 295, 255, 210, 145];
    const sizes = [26, 17, 28, 17, 17, 16, 16, 12, 14];
    const commands = lines.map((line, index) => `BT /F1 ${sizes[index]} Tf 90 ${positions[index]} Td (${safe(line)}) Tj ET`).join('\n');
    const stream = `q 0.13 0.45 0.68 RG 3 w 35 35 770 535 re S Q\n${commands}\n`;
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 840 605] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}endstream`,
    ];
    let document = '%PDF-1.4\n';
    const offsets = [0];
    for (const [index, object] of objects.entries()) {
      offsets.push(Buffer.byteLength(document, 'ascii'));
      document += `${index + 1} 0 obj\n${object}\nendobj\n`;
    }
    const xrefOffset = Buffer.byteLength(document, 'ascii');
    document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets.slice(1)) document += `${String(offset).padStart(10, '0')} 00000 n \n`;
    document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(document, 'ascii');
  }
}
