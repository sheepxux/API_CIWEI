import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "SEC002",
  name: "SQL Injection Risk",
  description:
    "Detects potential SQL injection vulnerabilities where user input is directly concatenated into SQL queries.",
  category: "security",
  severity: "critical",
  languages: ["javascript", "typescript", "python", "php", "ruby", "java"],
  fixable: false,
};

const SQL_INJECTION_PATTERNS: RegExp[] = [
  /['"`]\s*\+\s*(?:req\.|request\.|params\.|query\.|body\.|input)/gi,
  /(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER).*\+\s*(?:req|request|params|query|body|input|user)/gi,
  /execute\s*\(\s*['"`].*\+/gi,
  /cursor\.execute\s*\(\s*['"`].*%\s*(?:req|request|params|query|body|input)/gi,
  /db\.query\s*\(\s*[`'"].*\$\{(?!process\.env)/gi,
  /\.raw\s*\(\s*[`'"].*\$\{(?!process\.env)/gi,
  /f['"`].*(?:SELECT|INSERT|UPDATE|DELETE).*\{(?!process\.env)/gi,
  /String\.format\s*\(.*(?:SELECT|INSERT|UPDATE|DELETE)/gi,
];

const SAFE_PATTERNS: RegExp[] = [
  /\?\s*,/,
  /\$\d+/,
  /parameterized/i,
  /prepared/i,
  /placeholder/i,
  /sanitize/i,
  /escape/i,
];

export const sqlInjectionRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;
      if (SAFE_PATTERNS.some((p) => p.test(line))) return;

      for (const pattern of SQL_INJECTION_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: definition.severity,
            message: "Potential SQL injection: user input concatenated into SQL query",
            suggestion:
              "Use parameterized queries or prepared statements. Example: db.query('SELECT * FROM users WHERE id = ?', [userId]) instead of string concatenation.",
            filePath: file.path,
            line: lineIndex + 1,
            column: match.index + 1,
            codeSnippet: trimmed,
            fixable: false,
          });
          break;
        }
      }
    });

    return issues;
  },
};
