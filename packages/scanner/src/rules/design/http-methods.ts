import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "DES001",
  name: "Incorrect HTTP Method Usage",
  description:
    "Detects incorrect HTTP method usage that violates REST conventions.",
  category: "design",
  severity: "medium",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const VIOLATIONS: Array<{
  pattern: RegExp;
  message: string;
  suggestion: string;
}> = [
  {
    pattern:
      /(?:app|router)\.get\s*\(\s*['"`][^'"`]*(?:create|add|new|insert|register|signup)[^'"`]*['"`]/gi,
    message: "GET route used for resource creation — should use POST",
    suggestion:
      "Use POST for creating resources. GET requests should be idempotent and only retrieve data.",
  },
  {
    pattern:
      /(?:app|router)\.get\s*\(\s*['"`][^'"`]*(?:delete|remove|destroy)[^'"`]*['"`]/gi,
    message: "GET route used for resource deletion — should use DELETE",
    suggestion:
      "Use DELETE for removing resources. GET requests should never have side effects.",
  },
  {
    pattern:
      /(?:app|router)\.get\s*\(\s*['"`][^'"`]*(?:update|edit|modify|change)[^'"`]*['"`]/gi,
    message: "GET route used for resource update — should use PUT or PATCH",
    suggestion:
      "Use PUT for full updates or PATCH for partial updates. GET requests must be read-only.",
  },
  {
    pattern:
      /(?:app|router)\.post\s*\(\s*['"`][^'"`]*(?:delete|remove|destroy)[^'"`]*['"`]/gi,
    message: "POST route used for resource deletion — should use DELETE",
    suggestion:
      "Use DELETE HTTP method for deleting resources to follow REST conventions.",
  },
  {
    pattern:
      /(?:app|router)\.post\s*\(\s*['"`][^'"`]*(?:getAll|getList|list|fetch)[^'"`]*['"`]/gi,
    message: "POST route used for data retrieval — should use GET",
    suggestion:
      "Use GET for retrieving data. POST should be reserved for creating resources.",
  },
];

export const httpMethodsRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const { pattern, message, suggestion } of VIOLATIONS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: definition.severity,
            message,
            suggestion,
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
