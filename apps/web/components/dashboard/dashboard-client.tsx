"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  BarChart3,
  ChevronRight,
  Clock,
  FileCode2,
  LogOut,
  Shield,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getScoreColor,
  getScoreLabel,
  formatDuration,
  getSeverityDotColor,
} from "@/lib/utils";

interface ScanSummary {
  id: string;
  name: string | null;
  status: string;
  totalFiles: number;
  scannedFiles: number;
  totalIssues: number;
  score: number | null;
  durationMs: number | null;
  languages: string | null;
  createdAt: Date;
}

interface DashboardClientProps {
  user: { name: string; email: string; image: string };
  scans: ScanSummary[];
}

export function DashboardClient({ user, scans }: DashboardClientProps) {
  const completedScans = scans.filter((s) => s.status === "COMPLETED");
  const avgScore =
    completedScans.length > 0
      ? Math.round(
          completedScans.reduce((acc, s) => acc + (s.score ?? 0), 0) /
            completedScans.length
        )
      : null;

  const totalIssues = completedScans.reduce((acc, s) => acc + s.totalIssues, 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <nav className="sticky top-0 z-50 pt-6 pb-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-black/20 backdrop-blur-2xl border border-green-500/20 rounded-full shadow-2xl px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <div className="flex items-center gap-2">
                  <img src="/icons/CIWEI.svg" alt="API-CIWEI" className="w-7 h-7" />
                  <span className="font-semibold text-green-400">API-CIWEI</span>
                </div>
              </Link>
              <span className="text-green-700">/</span>
              <span className="text-green-500 text-sm">Dashboard</span>
            </div>
          <div className="flex items-center gap-3">
            {user.image && (
              <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm font-medium text-green-300">{user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2 text-green-500 hover:text-green-400"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-50 mb-2">Your Scans</h1>
            <p className="text-gray-500 text-sm mt-1">
              {completedScans.length} scan{completedScans.length !== 1 ? "s" : ""} completed
            </p>
          </div>
          <Link href="/scan">
            <Button className="gap-2 gradient-bg border-0">
              <Upload className="w-4 h-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedScans.length}</div>
                <div className="text-xs text-green-400">Total Scans</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${avgScore !== null ? getScoreColor(avgScore) : "text-gray-400"}`}>
                  {avgScore !== null ? avgScore : "—"}
                </div>
                <div className="text-xs text-gray-500">Avg Quality Score</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-900/30 bg-black/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-950 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-50">{totalIssues}</div>
                <div className="text-xs text-green-400">Total Issues Found</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scan History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {scans.length === 0 ? (
              <div className="py-16 text-center">
                <FileCode2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-green-200">View and manage your scan history</p>
                <p className="text-gray-400 text-sm mt-1">Upload your first project to get started</p>
                <Link href="/scan" className="mt-4 inline-block">
                  <Button size="sm" className="gradient-bg border-0 mt-4">
                    Start Scanning
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {scans.map((scan) => (
                  <Card key={scan.id} className="hover:shadow-md transition-shadow border-green-900/30 bg-black/60 backdrop-blur-sm hover:border-green-700">
                    <CardContent className="px-6 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">
                            {scan.name ?? `Scan #${scan.id.slice(-6)}`}
                          </span>
                          <Badge
                            variant={scan.status === "COMPLETED" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {scan.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <span>{scan.scannedFiles} files</span>
                          <span>·</span>
                          <span>{scan.totalIssues} issues</span>
                          {scan.durationMs && (
                            <>
                              <span>·</span>
                              <span>{formatDuration(scan.durationMs)}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {scan.score !== null && (
                        <div className={`text-lg font-bold ${getScoreColor(scan.score)}`}>
                          {scan.score}
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-green-500 shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
