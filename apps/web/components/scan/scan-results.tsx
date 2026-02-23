"use client";

import { useState } from "react";
import {
  Shield,
  Code2,
  AlertTriangle,
  Zap,
  FileText,
  CheckCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScanResult, ScanIssue, RuleCategory, SeverityLevel } from "@api-ciwei/scanner";
import {
  cn,
  getSeverityBadgeColor,
  getSeverityDotColor,
  getCategoryIcon,
  getCategoryLabel,
  getSeverityLabel,
  calculateScore,
  getScoreColor,
  getScoreLabel,
  formatDuration,
  truncatePath,
} from "@/lib/utils";

interface ScanResultsProps {
  result: ScanResult;
  onReset: () => void;
}

const CATEGORY_ICONS: Record<RuleCategory, typeof Shield> = {
  security: Shield,
  design: Code2,
  "error-handling": AlertTriangle,
  performance: Zap,
  documentation: FileText,
  "best-practices": CheckCircle,
};

export function ScanResults({ result, onReset }: ScanResultsProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<RuleCategory | "all">("all");

  const score = calculateScore(result.stats);
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  const toggleIssue = (id: string) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredIssues =
    activeCategory === "all"
      ? result.issues
      : result.issues.filter((i) => i.category === activeCategory);

  const categoriesWithIssues = Object.entries(result.stats.issuesByCategory)
    .filter(([, count]) => count > 0)
    .map(([cat]) => cat as RuleCategory);

  const handleDownload = () => {
    const report = {
      scannedAt: result.scannedAt,
      score,
      stats: result.stats,
      issues: result.issues,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-ciwei-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-50">Scan Results</h2>
          <p className="text-green-300 text-sm mt-1">
            {result.stats.scannedFiles} files scanned · {formatDuration(result.stats.scanDurationMs)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            New Scan
          </Button>
        </div>
      </div>

      {/* Score + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Card */}
        <Card className="md:col-span-1 border-2 border-green-800 bg-black/60 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className={`text-5xl font-black mb-1 ${scoreColor}`}>{score}</div>
            <div className={`text-sm font-semibold mb-1 ${scoreColor}`}>{scoreLabel}</div>
            <div className="text-xs text-green-500">Quality Score</div>
          </CardContent>
        </Card>

        {/* Severity Breakdown */}
        {(["critical", "high", "medium", "low"] as SeverityLevel[]).map((sev) => {
          const count = result.stats.issuesBySeverity[sev];
          return (
            <Card key={sev} className={cn("border bg-black/60 backdrop-blur-sm", count > 0 ? "border-current" : "border-green-900/30")}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full shrink-0", getSeverityDotColor(sev))} />
                <div>
                  <div className="text-2xl font-bold text-green-50">{count}</div>
                  <div className="text-xs text-green-400">{getSeverityLabel(sev)}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(CATEGORY_ICONS) as RuleCategory[]).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const count = result.stats.issuesByCategory[cat] ?? 0;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? "all" : cat)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                activeCategory === cat
                  ? "border-green-500 bg-green-950"
                  : "border-green-900/30 bg-black/60 backdrop-blur-sm hover:border-green-700"
              )}
            >
              <div className="text-lg mb-1">{getCategoryIcon(cat)}</div>
              <div className="text-xl font-bold text-green-50">{count}</div>
              <div className="text-xs text-green-400 leading-tight">{getCategoryLabel(cat)}</div>
            </button>
          );
        })}
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {activeCategory === "all"
                ? `All Issues (${result.issues.length})`
                : `${getCategoryLabel(activeCategory)} (${filteredIssues.length})`}
            </CardTitle>
            {activeCategory !== "all" && (
              <Button variant="ghost" size="sm" onClick={() => setActiveCategory("all")}>
                Show all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center text-green-300">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="font-medium">No issues found in this category!</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredIssues.map((issue, idx) => (
                <IssueRow
                  key={`${issue.ruleId}-${issue.filePath}-${issue.line}-${idx}`}
                  issue={issue}
                  isExpanded={expandedIssues.has(`${issue.ruleId}-${idx}`)}
                  onToggle={() => toggleIssue(`${issue.ruleId}-${idx}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files Summary */}
      {Object.keys(result.stats.issuesByLanguage).length > 0 && (
        <Card className="border-green-900/30 bg-black/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode2 className="w-4 h-4" />
              Issues by Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(result.stats.issuesByLanguage).map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-2 bg-green-950/50 border border-green-900 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-green-300 capitalize">{lang}</span>
                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function IssueRow({
  issue,
  isExpanded,
  onToggle,
}: {
  issue: ScanIssue;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="hover:bg-green-950/20 transition-colors">
      <button
        className="w-full px-4 py-3 flex items-start gap-3 text-left"
        onClick={onToggle}
      >
        <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", getSeverityDotColor(issue.severity))} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", getSeverityBadgeColor(issue.severity))}>
              {getSeverityLabel(issue.severity)}
            </span>
            <span className="text-xs text-gray-400 font-mono">{issue.ruleId}</span>
            <span className="text-xs text-gray-500">{getCategoryIcon(issue.category)} {getCategoryLabel(issue.category)}</span>
          </div>
          <p className="text-sm font-medium text-green-50 mt-1">{issue.message}</p>
          <p className="text-xs text-green-500 mt-0.5 font-mono">
            {truncatePath(issue.filePath)}:{issue.line}:{issue.column}
          </p>
        </div>
        <div className="shrink-0 mt-1">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-green-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-green-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 ml-5 space-y-3">
          {issue.codeSnippet && (
            <div className="bg-black border border-green-900 rounded-lg p-3 overflow-x-auto">
              <p className="text-xs text-green-500 mb-1">Line {issue.line}</p>
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                {issue.codeSnippet}
              </pre>
            </div>
          )}
          <div className="bg-green-950/50 border border-green-800 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-400 mb-1">💡 Suggestion</p>
            <p className="text-sm text-green-200 whitespace-pre-wrap">{issue.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
