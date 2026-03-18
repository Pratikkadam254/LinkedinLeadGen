export interface ParsedLead {
  linkedinUrl: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  message?: string;
}

export interface ParseResult {
  leads: ParsedLead[];
  errors: ParseError[];
  totalRows: number;
  skippedRows: number;
  headers: string[];
  hasMessageColumn: boolean;
  messageTooLong: ParseError[];
  duplicatesRemoved: number;
}

export interface ParseError {
  row: number;
  field: string;
  message: string;
}

const COLUMN_MAPPINGS: Record<string, keyof ParsedLead> = {
  "linkedin": "linkedinUrl",
  "linkedin url": "linkedinUrl",
  "linkedin_url": "linkedinUrl",
  "linkedin profile": "linkedinUrl",
  "linkedin profile url": "linkedinUrl",
  "linkedin profile url of the company's owner or ceo": "linkedinUrl",
  "profile url": "linkedinUrl",
  "url": "linkedinUrl",
  "first name": "firstName",
  "firstname": "firstName",
  "first_name": "firstName",
  "name": "firstName",
  "last name": "lastName",
  "lastname": "lastName",
  "last_name": "lastName",
  "company": "company",
  "company name": "company",
  "organization": "company",
  "title": "title",
  "job title": "title",
  "position": "title",
  "role": "title",
  "message": "message",
  "draft message": "message",
  "draft_message": "message",
  "connection message": "message",
  "note": "message",
};

export function parseCSV(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      leads: [], errors: [{ row: 0, field: "", message: "Empty file" }],
      totalRows: 0, skippedRows: 0, headers: [],
      hasMessageColumn: false, messageTooLong: [], duplicatesRemoved: 0,
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseLine(lines[0], delimiter);
  const headers = rawHeaders.map((h) => h.trim());
  const fieldMap = mapHeaders(headers);
  const hasMessageColumn = Object.values(fieldMap).includes("message");

  const leads: ParsedLead[] = [];
  const errors: ParseError[] = [];
  const messageTooLong: ParseError[] = [];
  let skippedRows = 0;
  const seenUrls = new Set<string>();
  let duplicatesRemoved = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    if (values.length === 0 || values.every((v) => !v.trim())) {
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

    if (row.firstName && !row.lastName && row.firstName.includes(" ")) {
      const parts = row.firstName.split(" ");
      row.firstName = parts[0];
      row.lastName = parts.slice(1).join(" ");
    }

    if (!row.linkedinUrl || !isValidLinkedInUrl(row.linkedinUrl)) {
      errors.push({ row: i + 1, field: "linkedinUrl", message: "Missing or invalid LinkedIn URL" });
      skippedRows++;
      continue;
    }

    const normalizedUrl = row.linkedinUrl.toLowerCase().trim();
    if (seenUrls.has(normalizedUrl)) {
      duplicatesRemoved++;
      continue;
    }
    seenUrls.add(normalizedUrl);

    if (row.message && row.message.length > 300) {
      messageTooLong.push({
        row: i + 1, field: "message",
        message: `Message is ${row.message.length} chars (max 300)`,
      });
    }

    leads.push({
      linkedinUrl: row.linkedinUrl,
      firstName: row.firstName,
      lastName: row.lastName,
      company: row.company,
      title: row.title,
      message: row.message,
    });
  }

  return {
    leads, errors, totalRows: lines.length - 1, skippedRows,
    headers, hasMessageColumn, messageTooLong, duplicatesRemoved,
  };
}

function isValidLinkedInUrl(url: string): boolean {
  return url.includes("linkedin.com/in/");
}

function detectDelimiter(headerLine: string): string {
  const delimiters = [",", ";", "\t", "|"];
  let best = ",";
  let maxCount = 0;
  for (const d of delimiters) {
    const count = (headerLine.match(new RegExp(d === "|" ? "\\|" : d, "g")) || []).length;
    if (count > maxCount) { maxCount = count; best = d; }
  }
  return best;
}

function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === delimiter && !inQuotes) {
      result.push(current); current = "";
    } else { current += char; }
  }
  result.push(current);
  return result;
}

function mapHeaders(headers: string[]): Record<number, keyof ParsedLead> {
  const map: Record<number, keyof ParsedLead> = {};
  headers.forEach((header, idx) => {
    const normalized = header.toLowerCase().trim().replace(/['"]/g, "");
    const fieldName = COLUMN_MAPPINGS[normalized];
    if (fieldName) map[idx] = fieldName;
  });
  return map;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) return { valid: false, error: "File exceeds 10MB" };
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (![".csv", ".txt", ".tsv"].includes(ext)) {
    return { valid: false, error: "Please upload a CSV file" };
  }
  return { valid: true };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
