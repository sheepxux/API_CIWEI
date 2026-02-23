import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "PERF003",
  name: "Missing Cache Headers",
  description:
    "Detects GET endpoints that return data without setting appropriate cache headers.",
  category: "performance",
  severity: "low",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const GET_ROUTE_PATTERNS: RegExp[] = [
  /(?:app|router)\.get\s*\(\s*['"`][^'"`]+['"`]\s*,/gi,
  /\@GetMapping/gi,
  /Route::get\s*\(/gi,
  /r\.GET\s*\(/gi,
];

const CACHE_PATTERNS: RegExp[] = [
  /Cache-Control/i,
  /ETag/i,
  /Last-Modified/i,
  /cache/i,
  /redis/i,
  /memcache/i,
  /setHeader.*cache/i,
];

export const missingCacheRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const fullContent = file.content;
    const lines = file.content.split("\n");

    const hasAnyCaching = CACHE_PATTERNS.some((p) => p.test(fullContent));
    if (hasAnyCaching) return issues;

    let getRouteCount = 0;
    let firstGetLine = -1;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const pattern of GET_ROUTE_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          getRouteCount++;
          if (firstGetLine === -1) firstGetLine = lineIndex;
          break;
        }
      }
    });

    if (getRouteCount >= 2 && firstGetLine >= 0) {
      issues.push({
        ruleId: definition.id,
        ruleName: definition.name,
        category: definition.category,
        severity: definition.severity,
        message: `${getRouteCount} GET endpoints found without any caching strategy`,
        suggestion:
          "Consider adding cache headers to GET endpoints: res.set('Cache-Control', 'public, max-age=300'). For dynamic data, use ETag or Last-Modified headers. For heavy queries, consider Redis caching.",
        filePath: file.path,
        line: firstGetLine + 1,
        column: 1,
        codeSnippet: lines[firstGetLine]?.trim(),
        fixable: false,
      });
    }

    return issues;
  },
};
