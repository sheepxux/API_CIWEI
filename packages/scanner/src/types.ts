export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export type RuleCategory =
  | "security"
  | "design"
  | "error-handling"
  | "performance"
  | "documentation"
  | "best-practices";

export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "go"
  | "java"
  | "php"
  | "ruby";

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: SeverityLevel;
  languages: SupportedLanguage[];
  docs?: string;
  fixable?: boolean;
}

export interface ScanIssue {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  severity: SeverityLevel;
  message: string;
  suggestion: string;
  filePath: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  codeSnippet?: string;
  fixable?: boolean;
}

export interface ScanFile {
  path: string;
  content: string;
  language: SupportedLanguage;
  size: number;
}

export interface ScanOptions {
  languages?: SupportedLanguage[];
  categories?: RuleCategory[];
  severityThreshold?: SeverityLevel;
  maxFileSize?: number;
  excludePatterns?: string[];
  enabledRules?: string[];
  disabledRules?: string[];
}

export interface ScanStats {
  totalFiles: number;
  scannedFiles: number;
  skippedFiles: number;
  totalIssues: number;
  issuesBySeverity: Record<SeverityLevel, number>;
  issuesByCategory: Record<RuleCategory, number>;
  issuesByLanguage: Record<string, number>;
  scanDurationMs: number;
}

export interface ScanResult {
  id: string;
  issues: ScanIssue[];
  stats: ScanStats;
  scannedAt: Date;
  options: ScanOptions;
}

export interface Rule {
  definition: RuleDefinition;
  check(file: ScanFile): ScanIssue[];
}

export interface Parser {
  language: SupportedLanguage;
  extensions: string[];
  parse(file: ScanFile): ScanIssue[];
  canParse(filePath: string): boolean;
}

export const LANGUAGE_EXTENSIONS: Record<SupportedLanguage, string[]> = {
  javascript: [".js", ".jsx", ".mjs", ".cjs"],
  typescript: [".ts", ".tsx", ".mts", ".cts"],
  python: [".py", ".pyw"],
  go: [".go"],
  java: [".java"],
  php: [".php", ".phtml"],
  ruby: [".rb", ".rake"],
};

export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};
