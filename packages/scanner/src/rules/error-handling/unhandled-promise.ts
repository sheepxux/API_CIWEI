import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "ERR002",
  name: "Unhandled Promise Rejection",
  description:
    "Detects Promise chains and async calls that lack .catch() or try-catch error handling.",
  category: "error-handling",
  severity: "high",
  languages: ["javascript", "typescript"],
  fixable: false,
};

const PROMISE_WITHOUT_CATCH: RegExp[] = [
  /(?:fetch|axios|got|request|http\.get|https\.get)\s*\([^)]*\)\s*\.then\s*\([^)]*\)\s*(?!\.catch)/gi,
  /new\s+Promise\s*\([^)]*\)\s*\.then\s*\([^)]*\)\s*(?!\.catch)/gi,
];

const FLOATING_AWAIT_PATTERN =
  /^\s*(?:const|let|var\s+\w+\s*=\s*)?await\s+(?!.*(?:try|catch))/gm;

const THEN_WITHOUT_CATCH =
  /\.then\s*\(\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{[^}]*\}\s*\)\s*;/gi;

export const unhandledPromiseRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//")) return;

      for (const pattern of PROMISE_WITHOUT_CATCH) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          const nextLines = lines
            .slice(lineIndex, lineIndex + 3)
            .join(" ");
          if (!nextLines.includes(".catch")) {
            issues.push({
              ruleId: definition.id,
              ruleName: definition.name,
              category: definition.category,
              severity: definition.severity,
              message: "Promise chain missing .catch() error handler",
              suggestion:
                "Add .catch() to handle promise rejections, or use async/await with try-catch. Example: fetch(url).then(handler).catch(err => console.error(err))",
              filePath: file.path,
              line: lineIndex + 1,
              column: match.index + 1,
              codeSnippet: trimmed,
              fixable: false,
            });
          }
          break;
        }
      }

      THEN_WITHOUT_CATCH.lastIndex = 0;
      const thenMatch = THEN_WITHOUT_CATCH.exec(line);
      if (thenMatch) {
        const nextLine = lines[lineIndex + 1] ?? "";
        if (!nextLine.includes(".catch") && !nextLine.includes("catch")) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: "medium",
            message: "Promise .then() without .catch() may cause unhandled rejection",
            suggestion:
              "Always add .catch() after .then() chains to handle errors gracefully.",
            filePath: file.path,
            line: lineIndex + 1,
            column: thenMatch.index + 1,
            codeSnippet: trimmed,
            fixable: false,
          });
        }
      }
    });

    return issues;
  },
};
