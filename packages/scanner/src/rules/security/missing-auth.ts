import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "SEC003",
  name: "Missing Authentication",
  description:
    "Detects API routes that may be missing authentication middleware.",
  category: "security",
  severity: "high",
  languages: ["javascript", "typescript", "python", "go", "php", "ruby"],
  fixable: false,
};

const ROUTE_PATTERNS: RegExp[] = [
  /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(?:async\s*)?\((?:req|request)/gi,
  /\@(?:Get|Post|Put|Patch|Delete)Mapping\s*\(/gi,
  /Route::(get|post|put|patch|delete)\s*\(/gi,
  /\@app\.route\s*\(/gi,
  /r\.(GET|POST|PUT|PATCH|DELETE)\s*\(/gi,
];

const AUTH_PATTERNS: RegExp[] = [
  /authenticate/i,
  /authorize/i,
  /isAuthenticated/i,
  /requireAuth/i,
  /authMiddleware/i,
  /verifyToken/i,
  /passport\./i,
  /jwt\./i,
  /session\./i,
  /\@(?:Auth|Protected|Secured|Guard)/i,
  /login_required/i,
  /\@login_required/i,
  /middleware\.auth/i,
  /auth\.required/i,
  /checkAuth/i,
  /ensureAuth/i,
];

const SENSITIVE_ROUTES: RegExp[] = [
  /\/admin/i,
  /\/user/i,
  /\/profile/i,
  /\/account/i,
  /\/dashboard/i,
  /\/settings/i,
  /\/payment/i,
  /\/order/i,
  /\/private/i,
  /\/secure/i,
  /\/delete/i,
  /\/update/i,
];

export const missingAuthRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");
    const fullContent = file.content;

    const hasGlobalAuth = AUTH_PATTERNS.some((p) => p.test(fullContent));

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const routePattern of ROUTE_PATTERNS) {
        routePattern.lastIndex = 0;
        const match = routePattern.exec(line);
        if (!match) continue;

        const isSensitive = SENSITIVE_ROUTES.some((p) => p.test(line));
        if (!isSensitive && hasGlobalAuth) continue;

        const contextStart = Math.max(0, lineIndex - 3);
        const contextEnd = Math.min(lines.length, lineIndex + 5);
        const context = lines.slice(contextStart, contextEnd).join("\n");

        const hasLocalAuth = AUTH_PATTERNS.some((p) => p.test(context));
        if (hasLocalAuth) continue;

        if (isSensitive) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: definition.severity,
            message: `Sensitive route "${match[0].substring(0, 60)}" may be missing authentication middleware`,
            suggestion:
              "Add authentication middleware to protect this route. Example: router.get('/admin', authenticate, handler) or use a global auth middleware for all protected routes.",
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
