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
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50">
      {/* LEFT CONTROL PANEL SIDEBAR */}
      <div className="w-[420px] border-r border-zinc-800 bg-zinc-900 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-zinc-800 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Email Forge</h1>
            <p className="text-xs text-zinc-400 mt-1">Export pristine responsive elements.</p>
          </div>
          {user && (
            <Button onClick={handleLogout} variant="ghost" className="text-xs text-zinc-400 hover:text-white px-2 h-7 bg-transparent">
              Logout
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!user ? (
            <Card className="bg-zinc-950 border-zinc-800 text-white">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">Cloud Preset Backup</CardTitle>
                <CardDescription className="text-xs text-zinc-400">Sign up or login to securely store your configurations.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Input type="email" placeholder="Agency Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => handleAuth("login")} className="flex-1 text-xs h-8 bg-zinc-800 hover:bg-zinc-700 text-white">Log In</Button>
                  <Button onClick={() => handleAuth("signup")} className="flex-1 text-xs h-8 bg-white text-zinc-950 hover:bg-zinc-200">Sign Up</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-zinc-950 border-emerald-900/40 text-white">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold text-emerald-400">Account Connected</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Layout Name</label>
                    <Input type="text" placeholder="Layout Name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
                  </div>
                  <Button onClick={handleSaveTemplate} disabled={isSaving} className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold mt-2">
                    {isSaving ? "Saving Config Row..." : "Sync Layout to Cloud"}
                  </Button>
                </CardContent>
              </Card>

              {savedTemplates.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-1">Your Cloud History ({savedTemplates.length})</h3>
                  <div className="max-h-[120px] overflow-y-auto border border-zinc-800 rounded-md bg-zinc-950 divide-y divide-zinc-900">
                    {savedTemplates.map((tpl) => (
                      <div 
                        key={tpl.id} 
                        onClick={() => loadTemplateConfig(tpl)}
                        className="p-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900/60 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex flex-col min-w-0 flex-1 pr-2">
                          <span className="font-medium truncate max-w-[200px]">{tpl.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {new Date(tpl.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-800/80 transition duration-150 opacity-0 group-hover:opacity-100 shrink-0"
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
            <TabsList className="grid w-full grid-cols-4 bg-zinc-950 p-1 border border-zinc-800 rounded-md">
              <TabsTrigger value="layout" className="text-[11px] rounded-sm py-1.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Layout</TabsTrigger>
              <TabsTrigger value="image" className="text-[11px] rounded-sm py-1.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Banner</TabsTrigger>
              <TabsTrigger value="content" className="text-[11px] rounded-sm py-1.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Text</TabsTrigger>
              <TabsTrigger value="button" className="text-[11px] rounded-sm py-1.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Button</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Container Background</label>
                <div className="flex gap-2">
                  <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-12 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                  <Input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 bg-zinc-950 border-zinc-800 text-sm text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Vertical Padding</span>
                  <span className="text-zinc-500">{paddingVertical[0]}px</span>
                </div>
                <Slider min={12} max={100} step={1} value={paddingVertical} onValueChange={(val) => setPaddingVertical(val)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Horizontal Padding</span>
                  <span className="text-zinc-500">{paddingHorizontal[0]}px</span>
                </div>
                <Slider min={12} max={80} step={1} value={paddingHorizontal} onValueChange={(val) => setPaddingHorizontal(val)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Border Radius</span>
                  <span className="text-zinc-500">{borderRadius[0]}px</span>
                </div>
                <Slider min={0} max={32} step={1} value={borderRadius} onValueChange={(val) => setBorderRadius(val)} />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Show Banner Image</label>
                  <Switch checked={hasImage} onCheckedChange={setHasImage} />
                </div>
              </div>
              {hasImage && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Image URL</label>
                    <Input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-300">
                      <span>Image Height</span>
                      <span className="text-zinc-500">{imageHeight[0]}px</span>
                    </div>
                    <Slider min={80} max={300} step={5} value={imageHeight} onValueChange={(val) => setImageHeight(val)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-300">
                      <span>Margin Below Image</span>
                      <span className="text-zinc-500">{imageMarginBottom[0]}px</span>
                    </div>
                    <Slider min={0} max={40} step={1} value={imageMarginBottom} onValueChange={(val) => setImageMarginBottom(val)} />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Title Text</label>
                <Input type="text" value={titleText} onChange={(e) => setTitleText(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Title Color</label>
                <div className="flex gap-2">
                  <Input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-12 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                  <Input type="text" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="flex-1 bg-zinc-900 border-zinc-800 text-xs text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Title Size</span>
                  <span className="text-zinc-500">{titleSize[0]}px</span>
                </div>
                <Slider min={16} max={48} step={1} value={titleSize} onValueChange={(val) => setTitleSize(val)} />
              </div>
              <Separator className="bg-zinc-800 my-4" />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Body Text</label>
                <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded text-xs text-white p-2 w-full h-20 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Body Color</label>
                <div className="flex gap-2">
                  <Input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="w-12 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                  <Input type="text" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="flex-1 bg-zinc-900 border-zinc-800 text-xs text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Body Text Size</span>
                  <span className="text-zinc-500">{bodySize[0]}px</span>
                </div>
                <Slider min={12} max={24} step={1} value={bodySize} onValueChange={(val) => setBodySize(val)} />
              </div>
            </TabsContent>

            <TabsContent value="button" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Show Button</label>
                  <Switch checked={hasButton} onCheckedChange={setHasButton} />
                </div>
              </div>
              {hasButton && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Button Text</label>
                    <Input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Button Background</label>
                    <div className="flex gap-2">
                      <Input type="color" value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className="w-12 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                      <Input type="text" value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className="flex-1 bg-zinc-900 border-zinc-800 text-xs text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Button Text Color</label>
                    <div className="flex gap-2">
                      <Input type="color" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-12 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                      <Input type="text" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="flex-1 bg-zinc-900 border-zinc-800 text-xs text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-300">
                      <span>Button Border Radius</span>
                      <span className="text-zinc-500">{buttonRadius[0]}px</span>
                    </div>
                    <Slider min={0} max={20} step={1} value={buttonRadius} onValueChange={(val) => setButtonRadius(val)} />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t border-zinc-800 shrink-0">
          <Button onClick={handleCopyToClipboard} className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
            Export HTML Code
          </Button>
        </div>
      </div>

      {/* LIVE PREVIEW PANE */}
      <div className="flex-1 bg-zinc-900 p-8 overflow-auto">
        <div className="mx-auto bg-gray-100 p-4 rounded-lg shadow-lg max-w-2xl">
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
                    borderRadius: "4px"
                  }} 
                />
              </div>
            )}
            <h1 style={{
              color: titleColor,
              fontSize: `${titleSize[0]}px`,
              fontWeight: 700,
              margin: "0 0 16px 0",
              lineHeight: "1.2"
            }}>
              {titleText}
            </h1>
            <p style={{
              color: bodyColor,
              fontSize: `${bodySize[0]}px`,
              fontWeight: 400,
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
                padding: "12px 24px",
                fontSize: "15px",
                fontWeight: 600,
                border: "none",
                borderRadius: `${buttonRadius[0]}px`,
                cursor: "pointer"
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
