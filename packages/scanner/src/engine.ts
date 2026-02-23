import { randomUUID } from "crypto";
import {
  Rule,
  ScanFile,
  ScanIssue,
  ScanOptions,
  ScanResult,
  ScanStats,
  SupportedLanguage,
  LANGUAGE_EXTENSIONS,
  SEVERITY_ORDER,
  SeverityLevel,
  RuleCategory,
} from "./types";
import { detectLanguage } from "./utils/language-detector";

import { hardcodedSecretsRule } from "./rules/security/hardcoded-secrets";
import { sqlInjectionRule } from "./rules/security/sql-injection";
import { missingAuthRule } from "./rules/security/missing-auth";
import { corsMisconfigurationRule } from "./rules/security/cors-misconfiguration";
import { rateLimitingRule } from "./rules/security/rate-limiting";
import { xssVulnerabilityRule } from "./rules/security/xss-vulnerability";
import { httpMethodsRule } from "./rules/design/http-methods";
import { statusCodesRule } from "./rules/design/status-codes";
import { apiVersioningRule } from "./rules/design/api-versioning";
import { namingConventionsRule } from "./rules/design/naming-conventions";
import { missingTryCatchRule } from "./rules/error-handling/missing-try-catch";
import { unhandledPromiseRule } from "./rules/error-handling/unhandled-promise";
import { errorResponseFormatRule } from "./rules/error-handling/error-response-format";
import { missingPaginationRule } from "./rules/performance/missing-pagination";
import { nPlusOneRule } from "./rules/performance/n-plus-one";
import { missingCacheRule } from "./rules/performance/missing-cache";
import { missingOpenApiRule } from "./rules/documentation/missing-openapi";
import { inputValidationRule } from "./rules/best-practices/input-validation";
import { noSensitiveDataExposureRule } from "./rules/best-practices/no-sensitive-data-exposure";

export const ALL_RULES: Rule[] = [
  hardcodedSecretsRule,
  sqlInjectionRule,
  missingAuthRule,
  corsMisconfigurationRule,
  rateLimitingRule,
  xssVulnerabilityRule,
  httpMethodsRule,
  statusCodesRule,
  apiVersioningRule,
  namingConventionsRule,
  missingTryCatchRule,
  unhandledPromiseRule,
  errorResponseFormatRule,
  missingPaginationRule,
  nPlusOneRule,
  missingCacheRule,
  missingOpenApiRule,
  inputValidationRule,
  noSensitiveDataExposureRule,
];

export class ScanEngine {
  private rules: Rule[];

  constructor(rules: Rule[] = ALL_RULES) {
    this.rules = rules;
  }

  scanFile(file: ScanFile, options: ScanOptions = {}): ScanIssue[] {
    const { categories, enabledRules, disabledRules, severityThreshold } =
      options;

    const applicableRules = this.rules.filter((rule) => {
      if (
        !rule.definition.languages.includes(file.language) &&
        !rule.definition.languages.includes("javascript")
      ) {
        if (!rule.definition.languages.includes(file.language)) return false;
      }

      if (categories && !categories.includes(rule.definition.category))
        return false;
      if (enabledRules && !enabledRules.includes(rule.definition.id))
        return false;
      if (disabledRules && disabledRules.includes(rule.definition.id))
        return false;
      if (
        severityThreshold &&
        SEVERITY_ORDER[rule.definition.severity] <
          SEVERITY_ORDER[severityThreshold]
      )
        return false;

      return true;
    });

    const issues: ScanIssue[] = [];
    for (const rule of applicableRules) {
      try {
        const ruleIssues = rule.check(file);
        issues.push(...ruleIssues);
      } catch {
        // Rule failed silently — don't crash the whole scan
      }
    }

    return issues;
  }

  scanFiles(files: ScanFile[], options: ScanOptions = {}): ScanResult {
    const startTime = Date.now();
    const allIssues: ScanIssue[] = [];
    let scannedFiles = 0;
    let skippedFiles = 0;

    const maxFileSize = options.maxFileSize ?? 500 * 1024;

    for (const file of files) {
      if (file.size > maxFileSize) {
        skippedFiles++;
        continue;
      }

      const issues = this.scanFile(file, options);
      allIssues.push(...issues);
      scannedFiles++;
    }

    const stats = this.computeStats(
      files.length,
      scannedFiles,
      skippedFiles,
      allIssues,
      files,
      Date.now() - startTime
    );

    return {
      id: randomUUID(),
      issues: allIssues.sort(
        (a, b) =>
          SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]
      ),
      stats,
      scannedAt: new Date(),
      options,
    };
  }

  private computeStats(
    totalFiles: number,
    scannedFiles: number,
    skippedFiles: number,
    issues: ScanIssue[],
    files: ScanFile[],
    durationMs: number
  ): ScanStats {
    const issuesBySeverity: Record<SeverityLevel, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    const issuesByCategory: Record<RuleCategory, number> = {
      security: 0,
      design: 0,
      "error-handling": 0,
      performance: 0,
      documentation: 0,
      "best-practices": 0,
    };

    const issuesByLanguage: Record<string, number> = {};

    for (const issue of issues) {
      issuesBySeverity[issue.severity]++;
      issuesByCategory[issue.category]++;

      const file = files.find((f) => f.path === issue.filePath);
      if (file) {
        issuesByLanguage[file.language] =
          (issuesByLanguage[file.language] ?? 0) + 1;
      }
    }

    return {
      totalFiles,
      scannedFiles,
      skippedFiles,
      totalIssues: issues.length,
      issuesBySeverity,
      issuesByCategory,
      issuesByLanguage,
      scanDurationMs: durationMs,
    };
  }

  getRules(): Rule[] {
    return this.rules;
  }

  getRuleById(id: string): Rule | undefined {
    return this.rules.find((r) => r.definition.id === id);
  }
}

export function createFilesFromEntries(
  entries: Array<{ path: string; content: string }>,
  options: ScanOptions = {}
): ScanFile[] {
  const files: ScanFile[] = [];
  const excludePatterns = options.excludePatterns ?? [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "vendor",
    "__pycache__",
    "*.min.js",
    "*.test.*",
    "*.spec.*",
  ];

  for (const entry of entries) {
    if (
      excludePatterns.some((pattern) => {
        if (pattern.includes("*")) {
          const regex = new RegExp(
            pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")
          );
          return regex.test(entry.path);
        }
        return entry.path.includes(pattern);
      })
    ) {
      continue;
    }

    const language = detectLanguage(entry.path);
    if (!language) continue;

    if (options.languages && !options.languages.includes(language)) continue;

    files.push({
      path: entry.path,
      content: entry.content,
      language,
      size: Buffer.byteLength(entry.content, "utf8"),
    });
  }

  return files;
}

export function detectLanguageFromExtension(
  filePath: string
): SupportedLanguage | null {
  return detectLanguage(filePath);
}

export { LANGUAGE_EXTENSIONS };
