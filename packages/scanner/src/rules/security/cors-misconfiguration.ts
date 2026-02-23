import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "SEC004",
  name: "CORS Misconfiguration",
  description:
    "Detects overly permissive CORS configurations that may expose APIs to cross-origin attacks.",
  category: "security",
  severity: "high",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const WILDCARD_CORS_PATTERNS: RegExp[] = [
  /(?:origin|Access-Control-Allow-Origin)\s*[:=]\s*['"`]\*['"`]/gi,
  /cors\s*\(\s*\{\s*origin\s*:\s*['"`]\*['"`]/gi,
  /cors\s*\(\s*\)\s*(?!.*origin)/gi,
  /add_header\s+Access-Control-Allow-Origin\s+\*/gi,
  /response\.headers\[['"]Access-Control-Allow-Origin['"]\]\s*=\s*['"`]\*['"`]/gi,
  /w\.Header\(\)\.Set\s*\(\s*['"]Access-Control-Allow-Origin['"]\s*,\s*['"`]\*['"`]\)/gi,
  /\.AllowAllOrigins\s*\(\s*\)/gi,
  /CORS_ORIGIN\s*=\s*['"`]\*['"`]/gi,
];

const ALLOW_CREDENTIALS_WITH_WILDCARD: RegExp[] = [
  /credentials\s*:\s*true/gi,
  /Access-Control-Allow-Credentials.*true/gi,
  /withCredentials\s*:\s*true/gi,
];

export const corsMisconfigurationRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");
    const fullContent = file.content;

    const hasCredentials = ALLOW_CREDENTIALS_WITH_WILDCARD.some((p) =>
      p.test(fullContent)
    );

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const pattern of WILDCARD_CORS_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          const severity = hasCredentials ? "critical" : definition.severity;
          const extraMsg = hasCredentials
            ? " Combined with credentials:true, this is a critical security vulnerability."
            : "";

          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity,
            message: `Wildcard CORS origin (*) allows any domain to access this API.${extraMsg}`,
            suggestion:
              "Restrict CORS to specific trusted origins. Example: cors({ origin: ['https://yourdomain.com', 'https://app.yourdomain.com'] }). Never use wildcard with credentials.",
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
