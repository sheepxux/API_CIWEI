import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "ERR003",
  name: "Inconsistent Error Response Format",
  description:
    "Detects error responses that don't follow a consistent structure, making client-side error handling harder.",
  category: "error-handling",
  severity: "medium",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const RAW_ERROR_PATTERNS: Array<{
  pattern: RegExp;
  message: string;
  suggestion: string;
}> = [
  {
    pattern:
      /res\.status\s*\(\s*(?:4\d\d|5\d\d)\s*\)\.(?:send|json)\s*\(\s*(?:err\.message|error\.message|e\.message|err\.toString\(\)|error\.toString\(\))\s*\)/gi,
    message: "Sending raw error message directly to client",
    suggestion:
      "Use a consistent error response format: res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }). Never expose raw error messages to clients as they may leak sensitive information.",
  },
  {
    pattern:
      /res\.status\s*\(\s*(?:4\d\d|5\d\d)\s*\)\.(?:send|json)\s*\(\s*err\s*\)/gi,
    message: "Sending raw error object directly to client",
    suggestion:
      "Never send raw error objects to clients. Use a structured error format: { error: 'message', code: 'ERROR_CODE', details?: [...] }",
  },
  {
    pattern:
      /res\.(?:send|json)\s*\(\s*\{\s*(?:error|message)\s*:\s*err(?:\.message)?\s*\}\s*\)/gi,
    message: "Exposing raw error details in response",
    suggestion:
      "Sanitize error messages before sending to clients. Log the full error server-side and return a safe, user-friendly message.",
  },
  {
    pattern: /console\.error\s*\(\s*err\s*\)\s*;\s*(?!.*res\.status)/gi,
    message: "Error logged but no error response sent to client",
    suggestion:
      "After logging the error, send an appropriate error response to the client.",
  },
];

export const errorResponseFormatRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const { pattern, message, suggestion } of RAW_ERROR_PATTERNS) {
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
