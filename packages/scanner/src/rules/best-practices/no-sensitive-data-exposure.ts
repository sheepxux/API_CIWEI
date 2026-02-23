import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "BP002",
  name: "Sensitive Data Exposure",
  description:
    "Detects API responses that may expose sensitive user data like passwords, tokens, or PII.",
  category: "best-practices",
  severity: "high",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const SENSITIVE_FIELD_PATTERNS: Array<{
  pattern: RegExp;
  field: string;
}> = [
  { pattern: /\.password\b/gi, field: "password" },
  { pattern: /\.passwordHash\b/gi, field: "passwordHash" },
  { pattern: /\.hashedPassword\b/gi, field: "hashedPassword" },
  { pattern: /\.salt\b/gi, field: "salt" },
  { pattern: /\.secret\b/gi, field: "secret" },
  { pattern: /\.privateKey\b/gi, field: "privateKey" },
  { pattern: /\.creditCard\b/gi, field: "creditCard" },
  { pattern: /\.cardNumber\b/gi, field: "cardNumber" },
  { pattern: /\.ssn\b/gi, field: "SSN" },
  { pattern: /\.socialSecurity\b/gi, field: "social security number" },
];

const RESPONSE_PATTERNS: RegExp[] = [
  /res\.(?:json|send)\s*\(/gi,
  /return\s+(?:res\.)?json\s*\(/gi,
  /response\.json\s*\(/gi,
  /jsonify\s*\(/gi,
  /render_json\s*\(/gi,
];

const EXCLUSION_PATTERNS: RegExp[] = [
  /select:/i,
  /omit:/i,
  /exclude:/i,
  /\.toJSON\s*\(\s*\)/,
  /\.toObject\s*\(\s*\)/,
  /delete\s+\w+\.\w+/,
];

export const noSensitiveDataExposureRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      const isResponseLine = RESPONSE_PATTERNS.some((p) => {
        p.lastIndex = 0;
        return p.test(line);
      });

      if (!isResponseLine) return;
      if (EXCLUSION_PATTERNS.some((p) => p.test(line))) return;

      const contextStart = Math.max(0, lineIndex - 5);
      const contextEnd = Math.min(lines.length, lineIndex + 2);
      const context = lines.slice(contextStart, contextEnd).join("\n");

      for (const { pattern, field } of SENSITIVE_FIELD_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(context)) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: definition.severity,
            message: `Potential exposure of sensitive field "${field}" in API response`,
            suggestion: `Remove sensitive fields before sending responses. Use field selection in queries (Prisma: select: { password: false }) or explicitly delete them: delete user.password; Or use a DTO/serializer to control what data is exposed.`,
            filePath: file.path,
            line: lineIndex + 1,
            column: 1,
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
