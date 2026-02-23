import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "DES003",
  name: "Missing API Versioning",
  description:
    "Detects API routes that lack versioning, which makes backward-compatible changes harder.",
  category: "design",
  severity: "low",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const ROUTE_PATTERNS: RegExp[] = [
  /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`](\/[^'"`v][^'"`]*)['"`]/gi,
  /\@(?:Get|Post|Put|Patch|Delete)Mapping\s*\(\s*['"`](\/[^'"`v][^'"`]*)['"`]/gi,
];

const VERSION_PATTERNS: RegExp[] = [
  /\/v\d+\//i,
  /\/api\/v\d+/i,
  /version/i,
  /\/v\d+$/i,
];

const SKIP_PATHS = ["/health", "/ping", "/status", "/metrics", "/favicon"];

export const apiVersioningRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");
    const fullContent = file.content;

    const hasVersioning = VERSION_PATTERNS.some((p) => p.test(fullContent));
    if (hasVersioning) return issues;

    const routeLines: number[] = [];

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const pattern of ROUTE_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          const routePath = match[2] || match[1] || "";
          if (SKIP_PATHS.some((p) => routePath.startsWith(p))) continue;
          routeLines.push(lineIndex);
          break;
        }
      }
    });

    if (routeLines.length > 0) {
      issues.push({
        ruleId: definition.id,
        ruleName: definition.name,
        category: definition.category,
        severity: definition.severity,
        message: `Found ${routeLines.length} API route(s) without versioning`,
        suggestion:
          "Add API versioning to your routes. Example: /api/v1/users instead of /users. This allows you to make breaking changes in future versions without affecting existing clients.",
        filePath: file.path,
        line: routeLines[0] + 1,
        column: 1,
        codeSnippet: lines[routeLines[0]]?.trim(),
        fixable: false,
      });
    }

    return issues;
  },
};
