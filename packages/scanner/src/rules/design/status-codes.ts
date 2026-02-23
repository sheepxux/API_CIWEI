import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "DES002",
  name: "Incorrect HTTP Status Codes",
  description:
    "Detects incorrect or inconsistent HTTP status code usage in API responses.",
  category: "design",
  severity: "medium",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const STATUS_VIOLATIONS: Array<{
  pattern: RegExp;
  message: string;
  suggestion: string;
}> = [
  {
    pattern: /res\.status\s*\(\s*200\s*\).*(?:delete|remove|destroy)/gi,
    message: "Using 200 for DELETE operations — should use 204 No Content",
    suggestion:
      "Return 204 No Content for successful DELETE operations that return no body, or 200 with a body if returning the deleted resource.",
  },
  {
    pattern: /res\.status\s*\(\s*200\s*\).*(?:create|insert|new)/gi,
    message: "Using 200 for resource creation — should use 201 Created",
    suggestion:
      "Return 201 Created when a new resource is successfully created. Include a Location header pointing to the new resource.",
  },
  {
    pattern:
      /res\.status\s*\(\s*(?:200|201)\s*\).*(?:error|fail|invalid|not found)/gi,
    message: "Using success status code for error responses",
    suggestion:
      "Use appropriate error status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 422 (Unprocessable Entity), 500 (Internal Server Error).",
  },
  {
    pattern: /res\.status\s*\(\s*500\s*\).*(?:not found|missing|no such)/gi,
    message: "Using 500 for 'not found' errors — should use 404",
    suggestion:
      "Use 404 Not Found when a requested resource doesn't exist. Reserve 500 for unexpected server errors.",
  },
  {
    pattern: /res\.status\s*\(\s*403\s*\).*(?:login|authenticate|token)/gi,
    message: "Using 403 Forbidden for unauthenticated requests — should use 401",
    suggestion:
      "Use 401 Unauthorized when the user is not authenticated (no valid credentials). Use 403 Forbidden when the user is authenticated but lacks permission.",
  },
  {
    pattern:
      /(?:return|send|respond).*status.*200.*(?:error|exception|fail)/gi,
    message: "Returning 200 OK with an error in the body",
    suggestion:
      "Use appropriate HTTP error status codes instead of returning errors in a 200 response body. This breaks REST conventions and makes error handling harder for clients.",
  },
];

export const statusCodesRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const { pattern, message, suggestion } of STATUS_VIOLATIONS) {
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
