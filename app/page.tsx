"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export default function EmailBuilderDashboard() {
  // Authentication & Cloud Sync State
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [templateName, setTemplateName] = useState("My Brand Blueprint");
  const [isSaving, setIsSaving] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);

  // Layout Controls State
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [paddingVertical, setPaddingVertical] = useState([40]);
  const [paddingHorizontal, setPaddingHorizontal] = useState([32]);
  const [borderRadius, setBorderRadius] = useState([8]);
  
  // Image Banner State
  const [hasImage, setHasImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop");
  const [imageHeight, setImageHeight] = useState([180]);
  const [imageMarginBottom, setImageMarginBottom] = useState([20]);

  // Content State
  const [titleText, setTitleText] = useState("Unlock Your Growth Potential");
  const [titleColor, setTitleColor] = useState("#1a1a1a");
  const [titleSize, setTitleSize] = useState([28]);
  const [bodyText, setBodyText] = useState("We've designed this modular element template to look absolutely flawless across all traditional email desktop clients and mobile screens alike. Clean lines, fast load times.");
  const [bodyColor, setBodyColor] = useState("#4a4a4a");
  const [bodySize, setBodySize] = useState([16]);
  
  // Button State
  const [hasButton, setHasButton] = useState(true);
  const [buttonText, setButtonText] = useState("Get Started Instantly");
  const [buttonBg, setButtonBg] = useState("#000000");
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff");
  const [buttonRadius, setButtonRadius] = useState([4]);

  // Fetch historic repository rows from Postgres table
  const fetchSavedTemplates = async (userId: string) => {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error.message);
    } else if (data) {
      setSavedTemplates(data);
    }
  };

  // Sync user state on session mounting load
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchSavedTemplates(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSavedTemplates(session.user.id);
      } else {
        setSavedTemplates([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle Quick Signup/Sign In Pipeline
  const handleAuth = async (type: "login" | "signup") => {
    if (!email || !password) return alert("Please fill out your credentials.");
    
    if (type === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
      } else if (data?.user && data?.session === null) {
        alert("Account registered! Click 'Log In' to try accessing it directly, or check your settings.");
      } else {
        alert("Account successfully registered and logged in!");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      } else {
        setUser(data.user);
        alert("Successfully logged in!");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Push Canvas Parameter Configuration Packet
  const handleSaveTemplate = async () => {
    if (!user) return alert("You must be logged in to sync configs to the cloud.");
    setIsSaving(true);

    const currentConfig = {
      backgroundColor, paddingVertical, paddingHorizontal, borderRadius,
      hasImage, imageUrl, imageHeight, imageMarginBottom,
      titleText, titleColor, titleSize, bodyText, bodyColor, bodySize,
      hasButton, buttonText, buttonBg, buttonTextColor, buttonRadius
    };

    const { error } = await supabase.from("templates").insert({
      user_id: user.id,
      name: templateName,
      config: currentConfig
    });

    setIsSaving(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Template package saved safely to your cloud dashboard row!");
      fetchSavedTemplates(user.id);
    }
  };

  // Re-hydrate canvas state parameters with chosen history row 
  const loadTemplateConfig = (template: any) => {
    const cfg = template.config;
    if (!cfg) return;

    setBackgroundColor(cfg.backgroundColor || "#ffffff");
    setPaddingVertical(cfg.paddingVertical || [40]);
    setPaddingHorizontal(cfg.paddingHorizontal || [32]);
    setBorderRadius(cfg.borderRadius || [8]);
    
    setHasImage(cfg.hasImage !== undefined ? cfg.hasImage : false);
    setImageUrl(cfg.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop");
    setImageHeight(cfg.imageHeight || [180]);
    setImageMarginBottom(cfg.imageMarginBottom || [20]);

    setTitleText(cfg.titleText || "");
    setTitleColor(cfg.titleColor || "#1a1a1a");
    setTitleSize(cfg.titleSize || [28]);
    setBodyText(cfg.bodyText || "");
    setBodyColor(cfg.bodyColor || "#4a4a4a");
    setBodySize(cfg.bodySize || [16]);
    setHasButton(cfg.hasButton !== undefined ? cfg.hasButton : true);
    setButtonText(cfg.buttonText || "");
    setButtonBg(cfg.buttonBg || "#000000");
    setButtonTextColor(cfg.buttonTextColor || "#ffffff");
    setButtonRadius(cfg.buttonRadius || [4]);
    setTemplateName(template.name);
  };

  // Delete layout handler pipeline
  const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this layout configuration from the cloud?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      alert(`Failed to delete layout: ${error.message}`);
    } else {
      alert("Layout configuration deleted successfully.");
      if (user) fetchSavedTemplates(user.id);
    }
  };

  const generateHTMLCode = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Component</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${backgroundColor}; border-radius: ${borderRadius[0]}px; border-collapse: separate; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: ${paddingVertical[0]}px ${paddingHorizontal[0]}px ${paddingVertical[0]}px ${paddingHorizontal[0]}px; text-align: left;">
              ${hasImage ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: ${imageMarginBottom[0]}px;">
                <tr>
                  <td align="center">
                    <img src="${imageUrl}" alt="Email Banner" height="${imageHeight[0]}" style="display: block; width: 100%; max-width: 100%; height: ${imageHeight[0]}px; object-fit: cover; border-radius: 4px;" />
                  </td>
                </tr>
              </table>
              ` : ''}
              <h1 style="margin: 0 0 16px 0; font-size: ${titleSize[0]}px; line-height: 1.2; font-weight: 700; color: ${titleColor};">
                ${titleText}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: ${bodySize[0]}px; line-height: 1.6; font-weight: 400; color: ${bodyColor};">
                ${bodyText}
              </p>
              ${hasButton ? `
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;">
                <tr>
                  <td align="center" style="background-color: ${buttonBg}; border-radius: ${buttonRadius[0]}px;">
                    <a href="#" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 15px; font-weight: 600; color: ${buttonTextColor}; text-decoration: none; border-radius: ${buttonRadius[0]}px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateHTMLCode());
    alert("Clean HTML code copied to clipboard successfully!");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 font-sans text-slate-50">
      {/* LEFT CONTROL PANEL SIDEBAR */}
      <div className="w-[420px] border-r border-indigo-700/30 bg-gradient-to-b from-indigo-950/80 to-slate-900/80 backdrop-blur-lg flex flex-col h-full shrink-0 shadow-2xl">
        <div className="p-6 border-b border-indigo-700/30 shrink-0 flex items-center justify-between bg-gradient-to-r from-indigo-600/20 to-cyan-600/20">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Email Forge</h1>
            <p className="text-xs text-indigo-300/70 mt-1 font-medium">Craft stunning email templates</p>
          </div>
          {user && (
            <Button onClick={handleLogout} className="text-xs px-3 h-8 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-lg transition-all shadow-lg">
              Logout
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!user ? (
            <Card className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 border border-indigo-500/30 text-white backdrop-blur-sm shadow-xl rounded-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Cloud Authentication</CardTitle>
                <CardDescription className="text-xs text-indigo-300/70">Sign up or login to save your templates securely.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Input type="email" placeholder="Agency Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-indigo-950/50 border border-indigo-500/30 text-xs h-8 text-white placeholder-indigo-400/50 rounded-lg focus:border-cyan-400 focus:bg-indigo-950 transition-colors" />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-indigo-950/50 border border-indigo-500/30 text-xs h-8 text-white placeholder-indigo-400/50 rounded-lg focus:border-cyan-400 focus:bg-indigo-950 transition-colors" />
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => handleAuth("login")} className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg">Log In</Button>
                  <Button onClick={() => handleAuth("signup")} className="flex-1 text-xs h-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg">Sign Up</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-emerald-500/40 text-white backdrop-blur-sm shadow-xl rounded-xl">
                <CardHeader className="p-4 pb-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20">
                  <CardTitle className="text-sm font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">✓ Connected</CardTitle>
                  <CardDescription className="text-xs text-emerald-300/70">{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">Template Name</label>
                    <Input type="text" placeholder="My Awesome Template" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="bg-emerald-950/50 border border-emerald-500/30 text-xs h-8 text-white placeholder-emerald-400/50 rounded-lg focus:border-green-400 focus:bg-emerald-950 transition-colors" />
                  </div>
                  <Button onClick={handleSaveTemplate} disabled={isSaving} className="w-full text-xs h-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold mt-2 rounded-lg transition-all shadow-lg disabled:opacity-50">
                    {isSaving ? "Saving..." : "💾 Save to Cloud"}
                  </Button>
                </CardContent>
              </Card>

              {savedTemplates.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/70 pl-1">📚 Template History ({savedTemplates.length})</h3>
                  <div className="max-h-[120px] overflow-y-auto border border-cyan-500/30 rounded-lg bg-cyan-950/20 divide-y divide-cyan-900/30 backdrop-blur-sm">
                    {savedTemplates.map((tpl) => (
                      <div 
                        key={tpl.id} 
                        onClick={() => loadTemplateConfig(tpl)}
                        className="p-2.5 text-xs text-cyan-200 hover:text-white hover:bg-cyan-500/10 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex flex-col min-w-0 flex-1 pr-2">
                          <span className="font-semibold truncate max-w-[200px]">{tpl.name}</span>
                          <span className="text-[10px] text-cyan-400/60 font-mono mt-0.5">
                            {new Date(tpl.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                          className="text-cyan-400/50 hover:text-red-400 p-1 rounded hover:bg-red-500/20 transition-all duration-150 opacity-0 group-hover:opacity-100 shrink-0"
                          title="Delete Configuration"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-indigo-950/50 to-cyan-950/50 p-1 border border-indigo-500/30 rounded-lg backdrop-blur-sm">
              <TabsTrigger value="layout" className="text-[11px] rounded-md py-1.5 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-slate-400">🎨 Layout</TabsTrigger>
              <TabsTrigger value="image" className="text-[11px] rounded-md py-1.5 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-slate-400">🖼️ Banner</TabsTrigger>
              <TabsTrigger value="content" className="text-[11px] rounded-md py-1.5 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-slate-400">✏️ Text</TabsTrigger>
              <TabsTrigger value="button" className="text-[11px] rounded-md py-1.5 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-slate-400">🔘 Button</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Background Color</label>
                <div className="flex gap-2">
                  <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-12 h-9 p-1 bg-indigo-900/50 border border-indigo-500/30 cursor-pointer rounded-lg" />
                  <Input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 bg-indigo-950/50 border border-indigo-500/30 text-sm text-white placeholder-indigo-400/50 rounded-lg focus:border-cyan-400 transition-colors" />
                </div>
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                <div className="flex justify-between text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <span>Vertical Padding</span>
                  <span className="text-cyan-400 font-mono">{paddingVertical[0]}px</span>
                </div>
                <Slider min={12} max={100} step={1} value={paddingVertical} onValueChange={(val) => setPaddingVertical(val)} />
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-blue-950/30 border border-blue-500/20">
                <div className="flex justify-between text-xs font-bold text-blue-300 uppercase tracking-wider">
                  <span>Horizontal Padding</span>
                  <span className="text-blue-400 font-mono">{paddingHorizontal[0]}px</span>
                </div>
                <Slider min={12} max={80} step={1} value={paddingHorizontal} onValueChange={(val) => setPaddingHorizontal(val)} />
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/20">
                <div className="flex justify-between text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <span>Border Radius</span>
                  <span className="text-purple-400 font-mono">{borderRadius[0]}px</span>
                </div>
                <Slider min={0} max={32} step={1} value={borderRadius} onValueChange={(val) => setBorderRadius(val)} />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-5 mt-4 outline-none">
              <div className="space-y-3 p-3 rounded-lg bg-orange-950/30 border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-orange-300 uppercase tracking-wider">Include Banner Image</label>
                  <Switch checked={hasImage} onCheckedChange={setHasImage} />
                </div>
              </div>
              {hasImage && (
                <>
                  <div className="space-y-2 p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">Image URL</label>
                    <Input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-amber-950/50 border border-amber-500/30 text-xs text-white placeholder-amber-400/50 rounded-lg focus:border-orange-400 transition-colors" />
                  </div>
                  <div className="space-y-3 p-3 rounded-lg bg-yellow-950/30 border border-yellow-500/20">
                    <div className="flex justify-between text-xs font-bold text-yellow-300 uppercase tracking-wider">
                      <span>Image Height</span>
                      <span className="text-yellow-400 font-mono">{imageHeight[0]}px</span>
                    </div>
                    <Slider min={80} max={300} step={5} value={imageHeight} onValueChange={(val) => setImageHeight(val)} />
                  </div>
                  <div className="space-y-3 p-3 rounded-lg bg-orange-950/30 border border-orange-500/20">
                    <div className="flex justify-between text-xs font-bold text-orange-300 uppercase tracking-wider">
                      <span>Margin Below</span>
                      <span className="text-orange-400 font-mono">{imageMarginBottom[0]}px</span>
                    </div>
                    <Slider min={0} max={40} step={1} value={imageMarginBottom} onValueChange={(val) => setImageMarginBottom(val)} />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2 p-3 rounded-lg bg-rose-950/30 border border-rose-500/20">
                <label className="text-xs font-bold text-rose-300 uppercase tracking-wider">Headline</label>
                <Input type="text" value={titleText} onChange={(e) => setTitleText(e.target.value)} className="bg-rose-950/50 border border-rose-500/30 text-xs text-white placeholder-rose-400/50 rounded-lg focus:border-pink-400 transition-colors" />
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-pink-950/30 border border-pink-500/20">
                <label className="text-xs font-bold text-pink-300 uppercase tracking-wider">Title Color</label>
                <div className="flex gap-2">
                  <Input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-12 h-9 p-1 bg-pink-900/50 border border-pink-500/30 cursor-pointer rounded-lg" />
                  <Input type="text" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="flex-1 bg-pink-950/50 border border-pink-500/30 text-xs text-white placeholder-pink-400/50 rounded-lg focus:border-rose-400 transition-colors" />
                </div>
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-red-950/30 border border-red-500/20">
                <div className="flex justify-between text-xs font-bold text-red-300 uppercase tracking-wider">
                  <span>Title Size</span>
                  <span className="text-red-400 font-mono">{titleSize[0]}px</span>
                </div>
                <Slider min={16} max={48} step={1} value={titleSize} onValueChange={(val) => setTitleSize(val)} />
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent my-4" />
              <div className="space-y-2 p-3 rounded-lg bg-violet-950/30 border border-violet-500/20">
                <label className="text-xs font-bold text-violet-300 uppercase tracking-wider">Body Content</label>
                <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className="bg-violet-950/50 border border-violet-500/30 rounded-lg text-xs text-white p-2 w-full h-20 resize-none placeholder-violet-400/50 focus:border-purple-400 transition-colors" />
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-purple-950/30 border border-purple-500/20">
                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">Body Color</label>
                <div className="flex gap-2">
                  <Input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="w-12 h-9 p-1 bg-purple-900/50 border border-purple-500/30 cursor-pointer rounded-lg" />
                  <Input type="text" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="flex-1 bg-purple-950/50 border border-purple-500/30 text-xs text-white placeholder-purple-400/50 rounded-lg focus:border-violet-400 transition-colors" />
                </div>
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                <div className="flex justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <span>Body Size</span>
                  <span className="text-indigo-400 font-mono">{bodySize[0]}px</span>
                </div>
                <Slider min={12} max={24} step={1} value={bodySize} onValueChange={(val) => setBodySize(val)} />
              </div>
            </TabsContent>

            <TabsContent value="button" className="space-y-5 mt-4 outline-none">
              <div className="space-y-3 p-3 rounded-lg bg-lime-950/30 border border-lime-500/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-lime-300 uppercase tracking-wider">Include CTA Button</label>
                  <Switch checked={hasButton} onCheckedChange={setHasButton} />
                </div>
              </div>
              {hasButton && (
                <>
                  <div className="space-y-2 p-3 rounded-lg bg-green-950/30 border border-green-500/20">
                    <label className="text-xs font-bold text-green-300 uppercase tracking-wider">Button Label</label>
                    <Input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="bg-green-950/50 border border-green-500/30 text-xs text-white placeholder-green-400/50 rounded-lg focus:border-emerald-400 transition-colors" />
                  </div>
                  <div className="space-y-2 p-3 rounded-lg bg-teal-950/30 border border-teal-500/20">
                    <label className="text-xs font-bold text-teal-300 uppercase tracking-wider">Button Color</label>
                    <div className="flex gap-2">
                      <Input type="color" value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className="w-12 h-9 p-1 bg-teal-900/50 border border-teal-500/30 cursor-pointer rounded-lg" />
                      <Input type="text" value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className="flex-1 bg-teal-950/50 border border-teal-500/30 text-xs text-white placeholder-teal-400/50 rounded-lg focus:border-cyan-400 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                    <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Text Color</label>
                    <div className="flex gap-2">
                      <Input type="color" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-12 h-9 p-1 bg-cyan-900/50 border border-cyan-500/30 cursor-pointer rounded-lg" />
                      <Input type="text" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="flex-1 bg-cyan-950/50 border border-cyan-500/30 text-xs text-white placeholder-cyan-400/50 rounded-lg focus:border-blue-400 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-3 p-3 rounded-lg bg-sky-950/30 border border-sky-500/20">
                    <div className="flex justify-between text-xs font-bold text-sky-300 uppercase tracking-wider">
                      <span>Border Radius</span>
                      <span className="text-sky-400 font-mono">{buttonRadius[0]}px</span>
                    </div>
                    <Slider min={0} max={20} step={1} value={buttonRadius} onValueChange={(val) => setButtonRadius(val)} />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t border-indigo-700/30 shrink-0 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20">
          <Button onClick={handleCopyToClipboard} className="w-full text-xs h-9 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-lg">
            📥 Export HTML Code
          </Button>
        </div>
      </div>

      {/* LIVE PREVIEW PANE */}
      <div className="flex-1 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-8 overflow-auto">
        <div className="mx-auto bg-gradient-to-br from-white via-slate-50 to-blue-50 p-8 rounded-2xl shadow-2xl max-w-2xl border border-slate-200">
          <div style={{
            backgroundColor: backgroundColor,
            borderRadius: `${borderRadius[0]}px`,
            padding: `${paddingVertical[0]}px ${paddingHorizontal[0]}px`,
          }}>
            {hasImage && (
              <div style={{ marginBottom: `${imageMarginBottom[0]}px` }}>
                <img 
                  src={imageUrl} 
                  alt="Banner" 
                  style={{ 
                    width: "100%", 
                    height: `${imageHeight[0]}px`, 
                    objectFit: "cover",
                    borderRadius: "8px"
                  }} 
                />
              </div>
            )}
            <h1 style={{
              color: titleColor,
              fontSize: `${titleSize[0]}px`,
              fontWeight: 800,
              margin: "0 0 16px 0",
              lineHeight: "1.2",
              letterSpacing: "-0.02em"
            }}>
              {titleText}
            </h1>
            <p style={{
              color: bodyColor,
              fontSize: `${bodySize[0]}px`,
              fontWeight: 500,
              margin: "0 0 24px 0",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap"
            }}>
              {bodyText}
            </p>
            {hasButton && (
              <button style={{
                backgroundColor: buttonBg,
                color: buttonTextColor,
                padding: "14px 28px",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                borderRadius: `${buttonRadius[0]}px`,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
                letterSpacing: "0.5px"
              }}>
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
