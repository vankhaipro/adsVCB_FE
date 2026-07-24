"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  Plus,
  SpinnerGap,
  Play,
  Trash,
  GitBranch,
  X,
  Gear,
  CaretDown,
  FacebookLogo,
  TiktokLogo,
  YoutubeLogo,
  GoogleLogo,
  MagnifyingGlass,
  DotsThreeVertical,
  PencilSimple,
  PlusSquare,
  FolderOpen,
  Check,
  FileText,
  Clock,
  ShareNetwork,
  Calendar,
  Envelope,
  Database
} from "@phosphor-icons/react";
import { apiGet, apiPost, apiPatch, apiDelete, getAuthUser } from "@/lib/api";

type Rule = {
  id: string;
  name: string;
  platform: string | null;
  condition: { 
    type?: string; 
    metric?: string; 
    operator?: string; 
    value?: string | number | string[]; 
    days?: number; 
    keyword?: string;
    field?: string;
    adAccountId?: string;
    startDate?: string;
    endDate?: string;
    oncePerContent?: boolean;
    conditionsList?: any[];
    appliedTo?: string;
  };
  action: { 
    type?: string; 
    execute?: boolean;
    optimizationGoal?: string;
    budgetType?: string;
    budgetValue?: string | number;
    savedAudience?: string;
    adNameTemplate?: string;
    statusPaused?: boolean;
    notifyTo?: string;
    notifyEmail?: string;
    notifyHooks?: string[];
    actionsList?: any[];
  };
  schedule: string | null;
  isActive: boolean;
  lastRunAt: string | null;
  creator: string | null;
  updatedAt: string;
};

const condLabel = (c: any) => {
  if (!c) return "Mọi chiến dịch";
  if (c.conditionsList && c.conditionsList.length > 0) {
    const parts = c.conditionsList.map((cond: any) => {
      if (cond.type === "days_since_created") {
        return `Ngày tạo < ${cond.value}`;
      }
      if (cond.type === "views") {
        return `Xem ${cond.days} ngày > ${Number(cond.value).toLocaleString()}`;
      }
      if (cond.type === "page_name") {
        return `Trang: ${cond.value}`;
      }
      if (cond.type === "tags") {
        const tags = Array.isArray(cond.value) ? cond.value.join(", ") : cond.value;
        return `Tags: [${tags}]`;
      }
      if (cond.type === "spend") {
        return `Chi tiêu > ${Number(cond.value).toLocaleString()}`;
      }
      return `${cond.type} ${cond.operator} ${cond.value}`;
    });
    return `NẾU ${parts.join(" & ")}`;
  }
  
  if (c.type === "organic_video") {
    const metricStr =
      c.metric === "views" ? "Lượt xem" :
      c.metric === "likes" ? "Lượt thích" :
      c.metric === "comments" ? "Bình luận" :
      c.metric === "shares" ? "Chia sẻ" : "Chỉ số";
    const opStr =
      c.operator === "gt" || c.operator === ">" ? ">" :
      c.operator === "gte" || c.operator === ">=" ? "≥" :
      c.operator === "lt" || c.operator === "<" ? "<" : "≤";
    return `NẾU ${metricStr} ${opStr} ${Number(c.value).toLocaleString("vi-VN")} trong ${c.days || 5} ngày${c.keyword ? ` (chứa: ${c.keyword})` : ""}`;
  }
  
  const fieldStr =
    c.field === "spend" || c.metric === "spend" ? "Chi tiêu" :
    c.field === "ctr" || c.metric === "ctr" ? "CTR" :
    c.field === "conversions" || c.metric === "conversions" ? "Lượt chuyển đổi" :
    c.field === "status" || c.metric === "status" ? "Trạng thái" : "Chỉ số";
  const opStr =
    c.operator === "gt" || c.operator === ">" ? ">" :
    c.operator === "lt" || c.operator === "<" ? "<" :
    c.operator === "gte" || c.operator === ">=" ? "≥" : "≤";
  return `NẾU ${fieldStr} ${opStr} ${Number(c.value).toLocaleString("vi-VN")}`;
};

const actLabel = (a: any) => {
  if (!a) return "Chỉ cảnh báo";
  if (a.type === "pause") return "Tắt";
  if (a.type === "enable") return "Bật";
  if (a.type === "create") return "Tạo";
  return "Chỉ cảnh báo";
};

export default function AutoRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState("ALL");
  const [showPlatDropdown, setShowPlatDropdown] = useState(false);

  // Dropdown states
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);

  // Modals state
  const [showCreateAdModal, setShowCreateAdModal] = useState(false); // Tạo quảng cáo mới
  const [showManageAdModal, setShowManageAdModal] = useState(false); // Quản lý quảng cáo
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Cài đặt

  // Settings values
  const [settings, setSettings] = useState({
    limitPerHour: "",
    limitPerDay: "",
    waitTime: "5",
  });

  const [adConfigTab, setAdConfigTab] = useState<"new_campaign" | "existing_campaign">("new_campaign");

  // Dynamic conditions list state for Tạo quảng cáo mới (Organic)
  const [conditionsList, setConditionsList] = useState<any[]>([]);

  // Dynamic state for Quản lý quảng cáo (Pause/Manage modal)
  const [mAdName, setMAdName] = useState("");
  const [mAdPlatform, setMAdPlatform] = useState("META");
  const [mAdAppliedTo, setMAdAppliedTo] = useState("Chiến dịch");
  const [mAdConditions, setMAdConditions] = useState<any[]>([
    { id: "1", type: "page_name", operator: "eq", value: "" }
  ]);
  const [mAdActions, setMAdActions] = useState<any[]>([
    { id: "1", type: "lark", label: "Gửi thông báo tới", value: "" }
  ]);
  const [mAdSchedule, setMAdSchedule] = useState("continuous");

  // Input states for tags chip field
  const [tagInputVal, setTagInputVal] = useState("");

  // Input states for Lark webhook URLs (Tạo quảng cáo mới)
  const [webhookInputVal, setWebhookInputVal] = useState("");
  const [webhookList, setWebhookList] = useState<string[]>([]);

  // Creation forms state
  const [cAdForm, setCAdForm] = useState({
    name: "",
    platform: "TIKTOK",
    adAccountId: "",
    startDate: "",
    endDate: "",
    optimizationGoal: "Tối đa hoá Lượt thích trang",
    budgetType: "daily",
    budgetValue: "",
    savedAudience: "",
    adNameTemplate: "SB - {{createdAt}} - {{team}} - {{page}} - {{hashtag}} - Follow - {{caption}}",
    statusPaused: false,
    oncePerContent: true,
    notifyTo: "Lark",
    runSchedule: "continuous",
    targetCampaignId: "",
  });

  const rowMenuRef = useRef<HTMLDivElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rowMenuRef.current && !rowMenuRef.current.contains(event.target as Node)) {
        setActiveRowMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    apiGet("/rules")
      .then(setRules)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadCampaigns = useCallback(() => {
    apiGet("/mkt-api/campaigns")
      .then(setCampaigns)
      .catch(() => {});
  }, []);

  const loadAdAccounts = useCallback(() => {
    apiGet("/mkt-api/accounts")
      .then((data) => {
        setAdAccounts(data);
        if (data.length > 0) {
          const matching = data.find((acc: any) => acc.platform === cAdForm.platform);
          setCAdForm((prev) => ({ ...prev, adAccountId: matching ? matching.id : data[0].id }));
        }
      })
      .catch(() => {});
  }, [cAdForm.platform]);

  useEffect(() => {
    load();
    loadCampaigns();
  }, [load, loadCampaigns]);

  useEffect(() => {
    loadAdAccounts();
  }, [cAdForm.platform, loadAdAccounts]);

  // Clickable Tags dynamic appending
  const appendTemplateTag = (tag: string) => {
    if (cAdForm.adNameTemplate.includes(`{{${tag}}}`)) return;
    setCAdForm((prev) => ({
      ...prev,
      adNameTemplate: prev.adNameTemplate + ` - {{${tag}}}`,
    }));
    setTimeout(() => {
      if (templateInputRef.current) {
        templateInputRef.current.focus();
      }
    }, 50);
  };

  const isTagInTemplate = (tag: string) => {
    return cAdForm.adNameTemplate.includes(`{{${tag}}}`);
  };

  const getPreviewName = (template: string) => {
    if (!template) return "-";
    return template
      .replace(/\{\{createdAt\}\}/g, "10/7/2026")
      .replace(/\{\{team\}\}/g, "K1")
      .replace(/\{\{page\}\}/g, "Page Name")
      .replace(/\{\{hashtag\}\}/g, "#vcb, #A1")
      .replace(/\{\{caption\}\}/g, "Sample caption text")
      .replace(/\{\{platform\}\}/g, "TikTok")
      .replace(/\{\{account\}\}/g, "Viễn Chí Bảo.")
      .replace(/\{\{id\}\}/g, "7496768450946");
  };

  // Conditions list handlers (Tạo quảng cáo mới)
  const addCondition = () => {
    setConditionsList([
      ...conditionsList,
      { id: Math.random().toString(), type: "page_id", operator: "eq", value: "", days: "" }
    ]);
  };

  const updateCondition = (id: string, key: string, val: any) => {
    setConditionsList(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c));
  };

  const deleteCondition = (id: string) => {
    setConditionsList(prev => prev.filter(c => c.id !== id));
  };

  // Conditions list handlers (Quản lý quảng cáo)
  const addMCondition = () => {
    setMAdConditions([
      ...mAdConditions,
      { id: Math.random().toString(), type: "spend", operator: "gt", value: "500000" }
    ]);
  };

  const updateMCondition = (id: string, key: string, val: any) => {
    setMAdConditions(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c));
  };

  const deleteMCondition = (id: string) => {
    setMAdConditions(prev => prev.filter(c => c.id !== id));
  };

  // Actions list handlers (Quản lý quảng cáo)
  const addMAction = () => {
    if (mAdActions.length >= 5) return;
    setMAdActions([
      ...mAdActions,
      { id: Math.random().toString(), type: "lark", label: "Gửi thông báo tới", value: "" }
    ]);
  };

  const updateMAction = (id: string, key: string, val: any) => {
    setMAdActions(prev => prev.map(a => a.id === id ? { ...a, [key]: val } : a));
  };

  const deleteMAction = (id: string) => {
    setMAdActions(prev => prev.filter(a => a.id !== id));
  };

  // Tags chip input handlers
  const handleAddTag = (condId: string, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const val = tagInputVal.trim();
      if (!val) return;
      
      const currentCond = conditionsList.find(c => c.id === condId);
      if (currentCond) {
        const existingTags = Array.isArray(currentCond.value) ? currentCond.value : [];
        if (!existingTags.includes(val)) {
          updateCondition(condId, "value", [...existingTags, val]);
        }
      }
      setTagInputVal("");
    }
  };

  const handleRemoveTag = (condId: string, tagToRemove: string) => {
    const currentCond = conditionsList.find(c => c.id === condId);
    if (currentCond && Array.isArray(currentCond.value)) {
      updateCondition(condId, "value", currentCond.value.filter((t: string) => t !== tagToRemove));
    }
  };

  // Lark webhooks chip input handlers
  const handleAddWebhook = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const val = webhookInputVal.trim();
      if (!val) return;
      if (!webhookList.includes(val)) {
        setWebhookList([...webhookList, val]);
      }
      setWebhookInputVal("");
    }
  };

  const handleRemoveWebhook = (urlToRemove: string) => {
    setWebhookList(webhookList.filter(url => url !== urlToRemove));
  };

  // Create rule handler
  const handleCreateRule = async (type: "create_ad" | "manage_ad", setActive: boolean) => {
    const user = getAuthUser();
    const creatorName = user?.name || "Hệ thống";

    if (type === "create_ad") {
      if (!cAdForm.name.trim()) {
        alert("Vui lòng nhập tên quy tắc!");
        return;
      }
      if (conditionsList.length === 0) {
        alert("Vui lòng thêm ít nhất một điều kiện kích hoạt!");
        return;
      }
      const hasEmptyVal = conditionsList.some(c => c.type !== "tags" && c.type !== "team" && !c.value.toString().trim());
      if (hasEmptyVal) {
        alert("Vui lòng điền giá trị cho tất cả các điều kiện!");
        return;
      }
    } else {
      if (!mAdName.trim()) {
        alert("Vui lòng nhập tên quy tắc!");
        return;
      }
      if (mAdConditions.length === 0) {
        alert("Vui lòng thêm ít nhất một điều kiện kích hoạt!");
        return;
      }
      const hasEmptyMCond = mAdConditions.some(c => !c.value.toString().trim());
      if (hasEmptyMCond) {
        alert("Vui lòng điền giá trị cho tất cả các điều kiện kích hoạt!");
        return;
      }
    }

    setSaving(true);
    try {
      if (type === "create_ad") {
        const generatedName = cAdForm.name;
        
        let scheduleCron = "*/30 * * * *"; // Continuous (30m)
        if (cAdForm.runSchedule === "daily") {
          scheduleCron = "0 0 * * *"; // Daily 00:00
        }

        const primaryCond = conditionsList.find(c => c.type === "views") || conditionsList[0];

        await apiPost("/rules", {
          name: generatedName,
          platform: cAdForm.platform,
          condition: {
            type: "organic_video",
            metric: primaryCond.type === "views" ? "views" : "likes",
            operator: primaryCond.operator,
            value: Number(primaryCond.value),
            days: Number(primaryCond.days || 5),
            adAccountId: cAdForm.adAccountId,
            startDate: cAdForm.startDate || null,
            endDate: cAdForm.endDate || null,
            oncePerContent: cAdForm.oncePerContent,
            conditionsList: conditionsList.map(c => ({
              type: c.type,
              operator: c.operator,
              value: c.value,
              days: c.days ? Number(c.days) : null
            }))
          },
          action: {
            type: adConfigTab === "new_campaign" ? "create" : "enable",
            mode: adConfigTab, // "new_campaign" (tạo mới) | "existing_campaign" (bật có sẵn)
            execute: true,
            optimizationGoal: cAdForm.optimizationGoal,
            budgetType: cAdForm.budgetType,
            budgetValue: Number(cAdForm.budgetValue || 0),
            savedAudience: cAdForm.savedAudience || null,
            adNameTemplate: cAdForm.adNameTemplate || null,
            statusPaused: cAdForm.statusPaused,
            notifyTo: cAdForm.notifyTo,
            notifyHooks: webhookList,
            targetCampaignId: adConfigTab === "existing_campaign" ? (cAdForm.targetCampaignId || null) : null,
          },
          schedule: scheduleCron,
          isActive: setActive,
          creator: creatorName,
        });
        setShowCreateAdModal(false);
      } else {
        const generatedName = mAdName || `Tắt chiến dịch tự động trên ${mAdPlatform}`;
        
        let scheduleCron = "*/30 * * * *";
        if (mAdSchedule === "daily") scheduleCron = "0 0 * * *";

        const primaryCond = mAdConditions[0] || { type: "spend", operator: "gt", value: "500000" };

        await apiPost("/rules", {
          name: generatedName,
          platform: mAdPlatform,
          condition: {
            type: "campaign_metrics",
            metric: primaryCond.type,
            operator: primaryCond.operator,
            value: Number(primaryCond.value || 0),
            conditionsList: mAdConditions.map(c => ({
              type: c.type,
              operator: c.operator,
              value: c.value
            })),
            appliedTo: mAdAppliedTo,
          },
          action: {
            type: "pause",
            execute: true,
            actionsList: mAdActions.map(a => ({
              type: a.type,
              value: a.value
            }))
          },
          schedule: scheduleCron,
          isActive: setActive,
          creator: creatorName,
        });
        setShowManageAdModal(false);
      }
      load();
    } catch (e) {
      alert("Lỗi tạo quy tắc: " + (e instanceof Error ? e.message : ""));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: Rule) => {
    setBusy(r.id);
    try {
      await apiPatch(`/rules/${r.id}`, { isActive: !r.isActive });
      setRules((p) => p.map((x) => (x.id === r.id ? { ...x, isActive: !x.isActive } : x)));
    } finally {
      setBusy(null);
    }
  };

  const runNow = async (r: Rule) => {
    setBusy(r.id);
    setActiveRowMenu(null);
    try {
      const res = await apiPost(`/rules/${r.id}/run`);
      alert(`Đã chạy thành công: Tác động lên ${res.matched ?? 0} chiến dịch.`);
      load();
    } catch (e) {
      alert("Lỗi chạy quy tắc: " + (e instanceof Error ? e.message : ""));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (r: Rule) => {
    if (!confirm(`Bạn có chắc chắn muốn xoá quy tắc "${r.name}"?`)) return;
    setBusy(r.id);
    setActiveRowMenu(null);
    try {
      await apiDelete(`/rules/${r.id}`);
      setRules((p) => p.filter((x) => x.id !== r.id));
    } catch (e) {
      alert("Lỗi xoá quy tắc: " + (e instanceof Error ? e.message : ""));
    } finally {
      setBusy(null);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${hours}:${mins} ${day}/${month}/${year}`;
  };

  // Filter rules locally
  const filteredRules = rules.filter((r) => {
    const nameMatch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    let platformMatch = true;
    if (selectedPlatformFilter !== "ALL") {
      platformMatch = r.platform === selectedPlatformFilter;
    }
    return nameMatch && platformMatch;
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Quy tắc tự động</h1>
        <p className="text-sm text-muted-foreground">Thiết lập các kịch bản bật tắt quảng cáo tự động theo thời gian thực.</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-background border border-border px-3.5 py-2 rounded-lg w-80 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <MagnifyingGlass size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-foreground outline-none text-sm w-full placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Buttons Action */}
        <div className="flex items-center gap-3">
          {/* Nền tảng filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPlatDropdown(!showPlatDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:bg-muted/70 transition-colors"
            >
              {selectedPlatformFilter === "ALL" && "Nền tảng: Tất cả"}
              {selectedPlatformFilter === "META" && "Facebook"}
              {selectedPlatformFilter === "TIKTOK" && "TikTok"}
              {selectedPlatformFilter === "YOUTUBE" && "YouTube"}
              {selectedPlatformFilter === "GOOGLE" && "Google"}
              <CaretDown size={14} className="text-muted-foreground" />
            </button>
            {showPlatDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setSelectedPlatformFilter("ALL");
                    setShowPlatDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground flex items-center justify-between"
                >
                  Tất cả {selectedPlatformFilter === "ALL" && <Check size={14} className="text-blue-500" />}
                </button>
                <button
                  onClick={() => {
                    setSelectedPlatformFilter("META");
                    setShowPlatDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground flex items-center gap-2.5"
                >
                  <FacebookLogo size={16} className="text-blue-500" /> Facebook
                </button>
                <button
                  onClick={() => {
                    setSelectedPlatformFilter("TIKTOK");
                    setShowPlatDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground flex items-center gap-2.5"
                >
                  <TiktokLogo size={16} className="text-pink-500" /> TikTok
                </button>
                <button
                  onClick={() => {
                    setSelectedPlatformFilter("YOUTUBE");
                    setShowPlatDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground flex items-center gap-2.5"
                >
                  <YoutubeLogo size={16} className="text-red-500" /> YouTube
                </button>
                <button
                  onClick={() => {
                    setSelectedPlatformFilter("GOOGLE");
                    setShowPlatDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground flex items-center gap-2.5"
                >
                  <GoogleLogo size={16} className="text-amber-500" /> Google
                </button>
              </div>
            )}
          </div>

          {/* Cài đặt button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:bg-muted/70 transition-colors"
          >
            <Gear size={16} /> Cài đặt
          </button>

          {/* Tạo mới dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground text-sm font-medium rounded-lg shadow-md transition-colors"
            >
              Tạo mới <CaretDown size={14} />
            </button>
            {showCreateDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                 <button
                  onClick={() => {
                    setCAdForm({
                      name: "",
                      platform: "TIKTOK",
                      adAccountId: "",
                      startDate: "",
                      endDate: "",
                      optimizationGoal: "Tối đa hoá Lượt thích trang",
                      budgetType: "daily",
                      budgetValue: "",
                      savedAudience: "",
                      adNameTemplate: "SB - {{createdAt}} - {{team}} - {{page}} - {{hashtag}} - Follow - {{caption}}",
                      statusPaused: false,
                      oncePerContent: true,
                      notifyTo: "Lark",
                      runSchedule: "continuous",
                      targetCampaignId: "",
                    });
                    setConditionsList([]);
                    setWebhookList([]);
                    setShowCreateAdModal(true);
                    setShowCreateDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm text-foreground flex items-center gap-3 transition-colors"
                >
                  <PlusSquare size={18} className="text-amber-500" />
                  <div>
                    <div className="font-semibold">Tạo quảng cáo mới</div>
                    <div className="text-[10px] text-muted-foreground">Bật quảng cáo theo bài organic</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMAdName("");
                    setMAdPlatform("META");
                    setMAdAppliedTo("Chiến dịch");
                    setMAdConditions([
                      { id: "1", type: "page_name", operator: "eq", value: "" }
                    ]);
                    setMAdActions([
                      { id: "1", type: "lark", label: "Gửi thông báo tới", value: "" }
                    ]);
                    setMAdSchedule("continuous");
                    setShowManageAdModal(true);
                    setShowCreateDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm text-foreground flex items-center gap-3 transition-colors border-t border-border"
                >
                  <FolderOpen size={18} className="text-purple-500" />
                  <div>
                    <div className="font-semibold">Quản lý quảng cáo</div>
                    <div className="text-[10px] text-muted-foreground">Tắt quảng cáo theo chỉ số</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Table Content */}
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2 shadow-sm">
          <SpinnerGap size={18} className="animate-spin text-primary" /> Đang tải dữ liệu…
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-sm shadow-sm">
          Không tìm thấy quy tắc tự động nào phù hợp.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase bg-muted/20">
                  <th className="px-4 py-3 text-center w-14"></th>
                  <th className="px-4 py-3 min-w-[200px]">Tên quy tắc</th>
                  <th className="px-4 py-3 w-40">Nền tảng</th>
                  <th className="px-4 py-3 min-w-[320px]">Hành động và điều kiện</th>
                  <th className="px-4 py-3 w-44">Lần cập nhật cuối</th>
                  <th className="px-4 py-3 w-48">Người tạo</th>
                  <th className="px-4 py-3 text-right w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px]">
                {filteredRules.map((r) => {
                  const isOrganic = r.condition?.type === "organic_video";
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      {/* Active Status Switch */}
                      <td className="px-4 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={busy === r.id}
                            checked={r.isActive}
                            onChange={() => toggleActive(r)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>

                      {/* Rule Name */}
                      <td className="px-4 py-4 font-semibold text-foreground">
                        {r.name}
                      </td>

                      {/* Platform */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {r.platform === "META" || r.platform === "FACEBOOK" ? (
                            <>
                              <FacebookLogo size={16} className="text-blue-500 fill-blue-500" />
                              <span>Facebook</span>
                            </>
                          ) : r.platform === "TIKTOK" ? (
                            <>
                              <TiktokLogo size={16} className="text-pink-500" />
                              <span>TikTok</span>
                            </>
                          ) : r.platform === "YOUTUBE" ? (
                            <>
                              <YoutubeLogo size={16} className="text-red-500 fill-red-500" />
                              <span>YouTube</span>
                            </>
                          ) : r.platform === "GOOGLE" ? (
                            <>
                              <GoogleLogo size={16} className="text-amber-500" />
                              <span>Google</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Tất cả</span>
                          )}
                        </div>
                      </td>

                      {/* Action & Conditions */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-foreground/90">
                          {isOrganic ? "1 hành động / nhiều điều kiện" : "1 hành động / 1 điều kiện"}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 max-w-lg overflow-hidden text-ellipsis whitespace-nowrap" title={condLabel(r.condition)}>
                          {condLabel(r.condition)} → <span className="font-medium text-blue-400">{actLabel(r.action)} quảng cáo</span>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {formatTime(r.updatedAt)}
                      </td>

                      {/* Creator */}
                      <td className="px-4 py-4 text-muted-foreground font-medium whitespace-nowrap">
                        {r.creator || "Nguyễn Viết Việt"}
                      </td>

                      {/* Context Actions */}
                      <td className="px-4 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            title="Chỉnh sửa nhanh"
                            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                          >
                            <PencilSimple size={16} />
                          </button>
                          
                          <button
                            onClick={() => setActiveRowMenu(activeRowMenu === r.id ? null : r.id)}
                            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                          >
                            <DotsThreeVertical size={18} weight="bold" />
                          </button>

                          {activeRowMenu === r.id && (
                            <div
                              ref={rowMenuRef}
                              className="absolute right-4 top-12 bg-card border border-border rounded-lg shadow-xl z-50 py-1 w-28 overflow-hidden text-left"
                            >
                              <button
                                onClick={() => runNow(r)}
                                disabled={busy === r.id}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-muted text-[10px] text-foreground flex items-center gap-1.5"
                              >
                                <Play size={12} /> Chạy thử
                              </button>
                              <button
                                onClick={() => remove(r)}
                                disabled={busy === r.id}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-[10px] text-red-500 flex items-center gap-1.5 border-t border-border"
                              >
                                <Trash size={12} /> Xoá
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Modal (Cài đặt quy tắc tự động) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-foreground font-bold text-lg mb-1">Cài đặt quy tắc tự động</h3>
            <p className="text-xs text-muted-foreground mb-5">Định cấu hình các tham số bảo vệ khi thực hiện hành động rule.</p>

            {/* Quick overview metric cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-background border border-border rounded-lg p-3 text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Giới hạn mỗi giờ</div>
                <div className="text-lg font-bold text-foreground mt-1">- hành động</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Giới hạn mỗi ngày</div>
                <div className="text-lg font-bold text-foreground mt-1">- hành động</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Thời gian chờ</div>
                <div className="text-lg font-bold text-blue-500 mt-1">{settings.waitTime} phút</div>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex flex-col gap-4 text-sm mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground font-semibold">Tùy chỉnh thời gian chờ</label>
                <span className="text-[10px] text-muted-foreground">Chọn khoảng thời gian chờ giữa các hành động tương tác với quảng cáo.</span>
                <div className="flex items-center gap-2.5 mt-1">
                  <input
                    type="number"
                    value={settings.waitTime}
                    onChange={(e) => setSettings({ ...settings, waitTime: e.target.value })}
                    placeholder="Nhập số"
                    className="bg-background border border-border rounded-md px-3.5 py-2 text-foreground outline-none w-32 focus:border-blue-500"
                  />
                  <span className="text-foreground font-medium">phút</span>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-500/5 border border-blue-500/20 text-blue-400 p-3.5 rounded-lg text-xs leading-relaxed">
                <span className="font-bold">Lưu ý: </span>
                Thời gian chờ phù hợp là khoảng 1-5 phút, khoảng chờ quá chậm có thể dẫn tới giảm hiệu quả của các hành động tự động.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/70 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  alert("Đã lưu cấu hình cài đặt!");
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground font-semibold rounded-md text-sm transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tạo quy tắc tự động mới */}
      {showCreateAdModal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#f1f2f5] border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-5">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4.5 bg-white border-b border-border">
              <h3 className="text-[#1a202c] font-bold text-[16px]">Tạo quy tắc tự động mới</h3>
              <button
                onClick={() => setShowCreateAdModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
              {/* Section 1: Thông tin cơ bản */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-[13px]">
                  <FileText size={18} weight="fill" className="text-amber-500" />
                  <span>Thông tin cơ bản</span>
                </div>

                {/* Tên quy tắc */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#4a5568] font-medium">
                    <span className="text-red-500">*</span> Tên quy tắc
                  </label>
                  <input
                    type="text"
                    value={cAdForm.name}
                    onChange={(e) => setCAdForm({ ...cAdForm, name: e.target.value })}
                    placeholder="Nhập tên quy tắc"
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Nền tảng áp dụng */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#4a5568] font-medium">
                      <span className="text-red-500">*</span> Nền tảng áp dụng
                    </label>
                    <select
                      value={cAdForm.platform}
                      onChange={(e) => setCAdForm({ ...cAdForm, platform: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="META">Facebook</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="GOOGLE">Google</option>
                    </select>
                  </div>

                  {/* Tài khoản quảng cáo */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#4a5568] font-medium">
                      <span className="text-red-500">*</span> Tài khoản quảng cáo
                    </label>
                    <select
                      value={cAdForm.adAccountId}
                      onChange={(e) => setCAdForm({ ...cAdForm, adAccountId: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Chọn tài khoản quảng cáo</option>
                      {adAccounts
                        .filter(acc => acc.platform === cAdForm.platform)
                        .map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name || acc.externalId}
                          </option>
                        ))
                      }
                      {adAccounts.filter(acc => acc.platform === cAdForm.platform).length === 0 && (
                        <option value="" disabled>Viễn Chí Bảo.</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Ngày bắt đầu */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#4a5568] font-medium">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={cAdForm.startDate}
                      onChange={(e) => setCAdForm({ ...cAdForm, startDate: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Ngày kết thúc */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#4a5568] font-medium">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={cAdForm.endDate}
                      onChange={(e) => setCAdForm({ ...cAdForm, endDate: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Multiple dynamic conditions list */}
                <div className="flex flex-col gap-3 mt-2">
                  {conditionsList.map((cond) => {
                    const isNumeric = [
                      "views",
                      "impressions",
                      "engagement",
                      "comments",
                      "shares",
                      "saves",
                      "avg_watch_time",
                      "paid_views",
                      "organic_views"
                    ].includes(cond.type);

                    return (
                      <div key={cond.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {/* Metric Type Selector */}
                        <select
                          value={cond.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            // Set default operator depending on the new type
                            let defaultOp = "eq";
                            if (["views", "impressions", "engagement", "comments", "shares", "saves", "avg_watch_time", "paid_views", "organic_views"].includes(newType)) {
                              defaultOp = "gt";
                            } else if (newType === "days_since_created") {
                              defaultOp = "lt";
                            } else if (newType === "tags" || newType === "team") {
                              defaultOp = "contains";
                            } else if (newType === "created_time") {
                              defaultOp = "between";
                            }
                            updateCondition(cond.id, "type", newType);
                            updateCondition(cond.id, "operator", defaultOp);
                            updateCondition(cond.id, "value", (newType === "tags" || newType === "team") ? [] : "");
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#2d3748] font-semibold outline-none w-48 focus:border-blue-500"
                        >
                          <option value="page_id">ID Trang</option>
                          <option value="page_name">Tên trang</option>
                          <option value="tags">Tags</option>
                          <option value="team">Team</option>
                          <option value="title">Tiêu đề</option>
                          <option value="content_type">Loại nội dung</option>
                          <option value="created_time">Thời gian tạo</option>
                          <option value="days_since_created">Ngày kể từ khi tạo</option>
                          <option value="views">Lượt xem</option>
                          <option value="impressions">Lượt hiển thị</option>
                          <option value="engagement">Lượt tương tác</option>
                          <option value="comments">Lượt bình luận</option>
                          <option value="shares">Lượt chia sẻ</option>
                          <option value="saves">Lượt lưu</option>
                          <option value="avg_watch_time">Thời gian xem trung bình</option>
                          <option value="paid_views">Lượt xem trả phí</option>
                          <option value="organic_views">Lượt xem tự nhiên</option>
                        </select>

                        {/* Condition Operator Column */}
                        {isNumeric ? (
                          <>
                            <select
                              value={cond.days || "7"}
                              onChange={(e) => updateCondition(cond.id, "days", e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none w-32 focus:border-blue-500"
                            >
                              <option value="7">7 ngày qua</option>
                              <option value="5">5 ngày qua</option>
                              <option value="3">3 ngày qua</option>
                              <option value="1">Hôm nay</option>
                            </select>
                            <select
                              value={cond.operator}
                              onChange={(e) => updateCondition(cond.id, "operator", e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none w-28 focus:border-blue-500"
                            >
                              <option value="gt">lớn hơn</option>
                              <option value="gte">lớn hơn hoặc bằng</option>
                              <option value="lt">nhỏ hơn</option>
                              <option value="lte">nhỏ hơn hoặc bằng</option>
                            </select>
                          </>
                        ) : cond.type === "tags" || cond.type === "team" ? (
                          <select
                            value={cond.operator}
                            onChange={(e) => updateCondition(cond.id, "operator", e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none w-32 focus:border-blue-500"
                          >
                            <option value="contains">bao gồm</option>
                            <option value="not_contains">không bao gồm</option>
                            <option value="eq">là</option>
                          </select>
                        ) : cond.type === "created_time" ? (
                          <select
                            value={cond.operator}
                            onChange={(e) => updateCondition(cond.id, "operator", e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none w-32 focus:border-blue-500"
                          >
                            <option value="between">trong khoảng</option>
                            <option value="after">sau ngày</option>
                            <option value="before">trước ngày</option>
                          </select>
                        ) : cond.type === "days_since_created" ? (
                          <select
                            value={cond.operator}
                            onChange={(e) => updateCondition(cond.id, "operator", e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none w-32 focus:border-blue-500"
                          >
                            <option value="lt">nhỏ hơn</option>
                            <option value="gt">lớn hơn</option>
                            <option value="eq">bằng</option>
                          </select>
                        ) : (
                          <select
                            value={cond.operator}
                            onChange={(e) => updateCondition(cond.id, "operator", e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none w-32 focus:border-blue-500"
                          >
                            <option value="eq">là</option>
                            <option value="contains">bao gồm</option>
                            <option value="starts_with">bắt đầu bằng</option>
                            <option value="ends_with">kết thúc bằng</option>
                          </select>
                        )}

                        {/* Input Value or Tag Chip Component */}
                        {cond.type === "tags" || cond.type === "team" ? (
                          <div className="flex-1 flex flex-wrap gap-1 items-center bg-white border border-slate-200 rounded-lg p-1.5 min-h-[32px]">
                            {Array.isArray(cond.value) && cond.value.map((tag: string) => (
                              <span key={tag} className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold border border-slate-200">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(cond.id, tag)} className="text-slate-400 hover:text-slate-600 font-bold">x</button>
                              </span>
                            ))}
                            <input
                              type="text"
                              value={tagInputVal}
                              onChange={(e) => setTagInputVal(e.target.value)}
                              onKeyDown={(e) => handleAddTag(cond.id, e)}
                              placeholder="Nhập tag..."
                              className="bg-transparent border-none outline-none text-xs flex-1 min-w-[60px]"
                            />
                          </div>
                        ) : cond.type === "created_time" ? (
                          <input
                            type="date"
                            value={cond.value}
                            onChange={(e) => updateCondition(cond.id, "value", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={cond.value}
                            onChange={(e) => updateCondition(cond.id, "value", e.target.value)}
                            placeholder="Nhập giá trị"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500"
                          />
                        )}

                      {/* Delete */}
                      <button
                        onClick={() => deleteCondition(cond.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                    );
                  })}
                </div>

                {/* + Thêm điều kiện button */}
                <button
                  onClick={addCondition}
                  className="border border-dashed border-blue-200 text-blue-500 bg-blue-50/10 hover:bg-blue-50/20 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer font-medium text-[11px] transition-colors"
                >
                  + Thêm điều kiện
                </button>
              </div>

              {/* Section 2: Cấu hình quảng cáo */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-green-600 font-bold text-[13px]">
                  <ShareNetwork size={18} weight="fill" className="text-green-500" />
                  <span>Cấu hình quảng cáo</span>
                </div>
                <div className="text-[11px] text-[#4a5568] -mt-1 leading-normal">
                  Thì thực hiện đồng thời các hành động bên dưới
                </div>

                {/* Tabs */}
                <div className="flex border border-slate-100 rounded-lg p-1 bg-slate-100/50">
                  <button
                    onClick={() => setAdConfigTab("new_campaign")}
                    className={`flex-1 py-1.5 text-center text-[11px] cursor-pointer transition-all ${
                      adConfigTab === "new_campaign"
                        ? "bg-white text-foreground shadow-sm font-semibold rounded-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tạo chiến dịch mới
                  </button>
                  <button
                    onClick={() => setAdConfigTab("existing_campaign")}
                    className={`flex-1 py-1.5 text-center text-[11px] cursor-pointer transition-all ${
                      adConfigTab === "existing_campaign"
                        ? "bg-white text-foreground shadow-sm font-semibold rounded-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sử dụng chiến dịch có sẵn
                  </button>
                </div>

                {adConfigTab === "new_campaign" ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-[11px] font-semibold text-[#2d3748] flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs font-bold">1</span>
                      Tạo quảng cáo
                    </div>
                    <span className="text-[10px] text-muted-foreground -mt-3">
                      Thiết lập mục tiêu và cấu hình cho cấp chiến dịch/nhóm quảng cáo
                    </span>

                    {/* Mục tiêu tối ưu hoá */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#4a5568] font-medium">Mục tiêu tối ưu hoá</label>
                      <div className="grid grid-cols-12 gap-2">
                        <select
                          value={cAdForm.optimizationGoal}
                          onChange={(e) => setCAdForm({ ...cAdForm, optimizationGoal: e.target.value })}
                          className="col-span-5 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-blue-500"
                        >
                          <option value="Tối đa hoá Lượt thích trang">Tối đa hoá Lượt thích trang</option>
                          <option value="views">Tối đa hoá Lượt xem video</option>
                          <option value="engagement">Tương tác bài viết</option>
                        </select>
                        <select
                          value={cAdForm.budgetType}
                          onChange={(e) => setCAdForm({ ...cAdForm, budgetType: e.target.value })}
                          className="col-span-4 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-blue-500"
                        >
                          <option value="daily">Ngân sách hàng ngày</option>
                          <option value="lifetime">Ngân sách trọn đời</option>
                        </select>
                        <input
                          type="number"
                          value={cAdForm.budgetValue}
                          onChange={(e) => setCAdForm({ ...cAdForm, budgetValue: e.target.value })}
                          className="col-span-3 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-blue-500 font-bold"
                          placeholder="Số tiền"
                        />
                      </div>
                    </div>

                    <button className="border border-dashed border-slate-200 text-slate-500 hover:bg-slate-50 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer font-medium text-[10px] transition-colors -mt-1">
                      + Thêm mục tiêu tối ưu hoá
                    </button>

                    {/* Đối tượng */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#4a5568] font-medium">Đối tượng</label>
                      <span className="text-[10px] text-muted-foreground">
                        Chọn tệp đối tượng bao gồm hoặc loại trừ, áp dụng cho toàn bộ mục tiêu tối ưu hoá
                      </span>
                      <select
                        value={cAdForm.savedAudience}
                        onChange={(e) => setCAdForm({ ...cAdForm, savedAudience: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 mt-1 text-[11px] text-foreground outline-none focus:border-blue-500"
                      >
                        <option value="">Chọn từ đối tượng đã lưu</option>
                        <option value="vietnam_18_45">Việt Nam (18 - 45 tuổi)</option>
                      </select>
                    </div>

                    {/* Mẫu tên quảng cáo */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#4a5568] font-medium">Mẫu tên quảng cáo</label>
                      <span className="text-[10px] text-muted-foreground">Thiết lập mẫu cho tên quảng cáo</span>
                      <input
                        ref={templateInputRef}
                        type="text"
                        value={cAdForm.adNameTemplate}
                        onChange={(e) => setCAdForm({ ...cAdForm, adNameTemplate: e.target.value })}
                        placeholder="Nhập mẫu tên quảng cáo"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 mt-1 text-[11px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />

                      {/* Clickable tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          { key: "Tên nền tảng", val: "platform" },
                          { key: "Tên tài khoản", val: "account" },
                          { key: "Tên trang", val: "page" },
                          { key: "Ngày tạo", val: "createdAt" },
                          { key: "ID nội dung", val: "id" },
                          { key: "Hashtag", val: "hashtag" },
                          { key: "Team", val: "team" },
                          { key: "Caption", val: "caption" },
                        ].map((tag) => {
                          const disabled = isTagInTemplate(tag.val);
                          return (
                            <button
                              key={tag.key}
                              type="button"
                              disabled={disabled}
                              onClick={() => appendTemplateTag(tag.val)}
                              className={`text-[10px] px-2 py-1 rounded-md cursor-pointer font-medium transition-all ${
                                disabled 
                                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                  : "bg-blue-50/50 hover:bg-blue-50 text-blue-500 border border-blue-100"
                              }`}
                            >
                              {disabled ? "✓ " : "+ "} {tag.key}
                            </button>
                          );
                        })}
                      </div>

                      {/* Preview name */}
                      <div className="text-[10px] text-muted-foreground mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono leading-relaxed">
                        <span className="font-semibold text-[#4a5568]">Xem trước: </span> 
                        {getPreviewName(cAdForm.adNameTemplate)}
                      </div>
                    </div>

                    {/* Checkboxes options */}
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="flex items-center gap-2.5 text-[11px] text-foreground cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={cAdForm.statusPaused}
                          onChange={(e) => setCAdForm({ ...cAdForm, statusPaused: e.target.checked })}
                          className="rounded border-border text-blue-600 focus:ring-blue-500 w-4.5 h-4.5"
                        />
                        <span>Tạo quảng cáo mới ở trạng thái "Tạm dừng"</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-[11px] text-foreground cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={cAdForm.oncePerContent}
                          onChange={(e) => setCAdForm({ ...cAdForm, oncePerContent: e.target.checked })}
                          className="rounded border-border text-blue-600 focus:ring-blue-500 w-4.5 h-4.5"
                        />
                        <span>Mỗi nội dung chỉ tạo quảng cáo 1 lần duy nhất</span>
                      </label>
                    </div>

                    {/* Step 2: Gửi thông báo */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                      <div className="text-[11px] font-semibold text-[#2d3748] flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs font-bold">2</span>
                        Gửi thông báo
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground">Gửi thông báo tới</span>
                          <select
                            value={cAdForm.notifyTo}
                            onChange={(e) => setCAdForm({ ...cAdForm, notifyTo: e.target.value })}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500"
                          >
                            <option value="Lark">Lark</option>
                            <option value="Email">Email</option>
                            <option value="None">Không thông báo</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground">Nhập Webhook URL / Kênh</span>
                          <input
                            type="text"
                            value={webhookInputVal}
                            onChange={(e) => setWebhookInputVal(e.target.value)}
                            onKeyDown={handleAddWebhook}
                            placeholder="Nhấn Enter để thêm webhook"
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500 w-full"
                          />
                        </div>
                      </div>

                      {/* Display webhook list as tag-chips */}
                      {webhookList.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {webhookList.map((url) => (
                            <div key={url} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                              <span className="truncate flex-1 text-muted-foreground" title={url}>{url}</span>
                              <button type="button" onClick={() => handleRemoveWebhook(url)} className="text-slate-400 hover:text-red-500 font-bold ml-2">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-sm bg-slate-50/50 border border-slate-200 p-4 rounded-xl">
                    <div className="text-[11px] font-semibold text-[#2d3748] flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold">1</span>
                      Kích hoạt chiến dịch quảng cáo
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#4a5568] font-medium">Chọn chiến dịch quảng cáo cũ</label>
                      <select
                        value={cAdForm.targetCampaignId || ""}
                        onChange={(e) => setCAdForm({ ...cAdForm, targetCampaignId: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 w-full"
                      >
                        <option value="">-- Tự động tìm theo mã liên kết (Hashtag/Mã video) --</option>
                        {campaigns
                          .filter((c: any) => c.platform === cAdForm.platform && (c.status === "PAUSED" || c.status === "DISABLE" || c.status === "paused" || c.status === "disable" || c.status === "active" || c.status === "ACTIVE"))
                          .map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.platform})
                            </option>
                          ))}
                      </select>
                      <span className="text-[10px] text-muted-foreground mt-1 leading-normal">
                        Nếu chọn một chiến dịch cụ thể, hệ thống sẽ kích hoạt đúng chiến dịch này. Nếu chọn "Tự động tìm...", hệ thống sẽ quét các chiến dịch khớp với mã/hashtag trong video organic để bật lên.
                      </span>
                    </div>

                    {/* Step 2: Gửi thông báo */}
                    <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
                      <div className="text-[11px] font-semibold text-[#2d3748] flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold">2</span>
                        Gửi thông báo
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground">Gửi thông báo tới</span>
                          <select
                            value={cAdForm.notifyTo}
                            onChange={(e) => setCAdForm({ ...cAdForm, notifyTo: e.target.value })}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500"
                          >
                            <option value="Lark">Lark</option>
                            <option value="Email">Email</option>
                            <option value="None">Không thông báo</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground">Nhập Webhook URL / Kênh</span>
                          <input
                            type="text"
                            value={webhookInputVal}
                            onChange={(e) => setWebhookInputVal(e.target.value)}
                            onKeyDown={handleAddWebhook}
                            placeholder="Nhấn Enter để thêm webhook"
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500 w-full"
                          />
                        </div>
                      </div>

                      {webhookList.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {webhookList.map((url) => (
                            <div key={url} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                              <span className="truncate flex-1 text-muted-foreground" title={url}>{url}</span>
                              <button type="button" onClick={() => handleRemoveWebhook(url)} className="text-slate-400 hover:text-red-500 font-bold ml-2">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Lịch trình chạy */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-[13px]">
                  <Clock size={18} weight="fill" className="text-purple-500" />
                  <span>Lịch trình chạy</span>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  {/* Option 1: Liên tục */}
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="runSchedule"
                      value="continuous"
                      checked={cAdForm.runSchedule === "continuous"}
                      onChange={(e) => setCAdForm({ ...cAdForm, runSchedule: e.target.value })}
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-foreground text-[11px]">Liên tục</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Lịch trình chạy thường xuyên trong mỗi 30 phút/lần
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Hàng ngày */}
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="runSchedule"
                      value="daily"
                      checked={cAdForm.runSchedule === "daily"}
                      onChange={(e) => setCAdForm({ ...cAdForm, runSchedule: e.target.value })}
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-foreground text-[11px]">Hàng ngày</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Lịch trình chạy hàng ngày vào 00:00 tới 01:00 (chạy mỗi 30 phút/lần)
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Tùy chỉnh */}
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="runSchedule"
                      value="custom"
                      checked={cAdForm.runSchedule === "custom"}
                      onChange={(e) => setCAdForm({ ...cAdForm, runSchedule: e.target.value })}
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-foreground text-[11px]">Tùy chỉnh</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Tùy chỉnh lịch trình để hàng ngày trong khoảng thời gian cụ thể (chạy mỗi 30 phút/lần)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Fixed Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4.5 bg-white border-t border-border">
              <button
                onClick={() => setShowCreateAdModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-foreground hover:bg-slate-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => handleCreateRule("create_ad", false)}
                disabled={saving}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-foreground hover:bg-slate-50 transition-colors font-semibold shadow-sm"
              >
                Chỉ lưu
              </button>
              <button
                onClick={() => handleCreateRule("create_ad", true)}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md shadow-blue-500/10"
              >
                {saving ? <SpinnerGap size={16} className="animate-spin" /> : null} Lưu và kích hoạt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quản lý quảng cáo (Pause/Manage Ad Modal matching User's Screenshots) */}
      {showManageAdModal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#f1f2f5] border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-5 animate-fade-in">
            {/* Header with Title Input Field */}
            <div className="flex justify-between items-center px-6 py-4.5 bg-white border-b border-border">
              <input
                type="text"
                value={mAdName}
                onChange={(e) => setMAdName(e.target.value)}
                placeholder="Nhập tên quy tắc..."
                className="text-[#1a202c] font-bold text-[16px] bg-transparent border-none outline-none w-full placeholder:text-[#a0aec0]/60 focus:ring-0"
              />
              <button
                onClick={() => setShowManageAdModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
              {/* Section 1: Điều kiện kích hoạt */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-[13px]">
                  <Database size={18} weight="fill" className="text-blue-600" />
                  <span>Điều kiện kích hoạt</span>
                </div>
                <div className="text-[11px] text-[#4a5568] -mt-2">
                  Khi tất cả điều kiện sau được đáp ứng
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Nền tảng */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#4a5568] font-medium">
                      <span className="text-red-500">*</span> Nền tảng
                    </label>
                    <select
                      value={mAdPlatform}
                      onChange={(e) => setMAdPlatform(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="META">Facebook</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="GOOGLE">Google</option>
                    </select>
                  </div>

                  {/* Đối tượng áp dụng */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#4a5568] font-medium">
                      <span className="text-red-500">*</span> Đối tượng áp dụng
                    </label>
                    <select
                      value={mAdAppliedTo}
                      onChange={(e) => setMAdAppliedTo(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="Chiến dịch">Chiến dịch</option>
                      <option value="Nhóm quảng cáo">Nhóm quảng cáo</option>
                      <option value="Quảng cáo">Quảng cáo</option>
                    </select>
                  </div>
                </div>

                {/* Condition rows */}
                <div className="flex flex-col gap-3 mt-1">
                  <div className="text-[11px] font-bold text-[#2d3748]">Cấu hình điều kiện</div>
                  {mAdConditions.map((cond) => (
                    <div key={cond.id} className="flex items-center gap-2">
                      <select
                        value={cond.type}
                        onChange={(e) => updateMCondition(cond.id, "type", e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-foreground outline-none w-44 focus:border-blue-500"
                      >
                        <option value="page_name">Tên trang</option>
                        <option value="spend">Chi tiêu</option>
                        <option value="ctr">CTR</option>
                        <option value="conversions">Lượt chuyển đổi</option>
                        <option value="cpc">CPC</option>
                      </select>

                      <select
                        value={cond.operator}
                        onChange={(e) => updateMCondition(cond.id, "operator", e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-foreground outline-none w-32 focus:border-blue-500"
                      >
                        <option value="eq">là</option>
                        <option value="contains">bao gồm</option>
                        <option value="gt">lớn hơn</option>
                        <option value="lt">nhỏ hơn</option>
                      </select>

                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) => updateMCondition(cond.id, "value", e.target.value)}
                        placeholder="Nhập giá trị điều kiện"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-foreground outline-none focus:border-blue-500"
                      />

                      <button
                        onClick={() => deleteMCondition(cond.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* + Thêm điều kiện button */}
                <button
                  onClick={addMCondition}
                  className="border border-dashed border-blue-200 text-blue-500 bg-blue-50/10 hover:bg-blue-50/20 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer font-medium text-[11px] transition-colors"
                >
                  + Thêm điều kiện
                </button>
              </div>

              {/* Section 2: Hành động */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-green-600 font-bold text-[13px]">
                  <ShareNetwork size={18} weight="fill" className="text-green-500" />
                  <span>Hành động</span>
                </div>
                <div className="text-[11px] text-[#4a5568] -mt-2">
                  Thì thực hiện đồng thời các hành động bên dưới
                </div>

                {/* Dynamic Actions list */}
                <div className="flex flex-col gap-3">
                  {mAdActions.map((act, index) => (
                    <div key={act.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold">{index + 1}</span>
                          <select
                            value={act.type}
                            onChange={(e) => updateMAction(act.id, "type", e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-foreground outline-none w-32 focus:border-blue-500"
                          >
                            <option value="lark">Lark</option>
                            <option value="pause">Tắt chiến dịch</option>
                            <option value="email">Email</option>
                          </select>
                        </div>
                        <button
                          onClick={() => deleteMAction(act.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash size={14} />
                        </button>
                      </div>

                      {act.type === "lark" ? (
                        <div className="flex flex-col gap-1.5 mt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                              Gửi thông báo tới
                            </div>
                            <select className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-foreground outline-none">
                              <option value="webhook">Webhook URL</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            value={act.value}
                            onChange={(e) => updateMAction(act.id, "value", e.target.value)}
                            placeholder="Nhập webhook url bot Lark của bạn"
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-blue-500"
                          />
                        </div>
                      ) : act.type === "email" ? (
                        <div className="flex flex-col gap-1.5 mt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                              Gửi email cảnh báo tới
                            </div>
                            <input
                              type="email"
                              value={act.value}
                              onChange={(e) => updateMAction(act.id, "value", e.target.value)}
                              placeholder="Nhập email"
                              className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-500/5 text-red-500 border border-red-500/10 p-2.5 rounded-lg text-xs font-semibold mt-1">
                          Thực thi tắt chiến dịch quảng cáo tự động (PAUSED / DISABLE)
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* + Thêm hành động button */}
                <button
                  onClick={addMAction}
                  disabled={mAdActions.length >= 5}
                  className={`border border-dashed py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer font-medium text-[11px] transition-colors ${
                    mAdActions.length >= 5 
                      ? "border-slate-100 text-slate-400 bg-slate-50 cursor-not-allowed"
                      : "border-blue-200 text-blue-500 bg-blue-50/10 hover:bg-blue-50/20"
                  }`}
                >
                  + Thêm hành động ({mAdActions.length}/5)
                </button>
              </div>

              {/* Section 3: Lịch trình chạy */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-[13px]">
                  <Clock size={18} weight="fill" className="text-purple-500" />
                  <span>Lịch trình chạy</span>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  {/* Option 1: Liên tục */}
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="mAdSchedule"
                      value="continuous"
                      checked={mAdSchedule === "continuous"}
                      onChange={(e) => setMAdSchedule(e.target.value)}
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-foreground text-[11px]">Liên tục</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Lịch trình chạy thường xuyên trong mỗi 30 phút/lần
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Hàng ngày */}
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="mAdSchedule"
                      value="daily"
                      checked={mAdSchedule === "daily"}
                      onChange={(e) => setMAdSchedule(e.target.value)}
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-foreground text-[11px]">Hàng ngày</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Lịch trình chạy hàng ngày vào 00:00 tới 01:00 (chạy mỗi 30 phút/lần)
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Tùy chỉnh */}
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="mAdSchedule"
                      value="custom"
                      checked={mAdSchedule === "custom"}
                      onChange={(e) => setMAdSchedule(e.target.value)}
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-foreground text-[11px]">Tùy chỉnh</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Tùy chỉnh lịch trình để hàng ngày trong khoảng thời gian cụ thể (chạy mỗi 30 phút/lần)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Fixed Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4.5 bg-white border-t border-border">
              <button
                onClick={() => setShowManageAdModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-foreground hover:bg-slate-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => handleCreateRule("manage_ad", false)}
                disabled={saving}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-foreground hover:bg-slate-50 transition-colors font-semibold shadow-sm"
              >
                Chỉ lưu
              </button>
              <button
                onClick={() => handleCreateRule("manage_ad", true)}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md shadow-blue-500/10"
              >
                {saving ? <SpinnerGap size={16} className="animate-spin" /> : null} Lưu và kích hoạt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
