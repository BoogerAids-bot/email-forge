"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (type: "login" | "signup") => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = type === "login" 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FAF8F6] via-[#F5F3F0] to-[#FAFBF9] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="w-full max-w-md animate-smooth-fade">
        <div className="flex flex-col items-center mb-8 text-black dark:text-white">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-black/10">
            <Cloud className="text-white dark:text-black w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Email Forge</h1>
          <p className="text-muted-foreground mt-2">Professional Email Builder</p>
        </div>

        <Card className="glass-liquid-thick border-none shadow-2xl dark:bg-zinc-900/50 overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-zinc-200/50 dark:bg-zinc-800/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 shadow-sm">Sign Up</TabsTrigger>
              </TabsList>
              <CardTitle className="text-xl">Workspace Access</CardTitle>
              <CardDescription>
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md animate-smooth-slide">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-10 h-11 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10 h-11 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <TabsContent value="login">
              <CardFooter>
                <Button 
                  className="w-full h-11 font-bold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-300 active:scale-[0.98]" 
                  disabled={loading}
                  onClick={() => handleAuth("login")}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                </Button>
              </CardFooter>
            </TabsContent>
            <TabsContent value="signup">
              <CardFooter>
                <Button 
                  className="w-full h-11 font-bold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-300 active:scale-[0.98]" 
                  disabled={loading}
                  onClick={() => handleAuth("signup")}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; 2026 Email Forge. Secure Authentication Powered by Supabase.
        </p>
      </div>
    </div>
  );
}
