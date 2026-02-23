"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FolderOpen,
  FileCode2,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScanResults } from "@/components/scan/scan-results";
import { ScanProgress } from "@/components/scan/scan-progress";
import type { ScanResult } from "@api-ciwei/scanner";

type ScanState = "idle" | "uploading" | "scanning" | "done" | "error";

interface FileEntry {
  path: string;
  content: string;
}

export default function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fileCount, setFileCount] = useState(0);
  const [currentFile, setCurrentFile] = useState("");

  const processFiles = useCallback(async (entries: FileEntry[]) => {
    setScanState("scanning");
    setFileCount(entries.length);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: entries }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Scan failed");
      }

      const result: ScanResult = await response.json();
      setScanResult(result);
      setScanState("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      setScanState("error");
    }
  }, []);

  const readFilesFromZip = useCallback(async (file: File): Promise<FileEntry[]> => {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    const entries: FileEntry[] = [];

    const promises = Object.entries(loaded.files).map(async ([path, zipFile]) => {
      if (zipFile.dir) return;
      if (path.includes("node_modules/") || path.includes(".git/")) return;
      if (path.includes("dist/") || path.includes("build/") || path.includes(".next/")) return;

      try {
        const content = await zipFile.async("string");
        entries.push({ path, content });
      } catch {
        // Skip binary files
      }
    });

    await Promise.all(promises);
    return entries;
  }, []);

  const readFilesFromFileList = useCallback(async (files: File[]): Promise<FileEntry[]> => {
    const entries: FileEntry[] = [];

    const promises = files.map(async (file) => {
      const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      if (path.includes("node_modules/") || path.includes(".git/")) return;
      if (path.includes("dist/") || path.includes("build/") || path.includes(".next/")) return;

      try {
        const content = await file.text();
        entries.push({ path, content });
      } catch {
        // Skip binary files
      }
    });

    await Promise.all(promises);
    return entries;
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setScanState("uploading");
    setErrorMessage("");

    try {
      let entries: FileEntry[] = [];

      if (acceptedFiles.length === 1 && acceptedFiles[0].name.endsWith(".zip")) {
        setCurrentFile("Extracting ZIP archive...");
        entries = await readFilesFromZip(acceptedFiles[0]);
      } else {
        setCurrentFile("Reading files...");
        entries = await readFilesFromFileList(acceptedFiles);
      }

      if (entries.length === 0) {
        throw new Error("No supported source files found. Please upload a project with .js, .ts, .py, .go, .java, .php, or .rb files.");
      }

      await processFiles(entries);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to read files");
      setScanState("error");
    }
  }, [readFilesFromZip, readFilesFromFileList, processFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    multiple: true,
    accept: {
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
      "text/javascript": [".js", ".mjs", ".cjs"],
      "text/typescript": [".ts", ".tsx", ".mts"],
      "text/x-python": [".py"],
      "text/x-go": [".go"],
      "text/x-java": [".java"],
      "application/x-httpd-php": [".php"],
      "text/x-ruby": [".rb"],
      "text/plain": [".js", ".ts", ".tsx", ".jsx", ".py", ".go", ".java", ".php", ".rb"],
    },
  });

  const reset = () => {
    setScanState("idle");
    setScanResult(null);
    setErrorMessage("");
    setFileCount(0);
    setCurrentFile("");
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="sticky top-0 z-50 pt-6 pb-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-black/20 backdrop-blur-2xl border border-green-500/20 rounded-full shadow-2xl px-8 h-16 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <img src="/icons/CIWEI.svg" alt="API-CIWEI" className="w-6 h-6" />
              <span className="font-semibold text-green-400">API-CIWEI Scanner</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {scanState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-green-50 mb-3">Scan Your API Project</h1>
                <p className="text-green-200">
                  Upload your project folder as a ZIP file, or drag individual files.
                  We&apos;ll scan for security issues, design flaws, and best practice violations.
                </p>
              </div>

              {/* Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-green-500 bg-green-950 scale-[1.02]"
                    : "border-green-800 bg-black/60 backdrop-blur-sm hover:border-green-600 hover:bg-green-950/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? "bg-green-900" : "bg-green-950"}`}>
                    {isDragActive ? (
                      <FolderOpen className="w-8 h-8 text-green-400" />
                    ) : (
                      <Upload className="w-8 h-8 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-50">
                      {isDragActive ? "Drop your project here" : "Drop your project folder or ZIP"}
                    </p>
                    <p className="text-green-300 text-sm mt-1">
                      or <span className="text-green-400 font-medium">click to browse</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {[".js", ".ts", ".py", ".go", ".java", ".php", ".rb", ".zip"].map((ext) => (
                      <span key={ext} className="px-2 py-1 bg-green-950 border border-green-800 text-green-400 text-xs rounded font-mono">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: FileCode2, title: "7 Languages", desc: "JS, TS, Python, Go, Java, PHP, Ruby" },
                  { icon: Sparkles, title: "19+ Rules", desc: "Security, design, performance & more" },
                  { icon: Upload, title: "ZIP Support", desc: "Compress your folder and upload" },
                ].map((tip) => (
                  <Card key={tip.title} className="border-green-900/30 bg-black/60 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-start gap-3">
                      <tip.icon className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-green-50">{tip.title}</p>
                        <p className="text-xs text-green-300 mt-0.5">{tip.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {(scanState === "uploading" || scanState === "scanning") && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto"
            >
              <ScanProgress
                state={scanState}
                fileCount={fileCount}
                currentFile={currentFile}
              />
            </motion.div>
          )}

          {scanState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="bg-red-950/50 border border-red-800 rounded-2xl p-8 backdrop-blur-sm">
                <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-300 mb-2">Scan Failed</h3>
                <p className="text-red-400 text-sm mb-6">{errorMessage}</p>
                <Button onClick={reset} variant="outline" className="border-red-700 text-red-400 hover:bg-red-950">
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {scanState === "done" && scanResult && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ScanResults result={scanResult} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
