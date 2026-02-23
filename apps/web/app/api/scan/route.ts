import { NextRequest, NextResponse } from "next/server";
import { ScanEngine, createFilesFromEntries } from "@api-ciwei/scanner";
import type { ScanOptions } from "@api-ciwei/scanner";

const MAX_FILES = 500;
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { files, options } = body as {
      files: Array<{ path: string; content: string }>;
      options?: ScanOptions;
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

    const engine = new ScanEngine();
    const result = engine.scanFiles(scanFiles, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Internal server error during scan" },
      { status: 500 }
    );
  }
}
