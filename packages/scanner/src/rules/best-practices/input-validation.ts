import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "BP001",
  name: "Missing Input Validation",
  description:
    "Detects API endpoints that use request body/query parameters without validation.",
  category: "best-practices",
  severity: "high",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const VALIDATION_PATTERNS: RegExp[] = [
  /joi\./i,
  /yup\./i,
  /zod\./i,
  /celebrate\(/i,
  /express-validator/i,
  /validator\./i,
  /validate\s*\(/i,
  /schema\.parse/i,
  /schema\.validate/i,
  /marshmallow/i,
  /pydantic/i,
  /class-validator/i,
  /\@IsString\(/i,
  /\@IsNumber\(/i,
  /\@IsEmail\(/i,
  /\@Valid\b/i,
  /\@NotNull\b/i,
  /binding\.ShouldBind/i,
  /c\.ShouldBindJSON/i,
];

const BODY_ACCESS_PATTERNS: RegExp[] = [
  /req\.body\.\w+/gi,
  /request\.body\.\w+/gi,
  /req\.query\.\w+/gi,
  /request\.query\.\w+/gi,
  /req\.params\.\w+/gi,
  /request\.data\[/gi,
  /request\.form\[/gi,
  /request\.args\[/gi,
  /\$_POST\[/gi,
  /\$_GET\[/gi,
  /\$_REQUEST\[/gi,
  /c\.Param\s*\(/gi,
  /c\.Query\s*\(/gi,
];

export const inputValidationRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const fullContent = file.content;
    const lines = file.content.split("\n");

    const hasValidation = VALIDATION_PATTERNS.some((p) => p.test(fullContent));
    if (hasValidation) return issues;

    const bodyAccessLines: number[] = [];

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      for (const pattern of BODY_ACCESS_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          bodyAccessLines.push(lineIndex);
          break;
        }
      }
    });

    if (bodyAccessLines.length >= 2) {
      issues.push({
        ruleId: definition.id,
        ruleName: definition.name,
        category: definition.category,
        severity: definition.severity,
        message: `Request data accessed ${bodyAccessLines.length} times without input validation`,
        suggestion:
          "Add input validation using a schema validation library. Example with Zod:\nconst schema = z.object({ name: z.string().min(1), email: z.string().email() });\nconst data = schema.parse(req.body);\nOr use Joi, Yup, express-validator, or framework-specific validators.",
        filePath: file.path,
        line: bodyAccessLines[0] + 1,
        column: 1,
        codeSnippet: lines[bodyAccessLines[0]]?.trim(),
        fixable: false,
      });
    }

    return issues;
  },
};
