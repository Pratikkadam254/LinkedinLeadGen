/**
 * CSV Exporter
 *
 * Generates and downloads a CSV file from extracted leads.
 * Matches Evaboot's export format for compatibility.
 */

import type { ExtractedLead } from '../shared/types';

const CSV_HEADERS = [
  'First Name',
  'Last Name',
  'Title',
  'Company',
  'LinkedIn URL',
  'Location',
  'Company Headcount',
  'Company Industry',
  'Company HQ',
  'Company LinkedIn URL',
  'Company Type',
  'Connection Degree',
  'Shared Connections',
  'Followers',
] as const;

function escapeCsvField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert extracted leads to CSV string.
 */
export function leadsToCSV(leads: ExtractedLead[]): string {
  const rows = [CSV_HEADERS.join(',')];

  for (const lead of leads) {
    const row = [
      lead.firstName,
      lead.lastName,
      lead.title,
      lead.company,
      lead.linkedInUrl,
      lead.location,
      lead.companyHeadcount,
      lead.companyIndustry,
      lead.companyHeadquarters,
      lead.companyLinkedInUrl,
      lead.companyType,
      lead.connectionDegree,
      lead.sharedConnections,
      lead.followers,
    ].map(escapeCsvField);

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV(leads: ExtractedLead[], filename?: string): void {
  const csv = leadsToCSV(leads);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const name = filename || `leadflow-export-${new Date().toISOString().slice(0, 10)}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
