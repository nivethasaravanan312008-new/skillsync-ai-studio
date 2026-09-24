/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbStore } from '../db/database.ts';
import {
  Skill,
  Job,
  Employer,
  ExtractedSkillMapping,
  IngestionParsedRow,
  IngestionPreviewResponse,
  IngestionBatchRecord,
  IngestionExecutionRequest,
  IngestionExecutionResponse
} from '../../src/types/dataModel.ts';

/**
 * Normalization Dictionary:
 * Maps common variations, abbreviations, and acronyms to canonical display names
 * and target skill identifiers in the national qualification taxonomy.
 */
interface VariationRule {
  normalized: string;
  targetSkillId?: string;
  importance?: 'critical' | 'preferred' | 'optional';
  minProficiency?: 'basic' | 'intermediate' | 'advanced';
}

const CANONICAL_VARIATION_MAP: Record<string, VariationRule> = {
  // Required Explicit Variations:
  // "JS" → JavaScript
  'js': { normalized: 'JavaScript', targetSkillId: 'sk-javascript-core' },
  'javascript': { normalized: 'JavaScript', targetSkillId: 'sk-javascript-core' },
  'vanilla js': { normalized: 'JavaScript', targetSkillId: 'sk-javascript-core' },
  'es6': { normalized: 'JavaScript', targetSkillId: 'sk-javascript-core' },
  'ecmascript': { normalized: 'JavaScript', targetSkillId: 'sk-javascript-core' },

  // "React.js" → React
  'react.js': { normalized: 'React', targetSkillId: 'sk-react-frontend' },
  'reactjs': { normalized: 'React', targetSkillId: 'sk-react-frontend' },
  'react': { normalized: 'React', targetSkillId: 'sk-react-frontend' },
  'react native': { normalized: 'React', targetSkillId: 'sk-react-frontend' },

  // "Postgres" → PostgreSQL
  'postgres': { normalized: 'PostgreSQL', targetSkillId: 'sk-sql-rdbms' },
  'postgresql': { normalized: 'PostgreSQL', targetSkillId: 'sk-sql-rdbms' },
  'pgsql': { normalized: 'PostgreSQL', targetSkillId: 'sk-sql-rdbms' },
  'postgres db': { normalized: 'PostgreSQL', targetSkillId: 'sk-sql-rdbms' },

  // "ML" → Machine Learning
  'ml': { normalized: 'Machine Learning', targetSkillId: 'sk-ml-models' },
  'machine learning': { normalized: 'Machine Learning', targetSkillId: 'sk-ml-models' },
  'deep learning': { normalized: 'Machine Learning', targetSkillId: 'sk-ml-models' },
  'ai/ml': { normalized: 'Machine Learning', targetSkillId: 'sk-ml-models' },

  // Explicit Example: "Python, FastAPI, REST API, Docker and AWS"
  'python': { normalized: 'Python', targetSkillId: 'sk-python-backend' },
  'python3': { normalized: 'Python', targetSkillId: 'sk-python-backend' },
  'python 3': { normalized: 'Python', targetSkillId: 'sk-python-backend' },
  'py': { normalized: 'Python', targetSkillId: 'sk-python-backend' },

  'fastapi': { normalized: 'FastAPI', targetSkillId: 'sk-fastapi' },
  'fast api': { normalized: 'FastAPI', targetSkillId: 'sk-fastapi' },

  'rest api': { normalized: 'REST APIs', targetSkillId: 'sk-rest-apis' },
  'rest apis': { normalized: 'REST APIs', targetSkillId: 'sk-rest-apis' },
  'restful api': { normalized: 'REST APIs', targetSkillId: 'sk-rest-apis' },
  'restful apis': { normalized: 'REST APIs', targetSkillId: 'sk-rest-apis' },
  'rest': { normalized: 'REST APIs', targetSkillId: 'sk-rest-apis' },
  'restful web services': { normalized: 'REST APIs', targetSkillId: 'sk-rest-apis' },

  'docker': { normalized: 'Docker', targetSkillId: 'sk-docker-containers' },
  'containers': { normalized: 'Docker', targetSkillId: 'sk-docker-containers' },
  'docker compose': { normalized: 'Docker', targetSkillId: 'sk-docker-containers' },

  'aws': { normalized: 'AWS', targetSkillId: 'sk-aws-cloud' },
  'amazon web services': { normalized: 'AWS', targetSkillId: 'sk-aws-cloud' },
  'aws cloud': { normalized: 'AWS', targetSkillId: 'sk-aws-cloud' },

  // Core Software & Cloud
  'ts': { normalized: 'TypeScript', targetSkillId: 'sk-fullstack-ts' },
  'typescript': { normalized: 'TypeScript', targetSkillId: 'sk-fullstack-ts' },
  'node': { normalized: 'Node.js', targetSkillId: 'sk-fullstack-ts' },
  'nodejs': { normalized: 'Node.js', targetSkillId: 'sk-fullstack-ts' },
  'node.js': { normalized: 'Node.js', targetSkillId: 'sk-fullstack-ts' },
  'k8s': { normalized: 'Kubernetes', targetSkillId: 'sk-cloud-devops' },
  'kubernetes': { normalized: 'Kubernetes', targetSkillId: 'sk-cloud-devops' },
  'devops': { normalized: 'Cloud Architecture & DevOps', targetSkillId: 'sk-cloud-devops' },
  'sql': { normalized: 'PostgreSQL & Relational Database Management', targetSkillId: 'sk-sql-rdbms' },

  // Manufacturing & Core Engineering
  'cnc': { normalized: 'CNC 5-Axis Milling & G-Code Programming', targetSkillId: 'sk-cnc-prog' },
  'g-code': { normalized: 'CNC 5-Axis Milling & G-Code Programming', targetSkillId: 'sk-cnc-prog' },
  'vmc': { normalized: 'CNC 5-Axis Milling & G-Code Programming', targetSkillId: 'sk-cnc-prog' },
  'plc': { normalized: 'PLC Programming & SCADA Industrial Automation', targetSkillId: 'sk-plc-scada' },
  'scada': { normalized: 'PLC Programming & SCADA Industrial Automation', targetSkillId: 'sk-plc-scada' },
  'cad': { normalized: 'Siemens NX & SolidWorks CAD/CAM Tooling', targetSkillId: 'sk-cad-cam' },
  'solidworks': { normalized: 'Siemens NX & SolidWorks CAD/CAM Tooling', targetSkillId: 'sk-cad-cam' },
  'cmm': { normalized: 'CMM Precision Inspection & GD&T Standards', targetSkillId: 'sk-cmm-inspect' },

  // Automotive & EV
  'bms': { normalized: 'EV Battery Management System (BMS) Calibration', targetSkillId: 'sk-ev-battery' },
  'ev battery': { normalized: 'EV Battery Management System (BMS) Calibration', targetSkillId: 'sk-ev-battery' },
  'can bus': { normalized: 'Automotive CAN-Bus & OBD-II Diagnostics', targetSkillId: 'sk-auto-diag' },
  'can-bus': { normalized: 'Automotive CAN-Bus & OBD-II Diagnostics', targetSkillId: 'sk-auto-diag' },
  'obd-ii': { normalized: 'Automotive CAN-Bus & OBD-II Diagnostics', targetSkillId: 'sk-auto-diag' },

  // Electronics & Healthcare
  'smt': { normalized: 'Surface Mount Technology (SMT) Pick-and-Place', targetSkillId: 'sk-smt-assembly' },
  'pcb': { normalized: 'High-Speed Multilayer PCB Layout (Altium Designer)', targetSkillId: 'sk-pcb-design' },
  'altium': { normalized: 'High-Speed Multilayer PCB Layout (Altium Designer)', targetSkillId: 'sk-pcb-design' },
  'iot': { normalized: 'Industrial IoT Edge Gateway & MQTT Protocols', targetSkillId: 'sk-iot-sensor' },
  'wms': { normalized: 'Warehouse Management Systems (WMS) & RFID Tracking', targetSkillId: 'sk-wms-rfid' },
  'tally': { normalized: 'Tally Prime & Indian GST Compliance Accounting', targetSkillId: 'sk-tally-prime' },
  'gst': { normalized: 'Tally Prime & Indian GST Compliance Accounting', targetSkillId: 'sk-tally-prime' },
  'safety': { normalized: 'OSHA & Industrial Workplace Safety Hazard Mitigation', targetSkillId: 'sk-industrial-safety' },
  'osha': { normalized: 'OSHA & Industrial Workplace Safety Hazard Mitigation', targetSkillId: 'sk-industrial-safety' }
};

export class SkillExtractionService {
  /**
   * Extract and normalize skills from both explicit skill column text and free-form job descriptions.
   */
  public extractAndNormalizeSkills(
    rawSkillsInput?: string,
    jobDescriptionInput?: string
  ): {
    extractedSkills: ExtractedSkillMapping[];
    unmatchedTerms: string[];
    rawSkillText: string;
  } {
    const db = dbStore.getFullDb();
    const allSkills = db.skills;

    const rawCombined = [rawSkillsInput, jobDescriptionInput].filter(Boolean).join(' | ');
    const extractedMap = new Map<string, ExtractedSkillMapping>();
    const unmatched = new Set<string>();

    // 1. Process candidate tokens from the explicit skills input
    if (rawSkillsInput) {
      // Split by commas, semicolons, pipes, newlines, slashes, or conjunctions like ' and '
      const tokens = this.splitSkillTerms(rawSkillsInput);
      for (const token of tokens) {
        const match = this.matchTokenToSkill(token, allSkills);
        if (match) {
          extractedMap.set(match.matchedSkillId, match);
        } else if (token.length > 1) {
          unmatched.add(token);
        }
      }
    }

    // 2. Scan job description for contextual skills & variations
    if (jobDescriptionInput) {
      const descMatches = this.scanDescriptionForSkills(jobDescriptionInput, allSkills);
      for (const match of descMatches) {
        if (!extractedMap.has(match.matchedSkillId)) {
          extractedMap.set(match.matchedSkillId, match);
        }
      }
    }

    return {
      extractedSkills: Array.from(extractedMap.values()),
      unmatchedTerms: Array.from(unmatched).slice(0, 10),
      rawSkillText: rawSkillsInput || ''
    };
  }

  /**
   * Helper to split a skills column string cleanly
   */
  private splitSkillTerms(text: string): string[] {
    return text
      .split(/[,;\n\r|/]+|\band\b|\bwith\b|\bplus\b/gi)
      .map(t => t.trim().replace(/^[-•*#\s]+/, '').replace(/[-•*#\s]+$/, ''))
      .filter(t => t.length > 0 && !['and', 'with', 'or', 'the', 'in', 'of', 'for'].includes(t.toLowerCase()));
  }

  /**
   * Match a single token against variation map, skill catalog names, and skill aliases
   */
  private matchTokenToSkill(rawToken: string, catalog: Skill[]): ExtractedSkillMapping | null {
    const cleaned = rawToken.trim();
    if (!cleaned) return null;
    const lower = cleaned.toLowerCase();

    // Check Variation Dictionary (e.g. JS -> JavaScript, React.js -> React, Postgres -> PostgreSQL, ML -> Machine Learning)
    if (CANONICAL_VARIATION_MAP[lower]) {
      const rule = CANONICAL_VARIATION_MAP[lower];
      // Find matching skill in database
      const skill = rule.targetSkillId
        ? catalog.find(s => s.id === rule.targetSkillId)
        : catalog.find(s => s.name.toLowerCase().includes(rule.normalized.toLowerCase()) || s.aliases.some(a => a.toLowerCase() === lower));

      if (skill) {
        return {
          rawTerm: cleaned,
          normalizedTerm: rule.normalized,
          matchedSkillId: skill.id,
          matchedSkillName: skill.name,
          confidence: 0.98,
          isVariationMapped: cleaned.toLowerCase() !== rule.normalized.toLowerCase(),
          importance: rule.importance || 'critical',
          minProficiency: rule.minProficiency || 'intermediate'
        };
      }
    }

    // Direct Exact or Case-Insensitive Match on Skill Name
    const exactNameSkill = catalog.find(s => s.name.toLowerCase() === lower);
    if (exactNameSkill) {
      return {
        rawTerm: cleaned,
        normalizedTerm: exactNameSkill.name,
        matchedSkillId: exactNameSkill.id,
        matchedSkillName: exactNameSkill.name,
        confidence: 1.0,
        isVariationMapped: false,
        importance: 'critical',
        minProficiency: 'intermediate'
      };
    }

    // Match on Aliases
    const aliasSkill = catalog.find(s => s.aliases.some(a => a.toLowerCase() === lower));
    if (aliasSkill) {
      const matchedAlias = aliasSkill.aliases.find(a => a.toLowerCase() === lower) || cleaned;
      return {
        rawTerm: cleaned,
        normalizedTerm: matchedAlias,
        matchedSkillId: aliasSkill.id,
        matchedSkillName: aliasSkill.name,
        confidence: 0.95,
        isVariationMapped: true,
        importance: 'critical',
        minProficiency: 'intermediate'
      };
    }

    // Fuzzy Partial Substring Match on Skill Name or Alias
    const partialSkill = catalog.find(s => {
      const sNameLower = s.name.toLowerCase();
      return (sNameLower.includes(lower) && lower.length >= 4) ||
             s.aliases.some(a => a.toLowerCase().includes(lower) && lower.length >= 4);
    });

    if (partialSkill) {
      return {
        rawTerm: cleaned,
        normalizedTerm: partialSkill.name,
        matchedSkillId: partialSkill.id,
        matchedSkillName: partialSkill.name,
        confidence: 0.85,
        isVariationMapped: true,
        importance: 'preferred',
        minProficiency: 'intermediate'
      };
    }

    return null;
  }

  /**
   * Contextually scan free-form text / description for skill mentions and keywords
   */
  private scanDescriptionForSkills(description: string, catalog: Skill[]): ExtractedSkillMapping[] {
    const results: ExtractedSkillMapping[] = [];
    const seenSkillIds = new Set<string>();

    // 1. Scan for canonical variation keys in text using word boundaries
    // Sort keys by length descending so longer phrases match before substrings (e.g. "REST API" before "REST", "React.js" before "React")
    const variationKeys = Object.keys(CANONICAL_VARIATION_MAP).sort((a, b) => b.length - a.length);

    for (const key of variationKeys) {
      // Escape special characters in key for RegExp
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Lookbehind and lookahead for clean alphanumeric boundaries (handles punct like .,; and special tokens like C++)
      const regex = new RegExp(`(?<![a-zA-Z0-9])${escapedKey}(?![a-zA-Z0-9])`, 'i');

      if (regex.test(description)) {
        const rule = CANONICAL_VARIATION_MAP[key];
        const skill = rule.targetSkillId
          ? catalog.find(s => s.id === rule.targetSkillId)
          : catalog.find(s => s.name.toLowerCase().includes(rule.normalized.toLowerCase()) || s.aliases.some(a => a.toLowerCase() === key));

        if (skill && !seenSkillIds.has(skill.id)) {
          seenSkillIds.add(skill.id);
          results.push({
            rawTerm: key,
            normalizedTerm: rule.normalized,
            matchedSkillId: skill.id,
            matchedSkillName: skill.name,
            confidence: 0.95,
            isVariationMapped: key.toLowerCase() !== rule.normalized.toLowerCase(),
            importance: 'critical',
            minProficiency: 'intermediate'
          });
        }
      }
    }

    // 2. Scan for catalog skill names & aliases directly
    for (const skill of catalog) {
      if (seenSkillIds.has(skill.id)) continue;

      // Check skill name if short or key term
      const keyTerms = [skill.name, ...skill.aliases];
      for (const term of keyTerms) {
        if (term.length < 3) continue; // Skip very short abbreviations unless in variation map
        if (CANONICAL_VARIATION_MAP[term.toLowerCase()]) continue; // Already handled by explicit canonical variation
        if (Object.values(CANONICAL_VARIATION_MAP).some(v => v.normalized.toLowerCase() === term.toLowerCase())) continue;
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');

        if (regex.test(description)) {
          seenSkillIds.add(skill.id);
          results.push({
            rawTerm: term,
            normalizedTerm: skill.name,
            matchedSkillId: skill.id,
            matchedSkillName: skill.name,
            confidence: 0.9,
            isVariationMapped: term.toLowerCase() !== skill.name.toLowerCase(),
            importance: 'preferred',
            minProficiency: 'intermediate'
          });
          break;
        }
      }
    }

    return results;
  }

  /**
   * Robust RFC 4180 CSV Parser
   */
  public parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    // Normalize line breaks
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote: ""
          currentCell += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    // Push trailing cell and row if present
    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        lines.push(currentRow);
      }
    }

    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = lines[0].map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let r = 1; r < lines.length; r++) {
      const rowArr = lines[r];
      const rowObj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = rowArr[idx] ? rowArr[idx].replace(/^["']|["']$/g, '').trim() : '';
      });
      rows.push(rowObj);
    }

    return { headers, rows };
  }

  /**
   * Validate uploaded CSV file and generate preview before database commit
   */
  public validateAndPreview(csvContent: string, fileName = 'job_postings.csv'): IngestionPreviewResponse {
    const db = dbStore.getFullDb();
    const { headers, rows } = this.parseCSV(csvContent);

    // Standard field alias mappings
    const findHeaderKey = (aliases: string[]): string | undefined => {
      return headers.find(h => aliases.includes(h.toLowerCase().replace(/[^a-z0-9]/g, '')));
    };

    const titleKey = findHeaderKey(['jobtitle', 'title', 'role', 'jobrole', 'position', 'designation']);
    const companyKey = findHeaderKey(['company', 'companyname', 'employer', 'organization', 'firm']);
    const districtKey = findHeaderKey(['district', 'location', 'city', 'area']);
    const sectorKey = findHeaderKey(['sector', 'industry', 'domain', 'vertical']);
    const descKey = findHeaderKey(['description', 'jobdescription', 'desc', 'summary', 'details']);
    const skillsKey = findHeaderKey(['skills', 'requiredskills', 'keyskills', 'techstack', 'technologies']);
    const expKey = findHeaderKey(['experience', 'exp', 'yearsofexperience', 'minexperience', 'experienceyears']);
    const salaryKey = findHeaderKey(['salary', 'ctc', 'annualsalary', 'package', 'salaryinr', 'lpa']);
    const dateKey = findHeaderKey(['date', 'posteddate', 'postingdate', 'createdat', 'timestamp']);

    const missingRequiredHeaders: string[] = [];
    if (!titleKey) missingRequiredHeaders.push('job_title');
    if (!companyKey) missingRequiredHeaders.push('company');
    if (!districtKey) missingRequiredHeaders.push('district');
    if (!sectorKey) missingRequiredHeaders.push('sector');

    const parsedRows: IngestionParsedRow[] = [];
    const skillTally = new Map<string, { term: string; count: number; skillId: string; skillName: string }>();
    const variationTally = new Map<string, { raw: string; normalized: string; count: number }>();

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // +1 for 1-based, +1 for header line
      const validationErrors: string[] = [];
      const validationWarnings: string[] = [];

      // Extract raw field values
      const jobTitle = (titleKey ? rawRow[titleKey] : '').trim();
      const company = (companyKey ? rawRow[companyKey] : '').trim();
      const district = (districtKey ? rawRow[districtKey] : '').trim();
      const sector = (sectorKey ? rawRow[sectorKey] : '').trim();
      const description = (descKey ? rawRow[descKey] : '').trim();
      const rawSkillsString = (skillsKey ? rawRow[skillsKey] : '').trim();
      const rawExp = (expKey ? rawRow[expKey] : '').trim();
      const rawSalary = (salaryKey ? rawRow[salaryKey] : '').trim();
      const rawDate = (dateKey ? rawRow[dateKey] : '').trim();

      // 1. Mandatory Validations
      if (!jobTitle) validationErrors.push('Missing job_title: Job title is required.');
      if (!company) validationErrors.push('Missing company: Employer/company name is required.');
      if (!district) validationErrors.push('Missing district: Geographic location is required.');
      if (!sector) validationErrors.push('Missing sector: Industrial sector is required.');

      // 2. District Match
      let matchedDistrict = db.districts.find(d =>
        d.name.toLowerCase() === district.toLowerCase() ||
        d.id.toLowerCase() === district.toLowerCase()
      );

      if (!matchedDistrict && district) {
        // Try partial match
        matchedDistrict = db.districts.find(d =>
          d.name.toLowerCase().includes(district.toLowerCase()) ||
          district.toLowerCase().includes(d.name.toLowerCase())
        );
        if (matchedDistrict) {
          validationWarnings.push(`District '${district}' auto-mapped to '${matchedDistrict.name}'.`);
        } else {
          validationWarnings.push(`District '${district}' not recognized in standard Maharashtra 10-district matrix; defaulted to Pune.`);
          matchedDistrict = db.districts.find(d => d.id === 'dist-pune') || db.districts[0];
        }
      }

      // 3. Sector Match
      let matchedSector = db.sectors.find(s =>
        s.name.toLowerCase() === sector.toLowerCase() ||
        s.id.toLowerCase() === sector.toLowerCase() ||
        s.code.toLowerCase() === sector.toLowerCase()
      );

      if (!matchedSector && sector) {
        matchedSector = db.sectors.find(s =>
          s.name.toLowerCase().includes(sector.toLowerCase()) ||
          sector.toLowerCase().includes(s.name.toLowerCase())
        );
        if (matchedSector) {
          validationWarnings.push(`Sector '${sector}' auto-mapped to '${matchedSector.name}'.`);
        } else {
          validationWarnings.push(`Sector '${sector}' not in standard 8 sectors; defaulted to IT & Software.`);
          matchedSector = db.sectors.find(s => s.id === 'sec-it') || db.sectors[0];
        }
      }

      // 4. Employer Match
      const matchedEmployer = db.employers.find(e =>
        e.name.toLowerCase() === company.toLowerCase() ||
        company.toLowerCase().includes(e.name.toLowerCase())
      );

      if (!matchedEmployer && company) {
        validationWarnings.push(`Company '${company}' will be registered as a new employer.`);
      }

      // 5. Job Role Match
      let matchedJobRole = db.jobRoles.find(r =>
        r.title.toLowerCase() === jobTitle.toLowerCase() ||
        jobTitle.toLowerCase().includes(r.title.toLowerCase())
      );
      if (!matchedJobRole && matchedSector) {
        matchedJobRole = db.jobRoles.find(r => r.sectorId === matchedSector!.id);
      }

      // 6. Experience Parsing
      let experienceYears = 2; // default
      if (rawExp) {
        const expMatch = rawExp.match(/(\d+)/);
        if (expMatch) {
          experienceYears = parseInt(expMatch[1], 10);
        } else if (/fresher|entry|trainee|apprentice/i.test(rawExp)) {
          experienceYears = 0;
        }
      }

      // 7. Salary Parsing (INR or LPA)
      let minSalaryINR = 300000;
      let maxSalaryINR = 600000;

      if (rawSalary) {
        // e.g. "4.5 LPA", "450000", "6 - 8 LPA"
        const lpaMatch = rawSalary.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*lpa/i);
        const numMatch = rawSalary.replace(/,/g, '').match(/(\d{5,8})\s*(?:-|to)?\s*(\d{5,8})?/);

        if (lpaMatch) {
          const minL = parseFloat(lpaMatch[1]);
          const maxL = lpaMatch[2] ? parseFloat(lpaMatch[2]) : minL * 1.3;
          minSalaryINR = Math.round(minL * 100000);
          maxSalaryINR = Math.round(maxL * 100000);
        } else if (numMatch) {
          minSalaryINR = parseInt(numMatch[1], 10);
          maxSalaryINR = numMatch[2] ? parseInt(numMatch[2], 10) : Math.round(minSalaryINR * 1.3);
        } else {
          validationWarnings.push(`Could not parse exact salary format ('${rawSalary}'). Defaulted to standard tier.`);
        }
      }

      // 8. Date Parsing
      let postedDate = new Date().toISOString().split('T')[0];
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          postedDate = d.toISOString().split('T')[0];
        }
      }

      // 9. Skill Extraction & Normalization
      const { extractedSkills, unmatchedTerms } = this.extractAndNormalizeSkills(rawSkillsString, description);

      if (extractedSkills.length === 0) {
        validationWarnings.push('No recognized skills extracted from description or skills column.');
      } else {
        // Aggregate statistics for summary
        for (const es of extractedSkills) {
          const current = skillTally.get(es.matchedSkillId) || {
            term: es.normalizedTerm,
            count: 0,
            skillId: es.matchedSkillId,
            skillName: es.matchedSkillName
          };
          current.count += 1;
          skillTally.set(es.matchedSkillId, current);

          if (es.isVariationMapped) {
            const vKey = `${es.rawTerm}→${es.normalizedTerm}`;
            const vCur = variationTally.get(vKey) || { raw: es.rawTerm, normalized: es.normalizedTerm, count: 0 };
            vCur.count += 1;
            variationTally.set(vKey, vCur);
          }
        }
      }

      // Determine Row Status
      const status: 'valid' | 'warning' | 'error' =
        validationErrors.length > 0 ? 'error' : validationWarnings.length > 0 ? 'warning' : 'valid';

      parsedRows.push({
        rowNumber,
        rawInput: rawRow,
        parsedFields: {
          jobTitle,
          company,
          district: matchedDistrict ? matchedDistrict.name : district,
          sector: matchedSector ? matchedSector.name : sector,
          description,
          rawSkillsString,
          experienceYears,
          minSalaryINR,
          maxSalaryINR,
          postedDate
        },
        matchedEntities: {
          districtId: matchedDistrict?.id,
          districtName: matchedDistrict?.name,
          sectorId: matchedSector?.id,
          sectorName: matchedSector?.name,
          employerId: matchedEmployer?.id,
          employerName: matchedEmployer?.name || company,
          jobRoleId: matchedJobRole?.id,
          jobRoleTitle: matchedJobRole?.title
        },
        extractedSkills,
        unmatchedTerms,
        status,
        validationErrors,
        validationWarnings
      });
    });

    const validRowsCount = parsedRows.filter(r => r.status === 'valid').length;
    const warningRowsCount = parsedRows.filter(r => r.status === 'warning').length;
    const errorRowsCount = parsedRows.filter(r => r.status === 'error').length;

    const topIdentifiedSkills = Array.from(skillTally.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topVariationsMapped = Array.from(variationTally.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      fileName,
      totalRows: parsedRows.length,
      validRowsCount,
      warningRowsCount,
      errorRowsCount,
      detectedHeaders: headers,
      missingHeaders: missingRequiredHeaders,
      rows: parsedRows,
      extractedSkillsSummary: {
        uniqueNormalizedSkills: skillTally.size,
        topIdentifiedSkills,
        topVariationsMapped
      }
    };
  }

  /**
   * Commit confirmed rows to the persistent database
   */
  public executeIngestion(request: IngestionExecutionRequest): IngestionExecutionResponse {
    const db = dbStore.getFullDb();
    const rowsToProcess = request.skipInvalidRows
      ? request.rows.filter(r => r.status !== 'error')
      : request.rows;

    let newEmployersCount = 0;
    let newJobsCount = 0;
    let totalOpeningsAdded = 0;
    let totalExtractedSkillsCount = 0;
    const sectorsSet = new Set<string>();
    const districtsSet = new Set<string>();

    for (const row of rowsToProcess) {
      const p = row.parsedFields;
      const m = row.matchedEntities;

      // 1. Ensure Employer Exists
      let employerId = m.employerId;
      if (!employerId && request.createMissingEmployers && p.company) {
        // Create new Employer entity
        const newEmpId = `emp-${String(db.employers.length + 1).padStart(3, '0')}`;
        const newEmployer: Employer = {
          id: newEmpId,
          name: p.company,
          sectorId: m.sectorId || 'sec-it',
          districtId: m.districtId || 'dist-pune',
          companySize: 'Enterprise (250-1000)',
          contactPerson: 'Talent Acquisition Team',
          email: `careers@${p.company.toLowerCase().replace(/[^a-z0-9]/g, '')}-example.com`,
          phone: '+91 20 4000 8888',
          address: `${m.districtName || 'Pune'}, Maharashtra`,
          isVerified: true,
          tier: 'Standard'
        };
        db.employers.push(newEmployer);
        employerId = newEmpId;
        newEmployersCount++;
      }

      if (!employerId) {
        employerId = db.employers[0].id;
      }

      // 2. Prepare Relational Skills
      const requiredSkills = row.extractedSkills.map(es => ({
        skillId: es.matchedSkillId,
        importance: es.importance,
        minProficiency: es.minProficiency
      }));

      totalExtractedSkillsCount += requiredSkills.length;

      // 3. Create Job Entity
      const newJobId = `job-${String(db.jobs.length + 1).padStart(4, '0')}`;
      const openings = Math.floor(Math.random() * 3) + 2; // 2 to 4 openings
      totalOpeningsAdded += openings;

      const sectorId = m.sectorId || 'sec-it';
      const districtId = m.districtId || 'dist-pune';
      sectorsSet.add(sectorId);
      districtsSet.add(districtId);

      const newJob: Job = {
        id: newJobId,
        title: p.jobTitle || 'Software Engineer',
        jobRoleId: m.jobRoleId || (db.jobRoles.find(r => r.sectorId === sectorId)?.id || db.jobRoles[0].id),
        employerId,
        sectorId,
        districtId,
        openings,
        minSalaryINR: p.minSalaryINR || 450000,
        maxSalaryINR: p.maxSalaryINR || 750000,
        experienceRequiredYears: p.experienceYears ?? 2,
        requiredSkills,
        educationRequired: p.experienceYears >= 3 ? "Bachelor's Degree / B.Tech / MCA" : 'Diploma / Degree / ITI Graduate',
        // Crucial: Preserving verbatim original job description without deletion
        description: p.description || `${p.jobTitle} position at ${p.company} requiring technical competencies.`,
        // Storing both raw skills text and normalized extracted skills
        rawSkillText: p.rawSkillsString,
        extractedSkills: row.extractedSkills,
        status: 'active',
        postedDate: p.postedDate || new Date().toISOString().split('T')[0],
        isRemoteFriendly: sectorId === 'sec-it' || sectorId === 'sec-bfsi',
        employmentType: 'Full-time',
        source: 'CSV Ingestion'
      };

      // Unshift to put newly ingested jobs at the top of the collection
      db.jobs.unshift(newJob);
      newJobsCount++;
    }

    // Update Metadata
    db.datasetMetadata.totalRecords.jobs = db.jobs.length;
    db.datasetMetadata.totalRecords.employers = db.employers.length;

    // 4. Create Batch History Record
    const batchId = `batch-${Date.now()}`;
    const batchRecord: IngestionBatchRecord = {
      id: batchId,
      fileName: request.fileName,
      fileSizeBytes: JSON.stringify(request.rows).length,
      uploadedAt: new Date().toISOString(),
      importedBy: 'Admin (Directorate of Skill Development)',
      totalRows: request.rows.length,
      importedCount: newJobsCount,
      skippedCount: request.rows.length - newJobsCount,
      extractedSkillsCount: totalExtractedSkillsCount,
      status: newJobsCount === request.rows.length ? 'Completed' : 'Partial',
      summary: {
        newEmployersAdded: newEmployersCount,
        newJobsAdded: newJobsCount,
        totalOpeningsAdded,
        sectorsAffected: Array.from(sectorsSet),
        districtsAffected: Array.from(districtsSet)
      }
    };

    if (!db.ingestionHistory) {
      db.ingestionHistory = [];
    }
    db.ingestionHistory.unshift(batchRecord);

    // Save to file system immediately
    dbStore.saveCurrentDb();

    return {
      success: true,
      message: `Successfully ingested ${newJobsCount} job postings and registered ${newEmployersCount} new employers.`,
      batch: batchRecord,
      newTotalJobs: db.jobs.length,
      newTotalEmployers: db.employers.length
    };
  }

  /**
   * Return pre-baked sample CSV template strings for instant testing
   */
  public getSampleCSVTemplates(): { id: string; name: string; description: string; csv: string }[] {
    return [
      {
        id: 'sample-tech-ev',
        name: 'Tech & Modern Cloud Ingestion Batch',
        description: 'Contains Python, FastAPI, REST API, Docker, AWS, JS, React.js, Postgres, and ML job requisitions.',
        csv: `job_title,company,district,sector,description,skills,experience,salary,date
Senior Backend Architect,TechCorp India Pvt Ltd,Pune,IT & Software,"We are hiring a Senior Backend Architect to lead microservices. Key requirements: Python, FastAPI, REST API, Docker and AWS. Must be comfortable deploying production workloads to cloud.","Python, FastAPI, REST API, Docker, AWS",4 years,₹14.5 LPA,2026-09-18
Frontend React Engineer,Cognitive Labs Pune,Pune,IT & Software,"Seeking talented UI developer proficient in JS and React.js with Redux Toolkit and RESTful API consumption. Experience with TypeScript is an added bonus.","JS, React.js, HTML5, CSS3",2 years,₹7.2 LPA,2026-09-20
Data & ML Platform Engineer,Symbiosis Financial AI,Mumbai,Banking & Finance,"Design ETL pipelines and real-time models. Requires hands-on experience in Postgres and ML pipelines using Python and Docker containers.","Postgres, ML, Python, Docker",3 years,₹12 LPA,2026-09-21
Cloud DevOps Associate,CloudOps Technologies,Navi Mumbai,IT & Software,"Looking for certified engineer with Docker, Kubernetes and AWS cloud infrastructure experience. Responsible for CI/CD automation.","Docker, AWS, CI/CD, Linux",2 years,₹8.5 LPA,2026-09-19
Full Stack Web Developer,Digital Bharat Solutions,Nagpur,IT & Software,"Join our team building government citizen portals using JS, React.js, Node.js and Postgres database.","JS, React.js, Postgres",3 years,₹6.8 LPA,2026-09-22`
      },
      {
        id: 'sample-manufacturing-auto',
        name: 'Maharashtra Industrial & Automotive Batch',
        description: 'Job openings for EV Powertrain, CNC Machining, PLC Automation, and Industrial Safety.',
        csv: `job_title,company,district,sector,description,skills,experience,salary,date
5-Axis CNC Milling Specialist,Bharat Forge Precision,Pune,Manufacturing,"Operate 5-axis CNC machines for defense and aerospace components. Requires CNC, G-Code and CMM inspection capabilities.","CNC, G-Code, CMM",3 years,₹4.8 LPA,2026-09-17
Industrial Automation Engineer,Kirloskar Automation Ltd,Kolhapur,Manufacturing,"Program and commission PLC and SCADA systems for automated pump testing rigs. Knowledge of industrial safety (OSHA) is required.","PLC, SCADA, OSHA",4 years,₹5.5 LPA,2026-09-16
EV Battery Pack Technician,Tata AutoComp Mobility,Pune,Automotive,"Assembly and testing of lithium-ion battery modules. Must understand BMS calibration and high voltage EV safety protocols.","BMS, EV, Safety",2 years,₹3.8 LPA,2026-09-19
Automotive Diagnostic Specialist,Mahindra & Mahindra,Nashik,Automotive,"Diagnostic scanning of connected SUVs using CAN-Bus, OBD-II and ECU flashing tools.","CAN-Bus, OBD-II, Auto Diagnostics",3 years,₹4.5 LPA,2026-09-20
Surface Mount Technology Line Lead,Foxconn Electronics India,Navi Mumbai,Electronics,"Lead high-speed SMT pick-and-place lines. Experience with Altium PCB layout and cleanroom procedures.","SMT, PCB, Cleanroom",5 years,₹6.2 LPA,2026-09-15`
      },
      {
        id: 'sample-logistics-health',
        name: 'Healthcare & Cold Chain Logistics Batch',
        description: 'Openings in medical equipment maintenance, WMS warehouse tracking, and emergency medical care.',
        csv: `job_title,company,district,sector,description,skills,experience,salary,date
Warehouse Operations Supervisor,Delhivery Multi-Modal,Nagpur,Logistics,"Manage MIHAN automated distribution center using WMS, RFID scanning and forklift dispatch systems.","WMS, RFID, Forklift",3 years,₹4.2 LPA,2026-09-21
Biomedical Equipment Specialist,Lilavati Hospital,Mumbai,Healthcare,"Calibration and preventive maintenance of ICU ventilators, defibrillators and dialyzers.","Biomedical, Calibration, Safety",2 years,₹5.0 LPA,2026-09-18
Financial Accounts Executive,Kotak Mahindra Bank,Thane,Banking & Finance,"Maintain branch ledger and GST filings using Tally and advanced Excel.","Tally, GST, Excel",2 years,₹3.6 LPA,2026-09-19
Cold Chain Fleet Specialist,Snowman Logistics,Nashik,Logistics,"Temperature monitoring of reefer trucks transporting grape produce and pharma vaccines.","Cold Chain, GPS, Telematics",2 years,₹3.8 LPA,2026-09-22`
      }
    ];
  }
}

export const skillExtractionService = new SkillExtractionService();
