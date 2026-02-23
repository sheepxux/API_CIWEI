import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "SEC001",
  name: "Hardcoded Secrets",
  description:
    "Detects hardcoded API keys, passwords, tokens and other secrets in code.",
  category: "security",
  severity: "critical",
  languages: [
    "javascript",
    "typescript",
    "python",
    "go",
    "java",
    "php",
    "ruby",
  ],
  fixable: false,
};

const SECRET_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern:
      /(?:password|passwd|pwd)\s*[:=]\s*['"`]([^'"`\s]{6,})['"`]/gi,
    label: "hardcoded password",
  },
  {
    pattern:
      /(?:api[_-]?key|apikey)\s*[:=]\s*['"`]([^'"`\s]{8,})['"`]/gi,
    label: "hardcoded API key",
  },
  {
    pattern:
      /(?:secret[_-]?key|secret)\s*[:=]\s*['"`]([^'"`\s]{8,})['"`]/gi,
    label: "hardcoded secret",
  },
  {
    pattern:
      /(?:access[_-]?token|auth[_-]?token)\s*[:=]\s*['"`]([^'"`\s]{8,})['"`]/gi,
    label: "hardcoded token",
  },
  {
    pattern: /(?:private[_-]?key)\s*[:=]\s*['"`]([^'"`\s]{8,})['"`]/gi,
    label: "hardcoded private key",
  },
  {
    pattern: /sk-[a-zA-Z0-9]{32,}/g,
    label: "OpenAI API key",
  },
  {
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    label: "GitHub personal access token",
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/g,
    label: "AWS access key ID",
  },
  {
    pattern:
      /(?:mysql|postgres|mongodb|redis):\/\/[^:]+:[^@\s]+@/gi,
    label: "database connection string with credentials",
  },
];

const SAFE_PATTERNS = [
  /process\.env\./,
  /os\.environ/,
  /getenv\(/,
  /config\./,
  /\$\{/,
  /placeholder/i,
  /example/i,
  /your[_-]?key/i,
  /xxx+/i,
  /\*{3,}/,
];

export const hardcodedSecretsRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      if (line.trim().startsWith("//") || line.trim().startsWith("#")) return;
      if (SAFE_PATTERNS.some((p) => p.test(line))) return;

      for (const { pattern, label } of SECRET_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: definition.severity,
            message: `Found ${label} in source code`,
            suggestion:
              "Move secrets to environment variables (e.g., process.env.MY_SECRET) and use a .env file with dotenv. Never commit secrets to version control.",
            filePath: file.path,
            line: lineIndex + 1,
            column: match.index + 1,
            codeSnippet: line.trim(),
            fixable: false,
          });
        }
      }
    });

    return issues;
  },
};
