import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "DES004",
  name: "API Naming Convention Violations",
  description:
    "Detects API route naming that violates REST conventions (e.g., verbs in URLs, camelCase paths).",
  category: "design",
  severity: "low",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const VERB_IN_URL_PATTERNS: Array<{
  pattern: RegExp;
  message: string;
  suggestion: string;
}> = [
  {
    pattern:
      /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`][^'"`]*(?:\/get[A-Z\/]|\/fetch[A-Z\/]|\/retrieve[A-Z\/])[^'"`]*['"`]/gi,
    message: "Verb 'get/fetch/retrieve' in URL path — use nouns for REST resources",
    suggestion:
      "Use nouns in URL paths. Instead of /getUsers, use GET /users. The HTTP method already expresses the action.",
  },
  {
    pattern:
      /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`][^'"`]*(?:\/create[A-Z\/]|\/add[A-Z\/]|\/new[A-Z\/])[^'"`]*['"`]/gi,
    message: "Verb 'create/add/new' in URL path — use nouns for REST resources",
    suggestion:
      "Use nouns in URL paths. Instead of /createUser, use POST /users. The HTTP method already expresses the action.",
  },
  {
    pattern:
      /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`][^'"`]*(?:\/delete[A-Z\/]|\/remove[A-Z\/])[^'"`]*['"`]/gi,
    message: "Verb 'delete/remove' in URL path — use nouns for REST resources",
    suggestion:
      "Use nouns in URL paths. Instead of /deleteUser/:id, use DELETE /users/:id.",
  },
  {
    pattern:
      /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`][^'"`]*[A-Z][a-z][^'"`]*['"`]/g,
    message: "camelCase in URL path — use kebab-case for REST API paths",
    suggestion:
      "Use kebab-case (lowercase with hyphens) for URL paths. Instead of /userProfile, use /user-profile.",
  },
];

export const namingConventionsRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const { pattern, message, suggestion } of VERB_IN_URL_PATTERNS) {
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
