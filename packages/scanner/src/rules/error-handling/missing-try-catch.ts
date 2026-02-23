import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "ERR001",
  name: "Missing Error Handling",
  description:
    "Detects async route handlers and database operations that lack try-catch error handling.",
  category: "error-handling",
  severity: "high",
  languages: ["javascript", "typescript"],
  fixable: false,
};

const ASYNC_HANDLER_PATTERN =
  /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`][^'"`]+['"`]\s*,\s*async\s*(?:\([^)]*\)|[a-zA-Z]+)\s*=>\s*\{/gi;

const DB_OPERATIONS_PATTERN =
  /(?:await\s+)?(?:db|prisma|mongoose|sequelize|knex|pool|connection|query|Model)\s*[.(]/gi;

const TRY_CATCH_PATTERN = /try\s*\{/gi;

export const missingTryCatchRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    let braceDepth = 0;
    let inAsyncHandler = false;
    let handlerStartLine = 0;
    let handlerBraceDepth = 0;
    let handlerHasTryCatch = false;
    let handlerHasDbOp = false;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//")) return;

      ASYNC_HANDLER_PATTERN.lastIndex = 0;
      const handlerMatch = ASYNC_HANDLER_PATTERN.exec(line);

      if (handlerMatch && !inAsyncHandler) {
        inAsyncHandler = true;
        handlerStartLine = lineIndex;
        handlerBraceDepth = braceDepth;
        handlerHasTryCatch = false;
        handlerHasDbOp = false;
      }

      if (inAsyncHandler) {
        TRY_CATCH_PATTERN.lastIndex = 0;
        if (TRY_CATCH_PATTERN.test(line)) {
          handlerHasTryCatch = true;
        }

        DB_OPERATIONS_PATTERN.lastIndex = 0;
        if (DB_OPERATIONS_PATTERN.test(line) && /await/.test(line)) {
          handlerHasDbOp = true;
        }
      }

      for (const char of line) {
        if (char === "{") braceDepth++;
        if (char === "}") {
          braceDepth--;
          if (inAsyncHandler && braceDepth <= handlerBraceDepth) {
            if (handlerHasDbOp && !handlerHasTryCatch) {
              issues.push({
                ruleId: definition.id,
                ruleName: definition.name,
                category: definition.category,
                severity: definition.severity,
                message:
                  "Async route handler with database operations lacks try-catch error handling",
                suggestion:
                  "Wrap async operations in try-catch blocks. Example:\nasync (req, res) => {\n  try {\n    const result = await db.query(...);\n    res.json(result);\n  } catch (error) {\n    res.status(500).json({ error: 'Internal server error' });\n  }\n}",
                filePath: file.path,
                line: handlerStartLine + 1,
                column: 1,
                codeSnippet: lines[handlerStartLine]?.trim(),
                fixable: false,
              });
            }
            inAsyncHandler = false;
          }
        }
      }
    });

    return issues;
  },
};
