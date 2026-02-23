"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Code2,
  ArrowRight,
  CheckCircle,
  Github,
  Upload,
  BarChart3,
  Lock,
  AlertTriangle,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GridScan = dynamic(() => import("@/components/GridScan"), { ssr: false });
const ASCIIText = dynamic(() => import("@/components/ASCIIText"), { ssr: false });

const features = [
  {
    icon: Shield,
    title: "Security Scanning",
    description: "Detect SQL injection, XSS, hardcoded secrets, CORS misconfigurations, and missing authentication.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Code2,
    title: "API Design Review",
    description: "Validate REST conventions, HTTP method usage, status codes, versioning, and naming patterns.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: AlertTriangle,
    title: "Error Handling",
    description: "Find missing try-catch blocks, unhandled promise rejections, and inconsistent error responses.",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    icon: Zap,
    title: "Performance Issues",
    description: "Identify N+1 queries, missing pagination, lack of caching, and other performance bottlenecks.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: FileSearch,
    title: "Documentation Check",
    description: "Detect missing OpenAPI/Swagger annotations, undocumented endpoints, and incomplete API specs.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description: "Get a quality score, severity breakdown, and actionable fix suggestions for every issue found.",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

const languages = [
  "JavaScript", "TypeScript", "Python", "Go", "Java", "PHP", "Ruby",
];

const stats = [
  { label: "Scan Rules", value: "19+" },
  { label: "Languages", value: "7" },
  { label: "Issue Categories", value: "6" },
  { label: "Open Source", value: "MIT" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-50 pt-6 pb-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-black/20 backdrop-blur-2xl border border-green-500/20 rounded-full shadow-2xl px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icons/CIWEI.svg" alt="API-CIWEI" className="w-7 h-7" />
              <span className="font-bold text-lg text-green-400">API-CIWEI</span>
            </div>
          <div className="flex items-center gap-3">
            <Link href="https://github.com/sheepxux" target="_blank">
              <Button variant="ghost" size="sm" className="gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </Link>
            <Link href="/scan">
              <Button size="sm" className="gap-2 gradient-bg border-0">
                Start Scanning
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-16" style={{ minHeight: '600px' }}>
        {/* GridScan background layer */}
        <div className="absolute inset-0 pointer-events-auto">
          <GridScan
            sensitivity={0.85}
            lineThickness={1.5}
            linesColor="#1a0a2e"
            gridScale={0.08}
            scanColor="#22c55e"
            scanOpacity={0.6}
            enablePost
            bloomIntensity={0.9}
            chromaticAberration={0.001}
            noiseIntensity={0.015}
          />
        </div>
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-[5]" />
        {/* Content layer - clickable */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <Badge className="bg-green-950 text-green-400 border-green-800 hover:bg-green-950">
              🦔 Open Source · Free to Use
            </Badge>
            <Badge className="bg-black border-green-500/40 text-green-300/70 hover:bg-black gap-1">
              <span className="text-green-500">↑</span>
              Successor to{" "}
              <a href="https://github.com/sheepxux/API-Dot-Web" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-2">
                API-DOT
              </a>
            </Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-green-50 mb-6 leading-tight">
            Scan Your API Code for
            <br />
            <span className="gradient-text">Errors & Vulnerabilities</span>
          </h1>
          <p className="text-xl text-green-200 max-w-2xl mx-auto mb-10">
            Upload your project folder and get a full report on security issues, design problems, and bad practices. No signup needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scan">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black border-0 text-base px-8 font-semibold">
                <Upload className="w-5 h-5" />
                Upload Your Project
              </Button>
            </Link>
            <Link href="https://github.com/sheepxux/API-CIWEI" target="_blank">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-green-400">{stat.value}</div>
              <div className="text-sm text-green-300/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-black/40 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-50">How It Works</h2>
            <p className="text-green-200 mt-3">Three simple steps to better API code</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload Your Project", desc: "Drag & drop your project folder or ZIP file. Supports 7 languages.", icon: Upload },
              { step: "02", title: "Instant Analysis", desc: "Our engine scans every file with 19+ rules across 6 categories.", icon: Zap },
              { step: "03", title: "Review Results", desc: "Get a quality score and a breakdown of every issue found, with file and line references.", icon: BarChart3 },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-green-900/30 text-center"
              >
                <div className="text-4xl font-black text-green-900/40 mb-4">{item.step}</div>
                <item.icon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-50 mb-2">{item.title}</h3>
                <p className="text-green-200 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-50">What We Detect</h2>
          <p className="text-green-200 mt-3">19+ rules across security, design, performance, and more</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-green-900/30 shadow-sm hover:shadow-md hover:border-green-700/50 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-green-50 mb-2">{feature.title}</h3>
              <p className="text-green-200 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-black/40 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-green-400 text-sm font-medium mb-4 uppercase tracking-wider">Supported Languages</p>
          <div className="flex flex-wrap justify-center gap-3">
            {languages.map((lang) => (
              <span key={lang} className="px-4 py-2 bg-black/60 backdrop-blur-sm border border-green-800 rounded-full text-sm font-medium text-green-300 shadow-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ height: '400px' }}>
        <ASCIIText
          text="CIWEI"
          enableWaves
          asciiFontSize={8}
          textFontSize={200}
        />
      </section>

      {/* Footer */}
      <footer className="relative border-t border-green-500/20 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/icons/CIWEI.svg" alt="API-CIWEI" className="w-10 h-10" />
                <div>
                  <h3 className="font-bold text-xl text-green-400">API-CIWEI</h3>
                  <p className="text-xs text-green-600">Security Scanner</p>
                </div>
              </div>
              <p className="text-sm text-green-300/70 max-w-md mb-4">
                Scan your API codebase for security vulnerabilities, design issues, and bad practices. Free and open source.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  MIT License
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  Open Source
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-green-400 mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/scan" className="text-green-300/70 hover:text-green-400 transition-colors">
                    Start Scan
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-green-300/70 hover:text-green-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/sheepxux/API-CIWEI" target="_blank" className="text-green-300/70 hover:text-green-400 transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-semibold text-green-400 mb-4 text-sm">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="https://github.com/sheepxux/API-CIWEI" target="_blank" className="text-green-300/70 hover:text-green-400 transition-colors flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                  </Link>
                </li>
                <li>
                  <a href="mailto:Sheepxux@gmail.com" className="text-green-300/70 hover:text-green-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-green-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-green-300/50">
            <p>
              © 2026 API-CIWEI. Created by{" "}
              <a href="https://github.com/sheepxux" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors font-medium">
                @sheepxux
              </a>
            </p>
            <p className="text-green-300/40 text-xs">
              Successor to{" "}
              <a href="https://github.com/sheepxux/API-Dot-Web" target="_blank" rel="noopener noreferrer" className="text-green-500/60 hover:text-green-400 transition-colors">
                API-DOT
              </a>
              {" "}— the next generation API scanner.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
