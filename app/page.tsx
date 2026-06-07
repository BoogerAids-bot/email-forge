"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Smartphone,
  Moon,
  Sun
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { EmailBlock, EmailBlockType, EmailBlocksArraySchema, createBlock, EmailBlockSchema } from "@/types/email";
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
  const supabase = createClient();
  const router = useRouter();
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Authentication & Cloud Sync State
  const [user, setUser] = useState<User | null>(null);
  const [templateName, setTemplateName] = useState("Brand Blueprint");
  const [isSaving, setIsSaving] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string; name: string; created_at: string; config: Record<string, unknown> }>>([]);

  // Apply dark mode class to document root
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
  const isSystemLoading = React.useRef(true);
  const userInteracted = React.useRef(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [toast, setToast] = useState<{ message: string; type: "warning" | "success" | "info" } | null>(null);

  // Persistence State
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState<{
    config: Record<string, unknown>;
    timestamp: string;
  } | null>(null);

  // Toast Auto-Clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // End initial hydration phase
  useEffect(() => {
    const timer = setTimeout(() => {
      isSystemLoading.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (isSystemLoading.current || !isDirty) return;

    // Guard: only save when emailBlocks.length > 0 OR the user has explicitly performed an action.
    if (emailBlocks.length === 0 && !userInteracted.current) return;

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
    if (isSystemLoading.current) {
      return;
    }
    setIsDirty(true);
    userInteracted.current = true;
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
    const newBlock = createBlock(type);
    setEmailBlocks([...emailBlocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const moveBlockUp = (id: string) => {
    const index = emailBlocks.findIndex((b) => b.id === id);
    if (index <= 0) return;
    const newBlocks = [
      ...emailBlocks.slice(0, index - 1),
      emailBlocks[index],
      emailBlocks[index - 1],
      ...emailBlocks.slice(index + 1)
    ];
    setEmailBlocks(newBlocks);
  };

  const moveBlockDown = (id: string) => {
    const index = emailBlocks.findIndex((b) => b.id === id);
    if (index === -1 || index >= emailBlocks.length - 1) return;
    const newBlocks = [
      ...emailBlocks.slice(0, index),
      emailBlocks[index + 1],
      emailBlocks[index],
      ...emailBlocks.slice(index + 2)
    ];
    setEmailBlocks(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = emailBlocks.filter((b) => b.id !== id);
    setEmailBlocks(newBlocks);
    
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
    isSystemLoading.current = true;
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

    // Load and validate modular blocks
    if (cfg.emailBlocks) {
      const result = EmailBlocksArraySchema.safeParse(cfg.emailBlocks);
      if (result.success) {
        setEmailBlocks(result.data);
      } else {
        // Attempt to recover valid blocks individually
        const rawBlocks = cfg.emailBlocks;
        if (Array.isArray(rawBlocks)) {
          const validBlocks: EmailBlock[] = [];
          let failedCount = 0;

          rawBlocks.forEach((block) => {
            const blockResult = EmailBlockSchema.safeParse(block);
            if (blockResult.success) {
              validBlocks.push(blockResult.data);
            } else {
              failedCount++;
              console.warn(`Block failed validation:`, blockResult.error);
            }
          });

          setEmailBlocks(validBlocks);
          if (failedCount > 0) {
            setToast({
              message: `${failedCount} block(s) could not be restored — they may be from an older version.`,
              type: "warning"
            });
          }
        }
      }
    }

    // Overwrite localStorage draft with the newly loaded template
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      config: cfg,
      timestamp: new Date().toISOString()
    }));
    setLastSaved(new Date());

    setTimeout(() => {
      isSystemLoading.current = false;
      setIsDirty(false);
    }, 100);
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

  const [compilerErrorCount, setCompilerErrorCount] = useState(0);

  const compileBlock = (block: EmailBlock) => {
    try {
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
    } catch (error) {
      console.error(`Block ${block.id} failed to render:`, error);
      return `<!-- block ${block.id} failed to render: ${error instanceof Error ? error.message : String(error)} -->`;
    }
  };

  // Update compiler error count on block changes
  useEffect(() => {
    let errorCount = 0;
    emailBlocks.forEach(block => {
      try {
        const html = compileBlock(block);
        if (html.startsWith("<!-- block")) errorCount++;
      } catch (e) {
        errorCount++;
      }
    });
    setCompilerErrorCount(errorCount);
  }, [emailBlocks]);

  const generateHTMLCode = () => {
    const compiledBlocks = emailBlocks.map(block => {
      try {
        return compileBlock(block);
      } catch (error) {
        console.error(`Block compilation failed for ${block.id}:`, error);
        return `<!-- block ${block.id} failed to render: ${error instanceof Error ? error.message : String(error)} -->`;
      }
    }).join("");

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

  const selectedBlock = selectedBlockId ? emailBlocks.find(b => b.id === selectedBlockId) : null;
  const selectedBlockIndex = selectedBlock ? emailBlocks.findIndex(b => b.id === selectedBlock.id) : -1;

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-['Inter',_'Poppins',_system-ui,_-apple-system] transition-colors duration-500 ${isDarkMode ? 'bg-[#121214] text-zinc-100' : 'bg-[#f4f4f5] text-[#000000]'}`}
      style={isDarkMode ? {} : { backgroundColor: colors.offwhite2 }}>
      {/* SIDEBAR */}
      <div className={`w-[400px] border-r shadow-2xl flex flex-col h-full shrink-0 z-10 transition-all duration-500 glass-liquid-thick ${isDarkMode ? 'border-zinc-800' : ''}`}>
        <div className={`p-8 border-b flex items-center justify-between transition-all duration-300 glass-liquid ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ backgroundColor: colors.black }}>
              <div className="w-3 h-3 rotate-45 transition-transform" style={{ backgroundColor: colors.offwhite }} />
            </div>
            <div>
              <h1 className={`text-lg font-bold tracking-tight transition-colors ${isDarkMode ? 'text-zinc-100' : 'text-black'}`}>Email Forge</h1>
              <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Studio Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-md transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout} 
                className={`transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-500'}`}
              >
                <LogOut size={18} />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
          <div className="space-y-6 animate-in slide-in-from-top duration-700 ease-out">
            <div className="space-y-1">
              <h3 className={`text-sm font-semibold flex items-center gap-2 transition-colors ${isDarkMode ? 'text-zinc-100' : 'text-black'}`}>
                <Cloud size={16} className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'} />
                Cloud Storage
              </h3>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Your templates are securely synced to the cloud.</p>
            </div>

            <div className={`p-4 rounded-xl border space-y-3 transition-all duration-300 glass-float ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} style={{ color: colors.brown }} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{user?.email}</span>
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
                  className={`text-sm h-9 border transition-all duration-300 ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500' : 'bg-white border-zinc-200 text-black'}`}
                  placeholder="Template Name"
                />
                <Button 
                  onClick={handleSaveTemplate} 
                  disabled={isSaving} 
                  className={`w-full text-xs h-9 font-bold transition-all duration-300 disabled:opacity-50 hover:shadow-md active:scale-95 ${isDarkMode ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-black text-white hover:bg-zinc-900'}`}
                >
                  {isSaving ? "Syncing..." : "Save Template"}
                </Button>
              </div>

              {savedTemplates.length > 0 && (
                <div className="space-y-3">
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
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

          <Separator style={{ backgroundColor: isDarkMode ? '#3f3f46' : colors.greyLight }} />

          <Tabs defaultValue="layout" className="w-full">
            <TabsList className={`grid grid-cols-2 p-1 rounded-xl mb-6 ${isDarkMode ? 'bg-zinc-800/50' : 'bg-stone-100'}`}>
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
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Canvas Color</label>
                    <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{backgroundColor}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 p-0 border-0 cursor-pointer rounded-lg overflow-hidden transition-transform hover:scale-110" />
                    <Input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className={`flex-1 text-sm h-10 border transition-all duration-300 ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-black'}`} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Vertical Space</label>
                    <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{paddingVertical[0]}px</span>
                  </div>
                  <Slider min={12} max={100} step={1} value={paddingVertical} onValueChange={setPaddingVertical} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Horizontal Space</label>
                    <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{paddingHorizontal[0]}px</span>
                  </div>
                  <Slider min={12} max={80} step={1} value={paddingHorizontal} onValueChange={setPaddingHorizontal} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Corner Radius</label>
                    <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{borderRadius[0]}px</span>
                  </div>
                  <Slider min={0} max={40} step={1} value={borderRadius} onValueChange={setBorderRadius} />
                </div>
              </TabsContent>

              <TabsContent value="blocks" className="space-y-6 animate-in fade-in duration-500 ease-out outline-none">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                      <LayersIcon size={12} />
                      LAYERS · {emailBlocks.length}
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {emailBlocks.length === 0 ? (
                      <div className={`p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${isDarkMode ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-100 bg-zinc-50/50'}`}>
                        <LayersIcon size={24} className={isDarkMode ? 'text-zinc-600' : 'text-zinc-300'} />
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>No blocks yet</p>
                      </div>
                    ) : (
                      emailBlocks.map((block, index) => {
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
                                onClick={(e) => { e.stopPropagation(); moveBlockUp(block.id); }}
                                disabled={index === 0}
                                aria-label="Move block up"
                                className="p-1 text-stone-400 hover:text-blue-500 disabled:text-stone-200 disabled:cursor-not-allowed transition-colors"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveBlockDown(block.id); }}
                                disabled={index === emailBlocks.length - 1}
                                aria-label="Move block down"
                                className="p-1 text-stone-400 hover:text-blue-500 disabled:text-stone-200 disabled:cursor-not-allowed transition-colors"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                aria-label="Delete block"
                                className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t" style={{ borderColor: colors.greyLight }}>
                    <Button variant="outline" size="sm" onClick={() => addBlock('heading')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Heading</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('body_text')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Paragraph</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('hero_image')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Image</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('cta_button')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Button</Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('divider')} className="text-[10px] h-8 gap-1"><Plus size={12} /> Divider</Button>
                  </div>
                </div>

                {selectedBlock && (
                  <div className="space-y-6 pt-6 border-t animate-in slide-in-from-bottom duration-500" style={{ borderColor: colors.greyLight }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Editing: {selectedBlock.type.replace('_', ' ')}</h3>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => moveBlockUp(selectedBlock.id)}
                            disabled={selectedBlockIndex <= 0}
                            className="p-1 rounded-md text-stone-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors cursor-pointer"
                            title="Move Block Up"
                            aria-label="Move Block Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => moveBlockDown(selectedBlock.id)}
                            disabled={selectedBlockIndex === -1 || selectedBlockIndex >= emailBlocks.length - 1}
                            className="p-1 rounded-md text-stone-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors cursor-pointer"
                            title="Move Block Down"
                            aria-label="Move Block Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            onClick={() => deleteBlock(selectedBlock.id)}
                            className="p-1 rounded-md text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete Block"
                            aria-label="Delete Block"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedBlockId(null)} className="h-6 text-[10px]">Close</Button>
                    </div>

                    {('text' in selectedBlock.content) && (
                      <div className="space-y-3">
                        <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Text Content</label>
                        {selectedBlock.type === 'body_text' ? (
                          <textarea 
                            value={selectedBlock.content.text}
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              if (idx !== -1) {
                                const targetBlock = newBlocks[idx];
                                if (targetBlock.type === 'body_text') {
                                  targetBlock.content.text = e.target.value;
                                }
                                setEmailBlocks(newBlocks);
                              }
                            }}
                            className="w-full h-24 p-2 text-xs border rounded-lg resize-none focus:outline-none focus:ring-1"
                            style={{ backgroundColor: colors.offwhite, borderColor: colors.greyLight }}
                          />
                        ) : (
                          <Input 
                            value={
                              selectedBlock.type === 'heading' || selectedBlock.type === 'cta_button' 
                                ? selectedBlock.content.text 
                                : ""
                            }
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              if (idx !== -1) {
                                const targetBlock = newBlocks[idx];
                                if (targetBlock.type === 'heading' || targetBlock.type === 'cta_button') {
                                  targetBlock.content.text = e.target.value;
                                }
                                setEmailBlocks(newBlocks);
                              }
                            }}
                            className="text-xs h-8"
                          />
                        )}
                      </div>
                    )}

                    {('fontSize' in selectedBlock.style) && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Font Size</label>
                          <span className="text-[10px] font-mono">
                            {selectedBlock.type === 'heading' || selectedBlock.type === 'body_text'
                              ? selectedBlock.style.fontSize?.[0]
                              : 16}px
                          </span>
                        </div>
                        <Slider 
                          min={12} max={64} step={1} 
                          value={
                            selectedBlock.type === 'heading' || selectedBlock.type === 'body_text'
                              ? selectedBlock.style.fontSize
                              : [16]
                          }
                          onValueChange={(val) => {
                            const newBlocks = [...emailBlocks];
                            const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                            if (idx !== -1) {
                              const targetBlock = newBlocks[idx];
                              if (targetBlock.type === 'heading' || targetBlock.type === 'body_text') {
                                targetBlock.style.fontSize = val;
                              }
                              setEmailBlocks(newBlocks);
                            }
                          }}
                        />
                      </div>
                    )}

                    {('color' in selectedBlock.style) && (
                      <div className="space-y-3">
                        <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Color</label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            value={
                              selectedBlock.type === 'heading' || selectedBlock.type === 'body_text'
                                ? selectedBlock.style.color
                                : "#000000"
                            }
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              if (idx !== -1) {
                                const targetBlock = newBlocks[idx];
                                if (targetBlock.type === 'heading' || targetBlock.type === 'body_text') {
                                  targetBlock.style.color = e.target.value;
                                }
                                setEmailBlocks(newBlocks);
                              }
                            }}
                            className="w-8 h-8 p-0 border-0 cursor-pointer"
                          />
                          <Input 
                            value={
                              selectedBlock.type === 'heading' || selectedBlock.type === 'body_text'
                                ? selectedBlock.style.color
                                : "#000000"
                            }
                            onChange={(e) => {
                              const newBlocks = [...emailBlocks];
                              const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                              if (idx !== -1) {
                                const targetBlock = newBlocks[idx];
                                if (targetBlock.type === 'heading' || targetBlock.type === 'body_text') {
                                  targetBlock.style.color = e.target.value;
                                }
                                setEmailBlocks(newBlocks);
                              }
                            }}
                            className="text-xs h-8 flex-1"
                          />
                        </div>
                      </div>
                    )}

                    {('imageUrl' in selectedBlock.content) && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.grey }}>Image URL</label>
                        <Input 
                          value={
                            selectedBlock.type === 'hero_image'
                              ? selectedBlock.content.imageUrl
                              : ""
                          }
                          onChange={(e) => {
                            const newBlocks = [...emailBlocks];
                            const idx = newBlocks.findIndex(b => b.id === selectedBlockId);
                            if (idx !== -1) {
                              const targetBlock = newBlocks[idx];
                              if (targetBlock.type === 'hero_image') {
                                targetBlock.content.imageUrl = e.target.value;
                              }
                              setEmailBlocks(newBlocks);
                            }
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

        <div className={`p-8 border-t transition-all duration-300 glass-liquid ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          {compilerErrorCount > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-800 animate-in fade-in slide-in-from-bottom-2">
              <span className="text-lg">⚠</span>
              <p className="text-[10px] font-bold uppercase tracking-tight">
                {compilerErrorCount} block{compilerErrorCount > 1 ? 's' : ''} could not be compiled and {compilerErrorCount > 1 ? 'were' : 'was'} skipped. Check console for details.
              </p>
            </div>
          )}
          <Button 
            onClick={handleCopyToClipboard} 
            className={`w-full font-bold h-12 rounded-xl transition-all duration-300 shadow-lg active:scale-95 hover:shadow-xl flex items-center justify-center gap-2 ${isDarkMode ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-black text-white hover:bg-zinc-900'}`}
          >
            <Download size={18} />
            Export Clean HTML
          </Button>
        </div>
      </div>

      {/* PREVIEW */}
      <div className={`flex-1 py-12 px-8 overflow-y-auto flex flex-col items-center justify-start transition-colors duration-500 ${isDarkMode ? 'bg-[#121214]' : 'bg-gradient-to-br from-[#f4f4f5] via-[#f9f7f4] to-[#fafbf9]'}`}>
        {/* Viewport Toggle */}
        <div className={`mb-8 flex items-center p-1 rounded-lg border animate-in fade-in slide-in-from-top duration-700 glass-float ${isDarkMode ? 'border-zinc-700' : 'border-stone-200'}`}>
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

        {/* Canvas Indicators */}
        <div className="w-full flex items-center justify-center mb-6 animate-in fade-in duration-700">
          <div className="flex items-center justify-between w-full" style={{ maxWidth: viewportMode === 'desktop' ? '600px' : '375px' }}>
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.brown }} />
              <span className="text-[10px] font-medium tracking-widest uppercase">Live Preview</span>
            </div>
            <span className={`text-[10px] font-medium tracking-widest uppercase ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              {viewportMode === 'desktop' ? 'Desktop 600px' : 'Mobile 375px'}
            </span>
          </div>
        </div>

        {/* Email Canvas */}
        <div 
          className="w-full transition-all duration-500 ease-in-out flex justify-center animate-in fade-in zoom-in-95 duration-1000"
          style={{ maxWidth: viewportMode === 'desktop' ? '600px' : '375px' }}
        >
          <div 
            className={`w-full transition-all duration-500 overflow-hidden glass-liquid-thick ${viewportMode === 'mobile' ? 'border-[12px] border-zinc-800 rounded-[48px]' : 'rounded-[24px] border'}`}
            style={{ 
              backgroundColor: colors.offwhite,
              borderColor: viewportMode === 'mobile' ? '#27272a' : undefined,
              boxShadow: viewportMode === 'mobile' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : undefined
            }}
          >
            <div style={{
              backgroundColor: backgroundColor,
              padding: `${paddingVertical[0]}px ${paddingHorizontal[0]}px`,
              borderRadius: viewportMode === 'mobile' ? '0px' : `${borderRadius[0]}px`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              minHeight: emailBlocks.length === 0 ? '400px' : 'auto',
              display: emailBlocks.length === 0 ? 'flex' : 'block',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {emailBlocks.length === 0 ? (
                <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayersIcon size={32} className="text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-800">Your canvas is empty</h3>
                  <p className="text-sm text-zinc-500 max-w-[200px] mx-auto">Add a block from the sidebar to get started</p>
                </div>
              ) : (
                <>
                  {emailBlocks.map((block, index) => {
                    const isHero = block.type === 'hero_image';
                    if (!isHero) return null;
                    
                    return (
                      <div key={block.id} className="group relative">
                        {/* Action Bar */}
                        <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1.5 transition-all duration-300 z-20">
                          <button 
                            onClick={() => moveBlockUp(block.id)}
                            disabled={index === 0}
                            className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ArrowUp size={14} style={{ color: colors.grey }} />
                          </button>
                          <button 
                            onClick={() => moveBlockDown(block.id)}
                            disabled={index === emailBlocks.length - 1}
                            className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ArrowDown size={14} style={{ color: colors.grey }} />
                          </button>
                          <button 
                            onClick={() => deleteBlock(block.id)}
                            className="p-1.5 bg-white rounded-md shadow-md hover:bg-red-50 text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
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
                              onClick={() => moveBlockUp(block.id)}
                              disabled={index === 0}
                              className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ArrowUp size={14} style={{ color: colors.grey }} />
                            </button>
                            <button 
                              onClick={() => moveBlockDown(block.id)}
                              disabled={index === emailBlocks.length - 1}
                              className="p-1.5 bg-white rounded-md shadow-md hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ArrowDown size={14} style={{ color: colors.grey }} />
                            </button>
                            <button 
                              onClick={() => deleteBlock(block.id)}
                              className="p-1.5 bg-white rounded-md shadow-md hover:bg-red-50 text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {renderBlock(block)}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
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

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-xl border shadow-lg flex items-center gap-3 ${
            toast.type === "warning" ? "bg-amber-500 text-white border-amber-600" :
            toast.type === "success" ? "bg-emerald-500 text-white border-emerald-600" :
            "bg-zinc-800 text-white border-zinc-700"
          }`}>
            <span className="text-sm">{toast.type === "warning" ? "⚠️" : toast.type === "success" ? "✅" : "ℹ️"}</span>
            <p className="text-xs font-semibold">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-85 text-xs font-bold cursor-pointer">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
