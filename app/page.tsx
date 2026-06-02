"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Type, 
  LogOut, 
  Cloud, 
  History, 
  Trash2, 
  Download,
  CheckCircle2,
  Settings2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Clock,
  Image as ImageIcon,
  Heading1,
  AlignLeft,
  MousePointerClick,
  Minus,
  Layers as LayersIcon,
  Monitor,
  Smartphone
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { EmailBlock, EmailBlockType } from "@/types/email";
import { sanitizeBlocks } from "@/lib/sanitization";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Constants
const STORAGE_KEY = "emailBuilder_draft";

// Color Palette
const colors = {
  offwhite: "#F5F3F0",
  offwhite2: "#FAF8F6",
  grey: "#8B8B8B",
  greyLight: "#D4D4D4",
  greyDark: "#6B6B6B",
  black: "#000000",
  brown: "#8B6F47",
  brownLight: "#A89968",
};

const defaultBlocks: EmailBlock[] = [
  {
    id: "block-hero",
    type: "hero_image",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    },
    style: {
      height: [200],
      marginBottom: [24],
    },
  },
  {
    id: "block-heading",
    type: "heading",
    content: {
      text: "Elevate Your Brand",
    },
    style: {
      color: "#000000",
      fontSize: [32],
    },
  },
  {
    id: "block-body",
    type: "body_text",
    content: {
      text: "Craft compelling narratives with our professional email builder. Designed for impact, engineered for performance, and optimized for every device.",
    },
    style: {
      color: "#444444",
      fontSize: [16],
    },
  },
  {
    id: "block-cta",
    type: "cta_button",
    content: {
      text: "Get Started",
      url: "#",
    },
    style: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      borderRadius: [6],
    },
  },
];

export default function EmailBuilderDashboard() {
  // Authentication & Cloud Sync State
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [templateName, setTemplateName] = useState("Brand Blueprint");
  const [isSaving, setIsSaving] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string; name: string; created_at: string; config: Record<string, unknown> }>>([]);

  // Layout Controls State
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [paddingVertical, setPaddingVertical] = useState([40]);
  const [paddingHorizontal, setPaddingHorizontal] = useState([32]);
  const [borderRadius, setBorderRadius] = useState([12]);
  
  // Image Banner State
  const [hasImage, setHasImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop");
  const [imageHeight, setImageHeight] = useState([200]);
  const [imageMarginBottom, setImageMarginBottom] = useState([24]);

  // Content State
  const [titleText, setTitleText] = useState("Elevate Your Brand");
  const [titleColor, setTitleColor] = useState("#000000");
  const [titleSize, setTitleSize] = useState([32]);
  const [bodyText, setBodyText] = useState("Craft compelling narratives with our professional email builder. Designed for impact, engineered for performance, and optimized for every device.");
  const [bodyColor, setBodyColor] = useState("#444444");
  const [bodySize, setBodySize] = useState([16]);
  
  // Button State
  const [hasButton, setHasButton] = useState(true);
  const [buttonText, setButtonText] = useState("Get Started");
  const [buttonBg, setButtonBg] = useState("#000000");
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff");
  const [buttonRadius, setButtonRadius] = useState([6]);

  // Modular State
  const [emailBlocks, setEmailBlocks] = useState<EmailBlock[]>(defaultBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const isIgnoreDirty = React.useRef(true);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Persistence State
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState<{
    config: Record<string, unknown>;
    timestamp: string;
  } | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    if (isIgnoreDirty.current || !isDirty) return;

    const timer = setTimeout(() => {
      const currentConfig = {
        backgroundColor, paddingVertical, paddingHorizontal, borderRadius,
        hasImage, imageUrl, imageHeight, imageMarginBottom,
        titleText, titleColor, titleSize, bodyText, bodyColor, bodySize,
        hasButton, buttonText, buttonBg, buttonTextColor, buttonRadius,
        emailBlocks,
        templateName
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        config: currentConfig,
        timestamp: new Date().toISOString()
      }));
      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    emailBlocks, backgroundColor, paddingVertical, paddingHorizontal, borderRadius,
    hasImage, imageUrl, imageHeight, imageMarginBottom,
    titleText, titleColor, titleSize, bodyText, bodyColor, bodySize,
    hasButton, buttonText, buttonBg, buttonTextColor, buttonRadius,
    templateName, isDirty
  ]);

  // Session recovery check on mount
  useEffect(() => {
    const draftJson = localStorage.getItem(STORAGE_KEY);
    if (draftJson) {
      try {
        const draft = JSON.parse(draftJson);
        if (draft && draft.config && draft.config.emailBlocks) {
          // Check if current state is clean/default
          const isClean = emailBlocks.length === defaultBlocks.length && 
                          emailBlocks.every((b, i) => b.id === defaultBlocks[i].id) &&
                          backgroundColor === "#ffffff" &&
                          templateName === "Brand Blueprint";

          if (isClean) {
            // Wrap in setTimeout to avoid synchronous setState in effect (lint)
            setTimeout(() => {
              setRecoveredDraft(draft);
              setShowRecoveryDialog(true);
            }, 0);
          }
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []); // Run once on mount

  const handleRestoreDraft = () => {
    if (!recoveredDraft) return;
    loadTemplateConfig({
      name: (recoveredDraft.config.templateName as string) || "Restored Draft",
      config: recoveredDraft.config
    });
    setShowRecoveryDialog(false);
    setLastSaved(new Date(recoveredDraft.timestamp));
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowRecoveryDialog(false);
    setRecoveredDraft(null);
    setLastSaved(null);
  };

  // Mark dirty on any config change
  useEffect(() => {
    if (isIgnoreDirty.current) {
      isIgnoreDirty.current = false;
      return;
    }
    setIsDirty(true);
  }, [
    emailBlocks, backgroundColor, paddingVertical, paddingHorizontal, borderRadius,
    hasImage, imageUrl, imageHeight, imageMarginBottom,
    titleText, titleColor, titleSize, bodyText, bodyColor, bodySize,
    hasButton, buttonText, buttonBg, buttonTextColor, buttonRadius,
    templateName
  ]);

  // Browser guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Clean up stale selectedBlockId
  useEffect(() => {
    if (selectedBlockId && !emailBlocks.some(b => b.id === selectedBlockId)) {
      setTimeout(() => setSelectedBlockId(null), 0);
    }
  }, [emailBlocks, selectedBlockId]);

  const addBlock = (type: EmailBlockType) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      content: {},
      style: {},
    };

    // Set default content/style based on type
    switch (type) {
      case "heading":
        newBlock.content = { text: "New Heading" };
        newBlock.style = { color: "#000000", fontSize: [24] };
        break;
      case "body_text":
        newBlock.content = { text: "Add your text here..." };
        newBlock.style = { color: "#444444", fontSize: [16] };
        break;
      case "divider":
        newBlock.content = {};
        newBlock.style = { marginTop: [20], marginBottom: [20], color: "#e5e7eb" };
        break;
      case "cta_button":
        newBlock.content = { text: "Click Me", url: "#" };
        newBlock.style = { backgroundColor: "#000000", textColor: "#ffffff", borderRadius: [6] };
        break;
      case "hero_image":
        newBlock.content = { imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" };
        newBlock.style = { height: [200], marginBottom: [24] };
        break;
    }

    setEmailBlocks([...emailBlocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = emailBlocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= emailBlocks.length) return;

    const newBlocks = [...emailBlocks];
    const [removed] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, removed);
    setEmailBlocks(newBlocks);
  };

  const removeBlock = (id: string) => {
    if (emailBlocks.length <= 1) return;
    setEmailBlocks(emailBlocks.filter((b) => b.id !== id));
  };

  const fetchSavedTemplates = async () => {
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchSavedTemplates();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSavedTemplates();
      } else {
        setSavedTemplates([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (type: "login" | "signup") => {
    if (!email || !password) return alert("Please fill out your credentials.");
    
    if (type === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
      } else if (data?.user && data?.session === null) {
        alert("Account registered! Please check your email or log in directly.");
      } else {
        alert("Account successfully registered and logged in!");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      } else {
        setUser(data.user);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveTemplate = async () => {
    if (!user) return alert("You must be logged in to sync configs to the cloud.");
    setIsSaving(true);

    const currentConfig = {
      backgroundColor, paddingVertical, paddingHorizontal, borderRadius,
      hasImage, imageUrl, imageHeight, imageMarginBottom,
      titleText, titleColor, titleSize, bodyText, bodyColor, bodySize,
      hasButton, buttonText, buttonBg, buttonTextColor, buttonRadius,
      emailBlocks // Added modular state
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
      setIsDirty(false); // Reset dirty state on success
      localStorage.removeItem(STORAGE_KEY); // Clear draft on manual save
      setLastSaved(null);
      fetchSavedTemplates();
    }
  };

  const loadTemplateConfig = (template: Record<string, unknown>) => {
    const cfg = template.config as Record<string, unknown>;
    if (!cfg) return;

    // Prevent isDirty from triggering during load
    isIgnoreDirty.current = true;
    setIsDirty(false);

    setBackgroundColor((cfg.backgroundColor as string) || "#ffffff");
    setPaddingVertical((cfg.paddingVertical as number[]) || [40]);
    setPaddingHorizontal((cfg.paddingHorizontal as number[]) || [32]);
    setBorderRadius((cfg.borderRadius as number[]) || [12]);
    
    setHasImage(cfg.hasImage !== undefined ? (cfg.hasImage as boolean) : false);
    setImageUrl((cfg.imageUrl as string) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop");
    setImageHeight((cfg.imageHeight as number[]) || [200]);
    setImageMarginBottom((cfg.imageMarginBottom as number[]) || [24]);

    setTitleText((cfg.titleText as string) || "");
    setTitleColor((cfg.titleColor as string) || "#000000");
    setTitleSize((cfg.titleSize as number[]) || [32]);
    setBodyText((cfg.bodyText as string) || "");
    setBodyColor((cfg.bodyColor as string) || "#444444");
    setBodySize((cfg.bodySize as number[]) || [16]);
    setHasButton(cfg.hasButton !== undefined ? (cfg.hasButton as boolean) : true);
    setButtonText((cfg.buttonText as string) || "");
    setButtonBg((cfg.buttonBg as string) || "#000000");
    setButtonTextColor((cfg.buttonTextColor as string) || "#ffffff");
    setButtonRadius((cfg.buttonRadius as number[]) || [6]);
    setTemplateName(template.name as string);

    // Load and sanitize modular blocks
    if (cfg.emailBlocks) {
      const sanitized = sanitizeBlocks(cfg.emailBlocks);
      setEmailBlocks(sanitized);
    }

    // Overwrite localStorage draft with the newly loaded template
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      config: cfg,
      timestamp: new Date().toISOString()
    }));
    setLastSaved(new Date());
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this template permanently?")) return;

    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      alert(`Failed: ${error.message}`);
    } else {
      fetchSavedTemplates();
    }
  };

  const compileBlock = (block: EmailBlock) => {
    switch (block.type) {
      case "hero_image":
        return `
          <tr>
            <td align="center" style="padding-bottom: ${block.style.marginBottom?.[0] || 24}px;">
              <img src="${block.content.imageUrl}" alt="Banner" width="600" height="${block.style.height?.[0] || 200}" border="0" style="display: block; width: 100%; max-width: 600px; height: auto; border-radius: 8px;" />
            </td>
          </tr>`;
      case "heading":
        return `
          <tr>
            <td align="left" style="padding-bottom: 16px; font-family: sans-serif;">
              <h1 style="margin: 0; font-size: ${block.style.fontSize?.[0] || 32}px; line-height: 1.2; font-weight: 800; color: ${block.style.color || '#000000'}; letter-spacing: -0.02em;">
                ${block.content.text}
              </h1>
            </td>
          </tr>`;
      case "body_text":
        return `
          <tr>
            <td align="left" style="padding-bottom: 24px; font-family: sans-serif;">
              <p style="margin: 0; font-size: ${block.style.fontSize?.[0] || 16}px; line-height: 1.6; font-weight: 400; color: ${block.style.color || '#444444'};">
                ${block.content.text}
              </p>
            </td>
          </tr>`;
      case "divider":
        return `
          <tr>
            <td align="center" style="padding-top: ${block.style.marginTop?.[0] || 20}px; padding-bottom: ${block.style.marginBottom?.[0] || 20}px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                <tr>
                  <td style="border-bottom: 1px solid ${block.style.color || '#e5e7eb'}; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>`;
      case "cta_button":
        const btnBg = block.style.backgroundColor || "#000000";
        const btnText = block.content.text || "Click Here";
        const btnUrl = block.content.url || "#";
        const btnRadius = block.style.borderRadius?.[0] || 6;
        const btnColor = block.style.textColor || "#ffffff";
        
        return `
          <tr>
            <td align="left" style="padding-top: 16px; padding-bottom: 16px;">
              <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${btnUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="${Math.round((btnRadius/48)*100)}%" stroke="f" fillcolor="${btnBg}">
                  <w:anchorlock/>
                  <center style="color:${btnColor};font-family:sans-serif;font-size:16px;font-weight:bold;">${btnText}</center>
                </v:roundrect>
              <![endif]-->
              <a href="${btnUrl}" style="background-color:${btnBg};border-radius:${btnRadius}px;color:${btnColor};display:inline-block;font-family:sans-serif;font-size:16px;font-weight:bold;line-height:48px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;">${btnText}</a>
            </td>
          </tr>`;
      default:
        return "";
    }
  };

  const generateHTMLCode = () => {
    const compiledBlocks = emailBlocks.map(block => compileBlock(block)).join("");

    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <title>Modular Email Template</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f8f9fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <!--[if mso]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" role="presentation">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="max-width: 600px; background-color: ${backgroundColor}; border-radius: ${borderRadius[0]}px; border-collapse: separate; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: ${paddingVertical[0]}px ${paddingHorizontal[0]}px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                ${compiledBlocks}
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateHTMLCode());
    alert("HTML code copied to clipboard!");
  };

  const renderBlock = (block: EmailBlock) => {
    const isSelected = selectedBlockId === block.id;
    const selectionStyle: React.CSSProperties = {
      outline: isSelected ? `2px solid #3b82f6` : "none",
      outlineOffset: "4px",
      cursor: "pointer",
      position: "relative",
    };

    const onClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedBlockId(block.id);
    };

    switch (block.type) {
      case "hero_image":
        return (
          <div
            key={block.id} 
            onClick={onClick}
            style={{ ...selectionStyle, marginBottom: `${block.style.marginBottom?.[0] ?? 24}px` }} 
            className="animate-in fade-in slide-in-from-top duration-1000 ease-out group"
          >
            <img 
              src={block.content.imageUrl} 
              alt="Hero" 
              style={{ 
                width: "100%", 
                height: `${block.style.height?.[0] ?? 200}px`,
                objectFit: "cover",
                borderRadius: "12px"
              }} 
              className="shadow-md transition-transform duration-500"
            />
          </div>
        );
      case "heading":
        return (
          <h1 
            key={block.id} 
            onClick={onClick}
            style={{
              ...selectionStyle,
              color: block.style.color,
              fontSize: `${block.style.fontSize?.[0] ?? 32}px`,
              fontWeight: 800,
              margin: 0,
              lineHeight: "1.1",
              letterSpacing: "-0.03em",
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              fontFamily: "'Poppins', 'Inter', system-ui"
            }}
          >
            {block.content.text}
          </h1>
        );
      case "body_text":
        return (
          <p 
            key={block.id} 
            onClick={onClick}
            style={{
              ...selectionStyle,
              color: block.style.color,
              fontSize: `${block.style.fontSize?.[0] ?? 16}px`,
              fontWeight: 400,
              margin: 0,
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              fontFamily: "'Inter', system-ui"
            }}
          >
            {block.content.text}
          </p>
        );
      case "divider":
        return (
          <div 
            key={block.id} 
            onClick={onClick}
            style={{ 
              ...selectionStyle,
              marginTop: `${block.style.marginTop?.[0] ?? 16}px`, 
              marginBottom: `${block.style.marginBottom?.[0] ?? 16}px`,
              height: "1px",
              backgroundColor: block.style.color
            }} 
          />
        );
      case "cta_button":
        return (
          <div key={block.id} onClick={onClick} style={{ ...selectionStyle, marginTop: "32px" }} className="flex justify-start animate-in fade-in duration-700">
            <button style={{
              backgroundColor: block.style.backgroundColor,
              color: block.style.textColor,
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: 600,
              border: "none",
              borderRadius: `${block.style.borderRadius?.[0] ?? 8}px`,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              fontFamily: "'Inter', system-ui"
            }}
            className="hover:shadow-lg active:scale-95"
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {block.content.text}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-['Inter',_'Poppins',_system-ui,_-apple-system] text-[#000000] animate-in fade-in duration-1000" style={{ backgroundColor: colors.offwhite2 }}>
      {/* SIDEBAR */}
      <div className="w-[400px] border-r shadow-2xl flex flex-col h-full shrink-0 z-10 transition-all duration-500" style={{ 
        backgroundColor: colors.offwhite,
        borderColor: colors.greyLight,
        backdropFilter: "blur(8px)"
      }}>
        <div className="p-8 border-b flex items-center justify-between transition-all duration-300" style={{ 
          borderColor: colors.greyLight,
          backgroundColor: `rgba(255, 255, 255, 0.4)`
        }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ backgroundColor: colors.black }}>
              <div className="w-3 h-3 rotate-45 transition-transform" style={{ backgroundColor: colors.offwhite }} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight transition-colors" style={{ color: colors.black }}>Email Forge</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: colors.grey }}>Studio Edition</p>
            </div>
          </div>
          {user && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout} 
              className="transition-all duration-300 hover:scale-110 active:scale-95"
              style={{ color: colors.grey }}
            >
              <LogOut size={18} />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
          {!user ? (
            <div className="space-y-4 animate-in slide-in-from-top duration-700 ease-out">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold flex items-center gap-2 transition-colors" style={{ color: colors.black }}>
                  <Cloud size={16} style={{ color: colors.grey }} />
                  Cloud Storage
                </h3>
                <p className="text-xs transition-colors" style={{ color: colors.grey }}>Save and sync your templates across devices.</p>
              </div>
              <div className="space-y-3">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm h-10 border transition-all duration-300 focus:ring-2 focus:ring-offset-0" style={{ 
                  backgroundColor: colors.offwhite2,
                  borderColor: colors.greyLight,
                  color: colors.black
                }} />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-sm h-10 border transition-all duration-300 focus:ring-2 focus:ring-offset-0" style={{ 
                  backgroundColor: colors.offwhite2,
                  borderColor: colors.greyLight,
                  color: colors.black
                }} />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button onClick={() => handleAuth("login")} className="text-white text-xs h-10 font-bold transition-all duration-300 active:scale-95 hover:shadow-lg" style={{ backgroundColor: colors.black }}>Log In</Button>
                  <Button onClick={() => handleAuth("signup")} variant="outline" className="text-xs h-10 font-bold transition-all duration-300 active:scale-95 hover:shadow-md" style={{ 
                    borderColor: colors.greyLight,
                    color: colors.grey
                  }}>Sign Up</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-top duration-700 ease-out">
              <div className="p-4 rounded-xl border space-y-3 transition-all duration-300 shadow-sm" style={{ 
                backgroundColor: colors.offwhite2,
                borderColor: colors.greyLight
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} style={{ color: colors.brown }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: colors.grey }}>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {lastSaved && (
                      <div className="flex items-center gap-1 opacity-60">
                        <Clock size={10} style={{ color: colors.grey }} />
                        <span className="text-[9px] font-bold uppercase tracking-tighter transition-colors" style={{ color: colors.grey }}>
                          Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {isDirty && (
                      <div className="flex items-center gap-1 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter">Unsaved</span>
                      </div>
                    )}
                  </div>
                </div>
                <Input 
                  type="text" 
                  value={templateName} 
                  onChange={(e) => setTemplateName(e.target.value)} 
                  className="text-sm h-9 border transition-all duration-300" 
                  placeholder="Template Name"
                  style={{ 
                    backgroundColor: colors.offwhite,
                    borderColor: colors.greyLight,
                    color: colors.black
                  }}
                />
                <Button 
                  onClick={handleSaveTemplate} 
                  disabled={isSaving} 
                  className="w-full text-white text-xs h-9 font-bold transition-all duration-300 disabled:opacity-50 hover:shadow-md active:scale-95"
                  style={{ backgroundColor: colors.black }}
                >
                  {isSaving ? "Syncing..." : "Save Template"}
                </Button>
              </div>

              {savedTemplates.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors" style={{ color: colors.grey }}>
                    <History size={12} />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide">
                    {savedTemplates.map((tpl) => (
                      <div 
                        key={tpl.id} 
                        onClick={() => {
                          if (isDirty && !confirm("You have unsaved changes. Load anyway?")) return;
                          loadTemplateConfig(tpl);
                        }}
                        className="group p-3 rounded-lg border cursor-pointer transition-all duration-300 flex items-center justify-between hover:shadow-md"
                        style={{ 
                          backgroundColor: colors.offwhite,
                          borderColor: colors.greyLight
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold transition-colors" style={{ color: colors.black }}>{tpl.name}</p>
                          <p className="text-[10px] mt-0.5 transition-colors" style={{ color: colors.grey }}>{new Date(tpl.created_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 transition-all duration-300 hover:scale-110"
                          style={{ color: colors.grey }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator style={{ backgroundColor: colors.greyLight }} />

          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid grid-cols-2 p-1 rounded-xl mb-6">
              <TabsTrigger value="layout" className="rounded-lg p-2 flex items-center gap-2">
                <Settings2 size={18} />
                <span className="text-xs">Canvas</span>
              </TabsTrigger>
              <TabsTrigger value="blocks" className="rounded-lg p-2 flex items-center gap-2">
                <Type size={18} />
                <span className="text-xs">Blocks</span>
              </TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <TabsContent value="layout" className="space-y-6 animate-in fade-in duration-500 ease-out outline-none">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Canvas Color</label>
                    <span className="text-[10px] font-mono" style={{ color: colors.grey }}>{backgroundColor}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 p-0 border-0 cursor-pointer rounded-lg overflow-hidden transition-transform hover:scale-110" />
                    <Input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 text-sm h-10 border transition-all duration-300" style={{ 
                      backgroundColor: colors.offwhite2,
                      borderColor: colors.greyLight,
                      color: colors.black
                    }} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Vertical Space</label>
                    <span className="text-[10px] font-mono" style={{ color: colors.grey }}>{paddingVertical[0]}px</span>
                  </div>
                  <Slider min={12} max={100} step={1} value={paddingVertical} onValueChange={setPaddingVertical} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Horizontal Space</label>
                    <span className="text-[10px] font-mono" style={{ color: colors.grey }}>{paddingHorizontal[0]}px</span>
                  </div>
                  <Slider min={12} max={80} step={1} value={paddingHorizontal} onValueChange={setPaddingHorizontal} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Corner Radius</label>
                    <span className="text-[10px] font-mono" style={{ color: colors.grey }}>{borderRadius[0]}px</span>
                  </div>
                  <Slider min={0} max={40} step={1} value={borderRadius} onValueChange={setBorderRadius} />
                </div>
              </TabsContent>

              <TabsContent value="blocks" className="space-y-6 animate-in fade-in duration-500 ease-out outline-none">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: colors.grey }}>
                      <LayersIcon size={12} />
                      LAYERS · {emailBlocks.length}
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {emailBlocks.map((block, index) => {
                      const isSelected = selectedBlockId === block.id;
                      const blockTypeLabel = block.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                      
                      let previewText = "";
                      if (block.type === 'hero_image') previewText = block.content.imageUrl || "";
                      else if (block.type === 'cta_button') previewText = block.content.text || "";
                      else if (block.content.text) previewText = block.content.text;

                      return (
                        <div 
                          key={block.id}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between group ${isSelected ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-stone-100 hover:border-stone-200'}`}
                          style={{ 
                            borderLeftWidth: isSelected ? '4px' : '1px',
                            borderLeftColor: isSelected ? '#3b82f6' : undefined
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`${isSelected ? 'text-blue-500' : 'text-stone-400'}`}>
                              {block.type === 'hero_image' && <ImageIcon size={14} />}
                              {block.type === 'heading' && <Heading1 size={14} />}
                              {block.type === 'body_text' && <AlignLeft size={14} />}
                              {block.type === 'cta_button' && <MousePointerClick size={14} />}
                              {block.type === 'divider' && <Minus size={14} />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[11px] font-bold ${isSelected ? 'text-blue-900' : 'text-stone-700'}`}>{blockTypeLabel}</p>
                              <p className="text-[9px] text-stone-400 truncate max-w-[120px]">{previewText}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                              disabled={index === 0}
                              aria-label="Move block up"
                              className="p-1 text-stone-400 hover:text-blue-500 disabled:opacity-0 transition-colors"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                              disabled={index === emailBlocks.length - 1}
                              aria-label="Move block down"
                              className="p-1 text-stone-400 hover:text-blue-500 disabled:opacity-0 transition-colors"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                              disabled={emailBlocks.length === 1}
                              aria-label="Delete block"
                              className="p-1 text-stone-400 hover:text-red-500 disabled:opacity-20 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t" style={{ borderColor: colors.greyLight }}>
                    <Button variant="outline" size="sm" onClick={() => addBlock('heading')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Heading</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('body_text')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Paragraph</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('hero_image')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Image</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('cta_button')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Button</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('divider')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Divider</Button>
                  </div>
                </div>

                {selectedBlockId && (
                  <div className="space-y-6 pt-6 border-t animate-in slide-in-from-bottom duration-500" style={{ borderColor: colors.greyLight }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.brown }}>Editing: {emailBlocks.find(b => b.id === selectedBlockId)?.type.replace('_', ' ')}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedBlockId(null)} className="h-6 text-[10px]">Close</Button>
                    </div>

                    {emailBlocks.find(b => b.id === selectedBlockId)?.content.text !== undefined && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Text Content</label>
                        {emailBlocks.find(b => b.id === selectedBlockId)?.type === 'body_text' ? (
                          <textarea 
                            value={emailBlocks.find(b => b.id === selectedBlockId)?.content.text}
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              newBlocks[idx].content.text = e.target.value;
                              setEmailBlocks(newBlocks);
                            }}
                            className="w-full h-24 p-2 text-xs border rounded-lg resize-none focus:outline-none focus:ring-1"
                            style={{ backgroundColor: colors.offwhite, borderColor: colors.greyLight }}
                          />
                        ) : (
                          <Input 
                            value={emailBlocks.find(b => b.id === selectedBlockId)?.content.text}
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              newBlocks[idx].content.text = e.target.value;
                              setEmailBlocks(newBlocks);
                            }}
                            className="text-xs h-8"
                          />
                        )}
                      </div>
                    )}

                    {emailBlocks.find(b => b.id === selectedBlockId)?.style.fontSize && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Font Size</label>
                          <span className="text-[10px] font-mono">{emailBlocks.find(b => b.id === selectedBlockId)?.style.fontSize?.[0]}px</span>
                        </div>
                        <Slider 
                          min={12} max={64} step={1} 
                          value={emailBlocks.find(b => b.id === selectedBlockId)?.style.fontSize}
                          onValueChange={(val) => {
                            const newBlocks = [...emailBlocks];
                            const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                            newBlocks[idx].style.fontSize = val;
                            setEmailBlocks(newBlocks);
                          }}
                        />
                      </div>
                    )}

                    {emailBlocks.find(b => b.id === selectedBlockId)?.style.color && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Color</label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            value={emailBlocks.find(b => b.id === selectedBlockId)?.style.color}
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              newBlocks[idx].style.color = e.target.value;
                              setEmailBlocks(newBlocks);
                            }}
                            className="w-8 h-8 p-0 border-0 cursor-pointer"
                          />
                          <Input 
                            value={emailBlocks.find(b => b.id === selectedBlockId)?.style.color}
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              newBlocks[idx].style.color = e.target.value;
                              setEmailBlocks(newBlocks);
                            }}
                            className="text-xs h-8 flex-1"
                          />
                        </div>
                      </div>
                    )}

                    {emailBlocks.find(b => b.id === selectedBlockId)?.content.imageUrl !== undefined && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Image URL</label>
                        <Input 
                          value={emailBlocks.find(b => b.id === selectedBlockId)?.content.imageUrl}
                          onChange={(e) => {
                            const newBlocks = [...emailBlocks];
                            const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                            newBlocks[idx].content.imageUrl = e.target.value;
                            setEmailBlocks(newBlocks);
                          }}
                          className="text-xs h-8"
                        />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-8 border-t transition-all duration-300" style={{ 
          backgroundColor: colors.offwhite,
          borderColor: colors.greyLight
        }}>
          <Button 
            onClick={handleCopyToClipboard} 
            className="w-full text-white font-bold h-12 rounded-xl transition-all duration-300 shadow-lg active:scale-95 hover:shadow-xl flex items-center justify-center gap-2"
            style={{ backgroundColor: colors.black }}
          >
            <Download size={18} />
            Export Clean HTML
          </Button>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="flex-1 p-12 overflow-y-auto flex flex-col items-center transition-colors duration-500" style={{ backgroundColor: colors.offwhite2 }}>
        {/* Viewport Toggle */}
        <div className="mb-8 flex items-center bg-stone-200/50 p-1 rounded-lg border border-stone-200 animate-in fade-in slide-in-from-top duration-700">
          <button 
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded-md transition-all duration-200 ${viewportMode === 'desktop' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            aria-label="Desktop View"
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded-md transition-all duration-200 ${viewportMode === 'mobile' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            aria-label="Mobile View"
          >
            <Smartphone size={18} />
          </button>
        </div>

        <div 
          className="w-full transition-all duration-500 ease-in-out flex justify-center animate-in fade-in zoom-in-95 duration-1000"
          style={{ maxWidth: viewportMode === 'desktop' ? '600px' : '375px' }}
        >
          <div 
            className={`w-full transition-all duration-500 overflow-hidden ${viewportMode === 'mobile' ? 'border-[12px] border-zinc-800 rounded-[48px] shadow-2xl' : 'rounded-[24px] shadow-xl border'}`}
            style={{ 
              backgroundColor: colors.offwhite,
              borderColor: viewportMode === 'mobile' ? '#27272a' : colors.greyLight,
              boxShadow: viewportMode === 'mobile' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : "0 20px 60px -16px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{
              backgroundColor: backgroundColor,
              padding: `${paddingVertical[0]}px ${paddingHorizontal[0]}px`,
              borderRadius: viewportMode === 'mobile' ? '0px' : `${borderRadius[0]}px`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}>
              {emailBlocks.map((block, index) => {
                const isHero = block.type === 'hero_image';
                if (!isHero) return null;
                
                return (
                  <div key={block.id} className="group relative">
                    {/* Action Bar */}
                    <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1.5 transition-all duration-300 z-20">
                      <button 
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                        className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowUp size={14} style={{ color: colors.grey }} />
                      </button>
                      <button 
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === emailBlocks.length - 1}
                        className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowDown size={14} style={{ color: colors.grey }} />
                      </button>
                      <button 
                        onClick={() => removeBlock(block.id)}
                        disabled={emailBlocks.length === 1}
                        className="p-1.5 bg-white rounded-md shadow-md hover:bg-red-50 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {renderBlock(block)}
                  </div>
                );
              })}
              
              <div className="space-y-4">
                {emailBlocks.map((block, index) => {
                  const isHero = block.type === 'hero_image';
                  if (isHero) return null;
                  
                  return (
                    <div key={block.id} className="group relative">
                      {/* Action Bar */}
                      <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1.5 transition-all duration-300 z-20">
                        <button 
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={index === 0}
                          className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ArrowUp size={14} style={{ color: colors.grey }} />
                        </button>
                        <button 
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={index === emailBlocks.length - 1}
                          className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ArrowDown size={14} style={{ color: colors.grey }} />
                        </button>
                        <button 
                          onClick={() => removeBlock(block.id)}
                          disabled={emailBlocks.length === 1}
                          className="p-1.5 bg-white rounded-md shadow-md hover:bg-red-50 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {renderBlock(block)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>          
          <div className="mt-8 mb-4 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest animate-in fade-in" style={{ color: colors.grey }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.brown }} />
              Live Preview
            </div>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.greyLight }} />
            <span>{viewportMode === 'desktop' ? 'Desktop 600px' : 'Mobile 375px'}</span>
          </div>
        </div>
      </div>

      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore Unsaved Draft?</DialogTitle>
            <DialogDescription>
              We found an unsaved draft from {recoveredDraft ? new Date(recoveredDraft.timestamp).toLocaleString() : 'recently'}. Would you like to restore it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={handleDiscardDraft}>
              Discard
            </Button>
            <Button onClick={handleRestoreDraft} style={{ backgroundColor: colors.black }} className="text-white">
              Restore Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
