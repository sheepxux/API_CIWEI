"use client";

import { signIn } from "next-auth/react";
import { Github, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-green-800 bg-black/60 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-2xl mx-auto mb-4">
            刺
          </div>
          <h1 className="text-2xl font-bold text-green-50 mb-2">Welcome to API-CIWEI</h1>
          <CardDescription>
            Save your scan history and access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black border-0 font-semibold"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            <Github className="w-4 h-4" />
            Continue with GitHub
          </Button>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <Shield className="w-3 h-3" />
            <span>We only request read access to your public profile</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
