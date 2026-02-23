import { NextRequest, NextResponse } from "next/server";
import { ScanEngine, createFilesFromEntries } from "@api-ciwei/scanner";
import type { ScanOptions } from "@api-ciwei/scanner";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_FILES = 500;
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    const body = await req.json();
    const { files, options, projectName } = body as {
      files: Array<{ path: string; content: string }>;
      options?: ScanOptions;
      projectName?: string;
    };

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid request: files array required" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Too many files. Maximum ${MAX_FILES} files allowed.` },
        { status: 400 }
      );
    }

    const totalSize = files.reduce((acc, f) => acc + (f.content?.length ?? 0), 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: "Project too large. Maximum 10MB total content size." },
        { status: 400 }
      );
    }

    const scanFiles = createFilesFromEntries(files, options);

    if (scanFiles.length === 0) {
      return NextResponse.json(
        { error: "No supported source files found. Supported: .js, .ts, .py, .go, .java, .php, .rb" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const engine = new ScanEngine();
    const result = engine.scanFiles(scanFiles, options);
    const durationMs = Date.now() - startTime;

    if (session?.user?.id) {
      const languages = Array.from(new Set(scanFiles.map(f => f.language)));
      const score = Math.max(0, 100 - Math.floor(result.issues.length * 2));
      
      await prisma.scan.create({
        data: {
          userId: session.user.id,
          name: projectName || `Scan ${new Date().toLocaleDateString()}`,
          status: "COMPLETED",
          totalFiles: files.length,
          scannedFiles: scanFiles.length,
          totalIssues: result.issues.length,
          score,
          durationMs,
          languages: JSON.stringify(languages),
          statsJson: result as any,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Internal server error during scan" },
      { status: 500 }
    );
  }
}
