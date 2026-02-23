import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "SEC005",
  name: "Missing Rate Limiting",
  description:
    "Detects API endpoints that may be missing rate limiting, making them vulnerable to brute force and DoS attacks.",
  category: "security",
  severity: "medium",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const RATE_LIMIT_PATTERNS: RegExp[] = [
  /rateLimit/i,
  /rate[_-]limit/i,
  /throttle/i,
  /RateLimiter/i,
  /slowDown/i,
  /limiter/i,
  /express-rate-limit/i,
  /flask[_-]limiter/i,
  /django[_-]ratelimit/i,
  /golang\.org\/x\/time\/rate/i,
  /rate\.NewLimiter/i,
  /bucket4j/i,
  /guava.*RateLimiter/i,
];

const AUTH_ROUTE_PATTERNS: RegExp[] = [
  /(?:app|router)\.(post)\s*\(\s*['"`][^'"`]*(?:login|signin|auth|register|signup|password|token)[^'"`]*['"`]/gi,
  /\@PostMapping\s*\(\s*['"`][^'"`]*(?:login|signin|auth|register)[^'"`]*['"`]/gi,
  /Route::post\s*\(\s*['"`][^'"`]*(?:login|signin|auth|register)[^'"`]*['"`]/gi,
];

export const rateLimitingRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const fullContent = file.content;
    const lines = file.content.split("\n");

    const hasRateLimit = RATE_LIMIT_PATTERNS.some((p) => p.test(fullContent));
    if (hasRateLimit) return issues;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const pattern of AUTH_ROUTE_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: "high",
            message:
              "Authentication endpoint detected without rate limiting — vulnerable to brute force attacks",
            suggestion:
              "Add rate limiting to authentication endpoints. Example with express-rate-limit: const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }); router.post('/login', limiter, handler)",
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
