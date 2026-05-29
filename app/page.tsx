"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EmailBuilderDashboard() {
  // Layout Controls State
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [paddingVertical, setPaddingVertical] = useState([40]);
  const [paddingHorizontal, setPaddingHorizontal] = useState([32]);
  const [borderRadius, setBorderRadius] = useState([8]);
  
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

  // The Magic Compiler Engine: Converts application state into clean, table-based raw inline HTML email code
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
      {/* LEFT HAND CONTROL PANEL SIDEBAR */}
      <div className="w-[420px] border-r border-zinc-800 bg-zinc-900 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-zinc-800 shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-white">Email Forge</h1>
          <p className="text-xs text-zinc-400 mt-1">Export pristine, agency-grade responsive layout elements.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-950 p-1 border border-zinc-800 rounded-md">
              <TabsTrigger value="layout" className="text-xs rounded-sm py-1.5">Layout</TabsTrigger>
              <TabsTrigger value="content" className="text-xs rounded-sm py-1.5">Typography</TabsTrigger>
              <TabsTrigger value="button" className="text-xs rounded-sm py-1.5">Action Button</TabsTrigger>
            </TabsList>

            {/* TAB SECTION: CANVAS & BACKGROUND CONSTRAINTS */}
            <TabsContent value="layout" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Container Background</label>
                <div className="flex gap-2">
                  <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-12 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                  <Input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 bg-zinc-950 border-zinc-800 text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Vertical Padding</span>
                  <span className="text-zinc-500">{paddingVertical}px</span>
                </div>
                <Slider min={[12]} max={[100]} step={1} value={paddingVertical} onValueChange={(val) => setPaddingVertical(val)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Horizontal Padding</span>
                  <span className="text-zinc-500">{paddingHorizontal}px</span>
                </div>
                <Slider min={[12]} max={[80]} step={1} value={paddingHorizontal} onValueChange={(val) => setPaddingHorizontal(val)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Border Radius</span>
                  <span className="text-zinc-500">{borderRadius}px</span>
                </div>
                <Slider min={[0]} max={[32]} step={1} value={borderRadius} onValueChange={(val) => setBorderRadius(val)} />
              </div>
            </TabsContent>

            {/* TAB SECTION: HEADER & TEXT COMPOSITION */}
            <TabsContent value="content" className="space-y-5 mt-4 outline-none">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Heading Text</label>
                <Input value={titleText} onChange={(e) => setTitleText(e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Header Color</label>
                  <div className="flex gap-1.5">
                    <Input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                    <Input type="text" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="bg-zinc-950 border-zinc-800 text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Font Size</span>
                  </div>
                  <Slider min={[18]} max={[48]} step={1} value={titleSize} onValueChange={(val) => setTitleSize(val)} className="pt-2" />
                </div>
              </div>

              <Separator className="bg-zinc-800 my-2" />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Body Paragraph Text</label>
                <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={4} className="w-full text-sm rounded-md bg-zinc-950 border border-zinc-800 p-3 resize-none focus:outline-none focus:border-zinc-700 text-zinc-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Text Color</label>
                  <div className="flex gap-1.5">
                    <Input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="w-8 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                    <Input type="text" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="bg-zinc-950 border-zinc-800 text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Font Size</span>
                  </div>
                  <Slider min={[12]} max={[24]} step={1} value={bodySize} onValueChange={(val) => setBodySize(val)} className="pt-2" />
                </div>
              </div>
            </TabsContent>

            {/* TAB SECTION: CALL TO ACTION STRATEGY */}
            <TabsContent value="button" className="space-y-5 mt-4 outline-none">
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                <span className="text-xs font-semibold text-zinc-300">Include Action Button</span>
                <Switch checked={hasButton} onCheckedChange={(val) => setHasButton(val)} />
              </div>

              {hasButton && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Button Label</label>
                    <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300">Button Fill</label>
                      <div className="flex gap-1.5">
                        <Input type="color" value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className="w-8 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                        <Input type="text" value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className="bg-zinc-950 border-zinc-800 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300">Text Color</label>
                      <div className="flex gap-1.5">
                        <Input type="color" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-8 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                        <Input type="text" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="bg-zinc-950 border-zinc-800 text-xs" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-300">
                      <span>Button Corner Smoothness</span>
                      <span className="text-zinc-500">{buttonRadius}px</span>
                    </div>
                    <Slider min={[0]} max={[24]} step={1} value={buttonRadius} onValueChange={(val) => setButtonRadius(val)} />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* CODE DELIVERY EXPORT PANEL ROW */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex gap-3 shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-900 bg-transparent">
                View Generated Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-50">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white">Production Email HTML</DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Copy this clean, table-architected markup paste it directly into Klaviyo, Mailchimp, or Resend code modules.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-zinc-950 p-4 rounded-md overflow-x-auto max-h-[380px] overflow-y-auto border border-zinc-800">
                <pre className="text-xs text-emerald-400 font-mono select-all whitespace-pre-wrap">{generateHTMLCode()}</pre>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleCopyToClipboard} className="bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold px-4 py-2">
                  Copy Output Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleCopyToClipboard} className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold">
            Copy Instant HTML
          </Button>
        </div>
      </div>

      {/* RIGHT HAND CONTENT PREVIEW CANVAS CANVAS AREA */}
      <div className="flex-1 bg-zinc-950 flex flex-col h-full overflow-hidden">
        <div className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0 bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400">Active Live Responsive Canvas</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-12 flex items-center justify-center bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]">
          <div 
            style={{ 
              backgroundColor: backgroundColor, 
              borderRadius: `${borderRadius[0]}px`,
              paddingTop: `${paddingVertical[0]}px`,
              paddingBottom: `${paddingVertical[0]}px`,
              paddingLeft: `${paddingHorizontal[0]}px`,
              paddingRight: `${paddingHorizontal[0]}px`,
              transition: "all 0.1s ease-out"
            }} 
            className="w-full max-w-[600px] shadow-2xl overflow-hidden border border-zinc-800/10"
          >
            <h1 
              style={{ 
                color: titleColor, 
                fontSize: `${titleSize[0]}px`,
              }} 
              className="font-bold tracking-tight mb-4 leading-tight break-words"
            >
              {titleText || " "}
            </h1>
            
            <p 
              style={{ 
                color: bodyColor, 
                fontSize: `${bodySize[0]}px`,
              }} 
              className="leading-relaxed mb-6 whitespace-pre-wrap break-words"
            >
              {bodyText || " "}
            </p>

            {hasButton && (
              <div className="w-full flex">
                <button
                  style={{
                    backgroundColor: buttonBg,
                    color: buttonTextColor,
                    borderRadius: `${buttonRadius[0]}px`
                  }}
                  className="px-6 py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
                >
                  {buttonText || " "}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}