import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "PERF002",
  name: "N+1 Query Problem",
  description:
    "Detects potential N+1 query patterns where database queries are made inside loops.",
  category: "performance",
  severity: "high",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const LOOP_PATTERNS: RegExp[] = [
  /for\s*\(/gi,
  /\.forEach\s*\(/gi,
  /\.map\s*\(/gi,
  /\.filter\s*\(/gi,
  /\.reduce\s*\(/gi,
  /while\s*\(/gi,
  /for\s+\w+\s+in\s+/gi,
  /for\s+\w+\s+of\s+/gi,
];

const DB_QUERY_PATTERNS: RegExp[] = [
  /await\s+\w+\.find(?:One|ById|By)?\s*\(/gi,
  /await\s+db\.\w+\s*\(/gi,
  /await\s+prisma\.\w+\.\w+\s*\(/gi,
  /await\s+\w+\.query\s*\(/gi,
  /await\s+\w+\.execute\s*\(/gi,
  /\$\w+->find\s*\(/gi,
  /Model\.where\s*\(/gi,
  /\.objects\.get\s*\(/gi,
  /\.objects\.filter\s*\(/gi,
];

export const nPlusOneRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    let inLoop = false;
    let loopStartLine = 0;
    let loopBraceDepth = 0;
    let braceDepth = 0;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
        for (const char of line) {
          if (char === "{") braceDepth++;
          if (char === "}") braceDepth--;
        }
        return;
      }

      const isLoopStart = LOOP_PATTERNS.some((p) => {
        p.lastIndex = 0;
        return p.test(line);
      });

      if (isLoopStart && !inLoop) {
        inLoop = true;
        loopStartLine = lineIndex;
        loopBraceDepth = braceDepth;
      }

      if (inLoop) {
        const hasDbQuery = DB_QUERY_PATTERNS.some((p) => {
          p.lastIndex = 0;
          return p.test(line);
        });

        if (hasDbQuery) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: definition.severity,
            message: "Database query inside a loop — potential N+1 query problem",
            suggestion:
              "Avoid database queries inside loops. Instead, collect all IDs first, then fetch all records in a single query. Example: const ids = items.map(i => i.id); const records = await Model.findMany({ where: { id: { in: ids } } });",
            filePath: file.path,
            line: lineIndex + 1,
            column: 1,
            codeSnippet: trimmed,
            fixable: false,
          });
        }
      }

      for (const char of line) {
        if (char === "{") braceDepth++;
        if (char === "}") {
          braceDepth--;
          if (inLoop && braceDepth <= loopBraceDepth) {
            inLoop = false;
          }
        }
      }
    });

    return issues;
  },
};
