import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "DOC001",
  name: "Missing API Documentation",
  description:
    "Detects API routes that lack OpenAPI/Swagger documentation comments.",
  category: "documentation",
  severity: "low",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const ROUTE_PATTERNS: RegExp[] = [
  /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`][^'"`]+['"`]/gi,
  /\@(?:Get|Post|Put|Patch|Delete)Mapping/gi,
  /Route::(get|post|put|patch|delete)\s*\(/gi,
];

const DOC_PATTERNS: RegExp[] = [
  /\/\*\*[\s\S]*?\*\//,
  /@swagger/i,
  /@openapi/i,
  /\* @param/i,
  /\* @returns/i,
  /\* @response/i,
  /#\s*---/,
  /openapi:/i,
  /swagger:/i,
  /"""[\s\S]*?"""/,
  /'''[\s\S]*?'''/,
];

export const missingOpenApiRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");
    const fullContent = file.content;

    const hasAnyDocs = DOC_PATTERNS.some((p) => p.test(fullContent));
    if (hasAnyDocs) return issues;

    let routeCount = 0;
    let firstRouteLine = -1;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const pattern of ROUTE_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          routeCount++;
          if (firstRouteLine === -1) firstRouteLine = lineIndex;
          break;
        }
      }
    });

    if (routeCount >= 1 && firstRouteLine >= 0) {
      issues.push({
        ruleId: definition.id,
        ruleName: definition.name,
        category: definition.category,
        severity: definition.severity,
        message: `${routeCount} API route(s) found without OpenAPI/Swagger documentation`,
        suggestion:
          "Add JSDoc/OpenAPI comments to document your API endpoints. Example:\n/**\n * @swagger\n * /users:\n *   get:\n *     summary: Get all users\n *     responses:\n *       200:\n *         description: Success\n */\nConsider using swagger-jsdoc and swagger-ui-express to auto-generate API docs.",
        filePath: file.path,
        line: firstRouteLine + 1,
        column: 1,
        codeSnippet: lines[firstRouteLine]?.trim(),
        fixable: false,
      });
    }

    return issues;
  },
};
