"use client";

import { Loader2, FileCode2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ScanProgressProps {
  state: "uploading" | "scanning";
  fileCount: number;
  currentFile: string;
}

export function ScanProgress({ state, fileCount, currentFile }: ScanProgressProps) {
  return (
    <Card className="border-green-900/30 bg-black/60 backdrop-blur-sm shadow-lg">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-950 flex items-center justify-center">
              {state === "uploading" ? (
                <FileCode2 className="w-10 h-10 text-green-400" />
              ) : (
                <Search className="w-10 h-10 text-green-400" />
              )}
            </div>
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-green-50 mb-2">
              {state === "uploading" ? "Reading Files..." : "Scanning Code..."}
            </h3>
            <p className="text-green-200 text-sm">
              {state === "uploading"
                ? "Extracting and reading your project files"
                : `Analyzing ${fileCount} file${fileCount !== 1 ? "s" : ""} with 19+ rules`}
            </p>
          </div>

          {currentFile && (
            <div className="w-full bg-green-950/50 border border-green-900 rounded-lg p-3 text-left">
              <p className="text-xs text-green-500 mb-1">Current file</p>
              <p className="text-sm text-green-300 font-mono truncate">{currentFile}</p>
            </div>
          )}

          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
