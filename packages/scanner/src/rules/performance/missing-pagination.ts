import { Rule, ScanFile, ScanIssue, RuleDefinition } from "../../types";

const definition: RuleDefinition = {
  id: "PERF001",
  name: "Missing Pagination",
  description:
    "Detects API endpoints that return collections without pagination, which can cause performance issues with large datasets.",
  category: "performance",
  severity: "medium",
  languages: ["javascript", "typescript", "python", "go", "java", "php", "ruby"],
  fixable: false,
};

const COLLECTION_QUERY_PATTERNS: RegExp[] = [
  /(?:findAll|findMany|find\(\)|getAll|fetchAll|selectAll|\.all\(\))/gi,
  /(?:Model|db|prisma|mongoose|sequelize)\.\w+\.find\s*\(\s*\)/gi,
  /SELECT\s+\*\s+FROM\s+\w+\s*(?:WHERE[^;]*)?;/gi,
  /\.find\s*\(\s*\{\s*\}\s*\)/gi,
  /collection\.find\s*\(\s*\)/gi,
];

const PAGINATION_PATTERNS: RegExp[] = [
  /limit/i,
  /offset/i,
  /page/i,
  /skip/i,
  /take/i,
  /perPage/i,
  /per_page/i,
  /pageSize/i,
  /page_size/i,
  /cursor/i,
  /LIMIT\s+\d+/i,
];

export const missingPaginationRule: Rule = {
  definition,
  check(file: ScanFile): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) return;

      const contextStart = Math.max(0, lineIndex - 2);
      const contextEnd = Math.min(lines.length, lineIndex + 5);
      const context = lines.slice(contextStart, contextEnd).join("\n");

      if (PAGINATION_PATTERNS.some((p) => p.test(context))) return;

      for (const pattern of COLLECTION_QUERY_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          issues.push({
            ruleId: definition.id,
            ruleName: definition.name,
            category: definition.category,
            severity: definition.severity,
            message: "Collection query without pagination — may return unbounded results",
            suggestion:
              "Add pagination to collection endpoints. Example: const { page = 1, limit = 20 } = req.query; const items = await Model.findMany({ skip: (page-1)*limit, take: limit }); Return total count and pagination metadata in response.",
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
