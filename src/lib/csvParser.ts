// CSV Parser for Lead Import
// Supports standard CSV, handles various delimiters and encodings

export interface ParsedLead {
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    linkedInUrl: string;
    email?: string;
}

export interface ParseResult {
    leads: ParsedLead[];
    errors: ParseError[];
    totalRows: number;
    skippedRows: number;
    headers: string[];
}

export interface ParseError {
    row: number;
    field: string;
    message: string;
}

// Common column name mappings
const COLUMN_MAPPINGS: Record<string, string> = {
    // First name
    'first name': 'firstName',
    'firstname': 'firstName',
    'first_name': 'firstName',
    'given name': 'firstName',
    'name': 'firstName',

    // Last name
    'last name': 'lastName',
    'lastname': 'lastName',
    'last_name': 'lastName',
    'surname': 'lastName',
    'family name': 'lastName',

    // Company
    'company': 'company',
    'company name': 'company',
    'organization': 'company',
    'org': 'company',
    'employer': 'company',

    // Title
    'title': 'title',
    'job title': 'title',
    'position': 'title',
    'role': 'title',
    'job_title': 'title',

    // LinkedIn
    'linkedin': 'linkedInUrl',
    'linkedin url': 'linkedInUrl',
    'linkedin_url': 'linkedInUrl',
    'linkedin profile': 'linkedInUrl',
    'profile url': 'linkedInUrl',
    'profile': 'linkedInUrl',
    'url': 'linkedInUrl',

    // Email
    'email': 'email',
    'email address': 'email',
    'e-mail': 'email',
    'email_address': 'email',
};

// Parse CSV text into structured data
export function parseCSV(text: string): ParseResult {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length === 0) {
        return { leads: [], errors: [{ row: 0, field: '', message: 'Empty file' }], totalRows: 0, skippedRows: 0, headers: [] };
    }

    // Detect delimiter
    const delimiter = detectDelimiter(lines[0]);

    // Parse header row
    const rawHeaders = parseLine(lines[0], delimiter);
    const headers = rawHeaders.map(h => h.trim());

    // Map headers to our field names
    const fieldMap = mapHeaders(headers);

    const leads: ParsedLead[] = [];
    const errors: ParseError[] = [];
    let skippedRows = 0;

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i], delimiter);

        if (values.length === 0 || values.every(v => !v.trim())) {
            skippedRows++;
            continue;
        }

        const row: Record<string, string> = {};
        headers.forEach((_, idx) => {
            const fieldName = fieldMap[idx];
            if (fieldName && values[idx]) {
                row[fieldName] = values[idx].trim();
            }
        });

        // Handle "name" field (split into first/last)
        if (row.firstName && !row.lastName && row.firstName.includes(' ')) {
            const parts = row.firstName.split(' ');
            row.firstName = parts[0];
            row.lastName = parts.slice(1).join(' ');
        }

        // Validate required fields
        const rowErrors: ParseError[] = [];
        if (!row.firstName) rowErrors.push({ row: i + 1, field: 'firstName', message: 'Missing first name' });
        if (!row.lastName) rowErrors.push({ row: i + 1, field: 'lastName', message: 'Missing last name' });
        if (!row.company) rowErrors.push({ row: i + 1, field: 'company', message: 'Missing company' });
        if (!row.title) rowErrors.push({ row: i + 1, field: 'title', message: 'Missing title' });

        // Generate LinkedIn URL if not provided
        if (!row.linkedInUrl && row.firstName && row.lastName) {
            row.linkedInUrl = `https://linkedin.com/in/${row.firstName.toLowerCase()}-${row.lastName.toLowerCase()}`;
        }

        if (rowErrors.length > 0) {
            errors.push(...rowErrors);
            if (!row.firstName || !row.lastName) {
                skippedRows++;
                continue; // Skip rows without names
            }
        }

        leads.push({
            firstName: row.firstName || 'Unknown',
            lastName: row.lastName || 'Unknown',
            company: row.company || 'Unknown',
            title: row.title || 'Unknown',
            linkedInUrl: row.linkedInUrl || '',
            email: row.email,
        });
    }

    return {
        leads,
        errors,
        totalRows: lines.length - 1,
        skippedRows,
        headers,
    };
}

// Detect CSV delimiter
function detectDelimiter(headerLine: string): string {
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCount = 0;

    for (const d of delimiters) {
        const count = (headerLine.match(new RegExp(d === '|' ? '\\|' : d, 'g')) || []).length;
        if (count > maxCount) {
            maxCount = count;
            bestDelimiter = d;
        }
    }

    return bestDelimiter;
}

// Parse a single CSV line (handles quoted fields)
function parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

// Map CSV headers to our field names
function mapHeaders(headers: string[]): Record<number, string> {
    const map: Record<number, string> = {};

    headers.forEach((header, idx) => {
        const normalized = header.toLowerCase().trim().replace(/['"]/g, '');
        const fieldName = COLUMN_MAPPINGS[normalized];
        if (fieldName) {
            map[idx] = fieldName;
        }
    });

    return map;
}

// Validate a file before parsing
export function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.csv', '.txt', '.tsv'];

    if (file.size > maxSize) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext) && !allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Please upload a CSV file.' };
    }

    return { valid: true };
}

// Read file as text
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
