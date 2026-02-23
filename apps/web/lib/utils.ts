import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SeverityLevel, RuleCategory } from "@api-ciwei/scanner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-blue-600 bg-blue-50 border-blue-200",
    info: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return colors[severity];
}

export function getSeverityBadgeColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    critical: "bg-red-100 text-red-700 border-red-300",
    high: "bg-orange-100 text-orange-700 border-orange-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    low: "bg-blue-100 text-blue-700 border-blue-300",
    info: "bg-gray-100 text-gray-700 border-gray-300",
  };
  return colors[severity];
}

export function getSeverityDotColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
    info: "bg-gray-400",
  };
  return colors[severity];
}

export function getCategoryIcon(category: RuleCategory): string {
  const icons: Record<RuleCategory, string> = {
    security: "🔒",
    design: "📐",
    "error-handling": "⚠️",
    performance: "⚡",
    documentation: "📄",
    "best-practices": "✅",
  };
  return icons[category];
}

export function getCategoryLabel(category: RuleCategory): string {
  const labels: Record<RuleCategory, string> = {
    security: "Security",
    design: "API Design",
    "error-handling": "Error Handling",
    performance: "Performance",
    documentation: "Documentation",
    "best-practices": "Best Practices",
  };
  return labels[category];
}

export function getSeverityLabel(severity: SeverityLevel): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function calculateScore(stats: {
  totalIssues: number;
  issuesBySeverity: Record<SeverityLevel, number>;
  scannedFiles: number;
}): number {
  if (stats.scannedFiles === 0) return 100;

  const weights: Record<SeverityLevel, number> = {
    critical: 25,
    high: 10,
    medium: 4,
    low: 1,
    info: 0,
  };

  const penalty = Object.entries(stats.issuesBySeverity).reduce(
    (acc, [severity, count]) => {
      return acc + weights[severity as SeverityLevel] * count;
    },
    0
  );

  const score = Math.max(0, 100 - penalty / Math.max(stats.scannedFiles, 1));
  return Math.round(score);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

export function truncatePath(filePath: string, maxLength = 50): string {
  if (filePath.length <= maxLength) return filePath;
  const parts = filePath.split("/");
  if (parts.length <= 2) return `...${filePath.slice(-maxLength)}`;
  return `.../${parts.slice(-2).join("/")}`;
}
