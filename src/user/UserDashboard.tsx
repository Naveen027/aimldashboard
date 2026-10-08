import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Cpu,
    Search,
    X,
    Check,
    ArrowUpRight,
    LayoutGrid,
    Sparkles,
    Plug,
    ShieldCheck,
    Target,
    Play,
    ScanFace,
    Fingerprint,
    MessageSquareText,
    FileSearch,
    Bot,
    Languages,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { aiModelCatalog, type AiModelType } from "../data/aiModels";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import AIModelsDashboard from "./AIModelsDashboard";
import { useDashboardTheme } from "./ThemeToggle";

/* ------------------------------------------------------------------
   @keyframes cannot be written as Tailwind utility classes, so only the
   keyframe definitions stay here. Every animation / style that used to be
   in the old <style> block is now applied with Tailwind classes below.
------------------------------------------------------------------- */
const KEYFRAMES = `
@keyframes ud-rise  { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
@keyframes ud-fade  { from { opacity: 0 } to { opacity: 1 } }
@keyframes ud-pop   { from { opacity: 0; transform: translateY(16px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes ud-sheet { from { opacity: 0; transform: translateY(100%) } to { opacity: 1; transform: translateY(0) } }
@keyframes ud-fill  { from { width: 0 } to { width: var(--ud-w) } }
@keyframes ud-sheen { 0% { transform: translateX(-120%) } 100% { transform: translateX(220%) } }
@keyframes ud-ping  { 0% { transform: scale(1); opacity: .6 } 80%,100% { transform: scale(2.4); opacity: 0 } }
`;

/* animation utilities (replace the old .ud-* classes; reduced-motion kept) */
const ANIM = {
    rise: "animate-[ud-rise_.55s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:!animate-none",
    fade: "animate-[ud-fade_.25s_ease-out_both] motion-reduce:!animate-none",
    // bottom sheet on mobile (<640px), pop on sm and up
    pop: "animate-[ud-sheet_.35s_cubic-bezier(.22,1,.36,1)_both] sm:animate-[ud-pop_.35s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:!animate-none",
    fill: "animate-[ud-fill_1s_cubic-bezier(.22,1,.36,1)_.35s_both] motion-reduce:!animate-none",
    sheen: "animate-[ud-sheen_2.4s_ease-in-out_infinite] motion-reduce:!animate-none",
    ping: "animate-[ud-ping_1.8s_cubic-bezier(0,0,.2,1)_infinite] motion-reduce:!animate-none",
};

interface UserModel {
    id: string;
    name: string;
    type: AiModelType;
    group: string;
    category: string;
    summary: string;
    parsed: { intro: string; sections: { title: string; items: string[] }[]; links: string[] };
    highlights: string[];
    provider: string;
    version: string;
    status: "active" | "disabled";
    usagePercentage: number;
    rpmLimit: number;
    requests: number;
    latency: number;
    lastUpdated: string;
}

function UserDashboard() {
    const { authResponse, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode: d } = useDashboardTheme();
    const { pathname } = useLocation();

    /* ---------- state ---------- */
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const showAIModelsDashboard = pathname === "/my-profile";
    const userName = authResponse?.username ?? "Alex Johnson";

    /* ---------- model data ---------- */
    const models = useMemo<UserModel[]>(() => {
        const ctaLabels = ["Request Demo", "Technical Documentation", "Case Studies"];
        const groups: Record<string, string> = { llm: "Language", vision: "Vision", embedding: "Data", other: "Other" };
        const usage = [48.3, 21.8, 15.2, 14.7, 14.7, 12.4];
        const rpm = [10000, 5000, 3000, 8000, 8000, 6000];
        const requests = [48210, 21840, 15230, 14720, 14690, 12410];
        const latency = [820, 312, 245, 410, 395, 360];

        // split the raw description into intro text, titled sections and CTA links
        const parseDescription = (raw: string) => {
            const intro: string[] = [];
            const sections: { title: string; items: string[] }[] = [];
            const links: string[] = [];
            let current: { title: string; items: string[] } | null = null;

            const lines = raw
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);

            for (const line of lines) {
                if (ctaLabels.includes(line)) {
                    links.push(line);
                    continue;
                }
                if (line.endsWith(":")) {
                    current = { title: line.slice(0, -1), items: [] };
                    sections.push(current);
                    continue;
                }
                const text = line.replace(/^[-•]\s*/, "");
                if (current) current.items.push(text);
                else intro.push(text);
            }
            return { intro: intro.join(" "), sections, links };
        };

        return aiModelCatalog.map((model, i) => {
            const parsed = parseDescription(model.description);
            return {
                ...model,
                group: groups[model.type] ?? "Other",
                summary: parsed.intro || model.category,
                parsed,
                provider: "Karnataka AI Cell",
                version: model.highlights.find((h) => h.startsWith("v"))?.slice(1) ?? "1.0",
                status: "active",
                usagePercentage: usage[i] ?? 0,
                rpmLimit: rpm[i] ?? 5000,
                requests: requests[i] ?? 0,
                latency: latency[i] ?? 0,
                lastUpdated: "2026-10-01",
            };
        });
    }, []);

    const filters = ["All", ...Array.from(new Set(models.map((m) => m.group)))];

    const q = searchQuery.trim().toLowerCase();
    const filteredModels = models.filter((m) => {
        const matchesFilter = activeFilter === "All" || m.group === activeFilter;
        const matchesSearch =
            !q || [m.name, m.category, m.summary, m.group].some((f) => String(f ?? "").toLowerCase().includes(q));
        return matchesFilter && matchesSearch;
    });

    /* ---------- selected model (modal) ---------- */
    // same icons and colours as the API Keys page (one per model)
    const modelLook: Record<string, { color: string; Icon: LucideIcon }> = {
        "kartavya-face-matching": { color: "#4285f4", Icon: ScanFace },
        "muzzle-print-identification": { color: "#34a853", Icon: Fingerprint },
        "grievance-management": { color: "#fbbc04", Icon: MessageSquareText },
        "government-order-information": { color: "#9c27b0", Icon: FileSearch },
        "ai-enabled-chatbots": { color: "#1ba098", Icon: Bot },
        "kannada-kasthuri": { color: "#ea4335", Icon: Languages },
    };
    const typeLabels: Record<string, string> = { llm: "Language", vision: "Vision", embedding: "Embedding", other: "Other" };

    const getModelIcon = (m: UserModel): LucideIcon => modelLook[m.id]?.Icon ?? Cpu;
    const getModelColor = (m: UserModel): string => modelLook[m.id]?.color ?? "#6366f1";
    const getTypeLabel = (type: string) => typeLabels[type] ?? "Other";

    // icon + label for each section tab in the modal
    const getSectionMeta = (title: string): { label: string; Icon: LucideIcon } => {
        const t = title.toLowerCase();
        if (t.includes("capabilit")) return { label: "Capabilities", Icon: Sparkles };
        if (t.includes("integration")) return { label: "Integration", Icon: Plug };
        if (t.includes("governance")) return { label: "Governance", Icon: ShieldCheck };
        if (t.includes("outcome")) return { label: "Outcome", Icon: Target };
        return { label: title, Icon: Sparkles };
    };

    const selectedModel = models.find((m) => m.id === selectedModelId) || null;
    const SelectedIcon = selectedModel ? getModelIcon(selectedModel) : Cpu;
    const tabs = selectedModel
        ? [
            { key: "overview", label: "Overview", Icon: LayoutGrid },
            ...selectedModel.parsed.sections.map((s) => ({ key: s.title, ...getSectionMeta(s.title) })),
        ]
        : [];

    /* ---------- effects ---------- */
    useEffect(() => {
        setActiveTab("overview");
    }, [selectedModelId]);

    // close modal on Escape + lock page scroll while it is open
    useEffect(() => {
        if (!selectedModelId) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedModelId(null);
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [selectedModelId]);

    /* ---------- handlers ---------- */
    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const openPlayground = (model: UserModel) => {
        navigate(`/playground?model=${encodeURIComponent(model.id)}`);
    };

    /* ---------- theme classes ---------- */
    const title = d ? "text-[#f3f4f6]" : "text-slate-900";
    const faint = d ? "text-[#c1c8d3]" : "text-slate-500";
    const surface = d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700";
    const tileModal = d ? "bg-gray-800 ring-gray-700" : "bg-slate-50 ring-slate-100";

    const cardStatus = {
        active: d ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700",
        disabled: d ? "bg-rose-500/15 text-rose-300" : "bg-rose-50 text-rose-700",
    };
    const heroStatus = {
        active: "bg-green-100 text-green-800",
        disabled: "bg-red-100 text-red-800",
    };

    // note: `!rounded-[10px]` replaces the old global `:where(.ud-scope) button { border-radius: 10px }`
    const primaryBtn =
        "!rounded-[10px] bg-indigo-500 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none";

    /* ---------- UI ---------- */
    return (
        <div
            className={`ud-scope relative isolate flex min-h-screen transition-[background-color,color] duration-[700ms] ${d ? "theme-dark bg-[#111827] text-[#f3f4f6]" : "theme-light bg-[#f8fafc] text-[#2c3e50]"
                }`}
        >
            {/* keyframes only (cannot be expressed as utility classes) */}
            <style>{KEYFRAMES}</style>

            <UserSidebar userName={userName} onLogout={handleLogout} />

            <main className="relative z-[2] min-h-screen min-w-0 flex-1 bg-transparent ml-[var(--user-sidebar-width,260px)] transition-[margin] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-[767px]:ml-0">
                <UserHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                <div className="ud-root relative z-[2] [padding:15px]! text-inherit overflow-x-hidden [-webkit-text-size-adjust:100%] [&_h2]:[overflow-wrap:anywhere] [&_h3]:[overflow-wrap:anywhere]">
                    {showAIModelsDashboard ? (
                        <div className={ANIM.fade}>
                            <AIModelsDashboard />
                        </div>
                    ) : (
                        <div className="mx-auto w-full max-w-[1520px]">
                            {/* ---------- Heading ---------- */}
                            <div className="min-w-0 mb-2">
                                <h2 className={`m-0 break-words [font-size:1.35rem]! sm:[font-size:1.6rem]! !font-bold leading-tight tracking-tight ${title}`}>Hi, {userName}!</h2>
                                <p className="mt-0.5 mb-0 text-sm text-[color:var(--muted)]">Pick a model and try it in the playground.</p>
                            </div>

                            {/* ---------- Profile cards ---------- */}
                            {/* <section className={`${ANIM.rise} mb-3 w-full grid grid-cols-1 gap-2 sm:grid-cols-3`} style={{ animationDelay: "70ms" }}>
                                <ProfileCard label="Account Status" value="Active" Icon={UserCheck} healthy live />
                                <ProfileCard label="Joined" value="October 2023" Icon={CalendarDays} />
                                <ProfileCard label="Last Activity" value="5 mins ago" Icon={Clock} />
                            </section> */}

                            {/* ---------- Search + filter pills ---------- */}
                            <div className={`${ANIM.rise} mb-3 flex flex-wrap items-center gap-2`} style={{ animationDelay: "140ms" }}>
                                <label
                                    className={`group flex h-10 w-full !flex max-w-[340px] items-center gap-2 rounded-[10px] border px-3 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${d ? "border-gray-700 bg-gray-800" : "border-slate-200 bg-white"
                                        }`}
                                >
                                    <Search
                                        size={16}
                                        className={`shrink-0 transition-colors group-focus-within:text-indigo-500 ${d ? "text-[#c1c8d3]" : "text-slate-500"}`}
                                        aria-hidden="true"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search models..."
                                        className={`min-w-0 flex-1 !rounded-[10px] !border-0 !bg-transparent !p-0 !shadow-none text-base outline-none placeholder:text-slate-400 sm:text-sm ${d ? "text-gray-100" : "text-slate-700"
                                            }`}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            aria-label="Clear search"
                                            className={`!rounded-[10px] p-1 transition-colors ${d
                                                ? "text-slate-400 hover:bg-gray-700 hover:text-slate-200"
                                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                }`}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </label>

                                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter models">
                                    {filters.map((f) => {
                                        const on = activeFilter === f;
                                        return (
                                            <button
                                                key={f}
                                                type="button"
                                                role="tab"
                                                aria-selected={on}
                                                onClick={() => setActiveFilter(f)}
                                                className={`!rounded-[10px] border px-3 py-1.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 active:scale-95 ${on
                                                    ? "!border-transparent !bg-gradient-to-br !from-violet-500 !to-indigo-500 !text-white shadow-md shadow-indigo-500/30"
                                                    : d
                                                        ? "!border-gray-700 !bg-gray-800 !text-gray-200 hover:-translate-y-0.5 hover:!border-indigo-400/40"
                                                        : "!border-slate-200 !bg-white !text-slate-700 hover:-translate-y-0.5 hover:!border-indigo-200 hover:shadow-sm"
                                                    }`}
                                            >
                                                {f}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ---------------------AI models heaidngs------ */}

                            {/* ---------- Cards ---------- */}
                            {filteredModels.length > 0 ? (
                                <div
                                    key={`${activeFilter}-${q}`}
                                    className="grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3 sm:gap-4"
                                >
                                    {filteredModels.map((model, i) => {
                                        const isActive = model.status === "active";
                                        const ModelIcon = getModelIcon(model);
                                        const modelColor = getModelColor(model);
                                        return (
                                            <div
                                                key={model.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedModelId(model.id)}
                                                onKeyDown={(e) => {
                                                    // ignore key presses coming from the nested button
                                                    if (e.target !== e.currentTarget) return;
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        setSelectedModelId(model.id);
                                                    }
                                                }}
                                                style={{ animationDelay: `${(i + 3) * 70}ms` }}
                                                className={`${ANIM.rise} ![gap:10px] group relative flex min-w-0 cursor-pointer flex-col rounded-[16px]! border p-3 shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/20 active:scale-[.99] ${model.status === "disabled" ? "opacity-80" : ""
                                                    } ${surface}`}
                                            >
                                                {/* animated border: draws left → right on hover */}
                                                <span
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute -inset-px z-10 rounded-[16px]! border-2 border-indigo-500 [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300 ease-out group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
                                                />

                                                {/* top row: icon + title + status pill */}
                                                <div className="mb-2 flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                                                    <div className="flex min-w-0 flex-1 basis-[180px] items-center gap-3 sm:gap-4">
                                                        <span
                                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-[52px] sm:w-[52px]"
                                                            style={{ color: modelColor, background: `${modelColor}1f` }}
                                                        >
                                                            <ModelIcon size={24} strokeWidth={2} aria-hidden="true" />
                                                        </span>
                                                        <div className="min-w-0">
                                                            <h3 className={`m-0 break-words !text-[20px] font-semibold leading-snug ${title}`}>
                                                                {model.name}
                                                            </h3>
                                                            <p className={`m-0 mt-1 break-words text-[13px] sm:text-sm ${d ? "text-slate-300" : "text-slate-500"}`}>
                                                                v{model.version} · {getTypeLabel(model.type)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${cardStatus[model.status]}`}
                                                    >
                                                        {isActive && (
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className={`${ANIM.ping} absolute inline-flex h-full w-full rounded-full bg-emerald-500`} />
                                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                                            </span>
                                                        )}
                                                        {isActive ? "Active" : "Disabled"}
                                                    </span>
                                                </div>

                                                {/* stat tiles */}
                                                <div className="mb-2 grid grid-cols-2 gap-2.5 sm:gap-3">
                                                    <div className={`min-w-0 rounded-[10px]! px-3 py-2 ${d ? "bg-gray-900/60" : "bg-slate-50"}`}>
                                                        <div className={`text-xs sm:text-sm ${faint}`}>Requests</div>
                                                        <div className={`truncate text-base font-bold sm:text-lg ${title}`}>
                                                            {model.requests.toLocaleString("en-IN")}
                                                        </div>
                                                    </div>
                                                    <div className={`min-w-0 rounded-[10px]! px-3 py-2 ${d ? "bg-gray-900/60" : "bg-slate-50"}`}>
                                                        <div className={`text-xs sm:text-sm ${faint}`}>Latency</div>
                                                        <div className={`truncate text-base font-bold sm:text-lg ${title}`}>
                                                            {model.latency} ms
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* action button (does not bubble to the card) */}
                                                <button
                                                    type="button"
                                                    disabled={!isActive}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openPlayground(model);
                                                    }}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    className={`mt-auto inline-flex w-full items-center justify-center gap-1.5 !rounded-[14px] border px-3 py-2.5 text-center text-sm font-medium transition-all duration-200 active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed sm:text-base ${isActive
                                                        ? "border-indigo-500 bg-indigo-500 text-white hover:border-indigo-600 hover:bg-indigo-600 focus-visible:ring-indigo-500/30"
                                                        : d
                                                            ? "border-gray-600 bg-gray-700/60 text-gray-100"
                                                            : "border-slate-200 bg-white text-slate-800"
                                                        }`}
                                                >
                                                    <Play size={12} fill="currentColor" aria-hidden="true" />
                                                    Try in playground
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={`${ANIM.rise} rounded-[16px] border border-dashed p-4 text-center ${surface}`}>
                                    <p className={`m-0 mb-1 text-base font-semibold ${title}`}>No models found</p>
                                    <p className={`m-0 mb-3 text-sm ${faint}`}>Try a different keyword or filter.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setActiveFilter("All");
                                        }}
                                        className={`px-4 py-2 text-sm font-medium ${primaryBtn}`}
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            )}

                            {/* ---------- Model Modal ---------- */}
                            {selectedModel && (
                                <div
                                    className={`${ANIM.fade} fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/60 backdrop-blur-md sm:items-center sm:p-4`}
                                    onClick={() => setSelectedModelId(null)}
                                >
                                    <div
                                        role="dialog"
                                        aria-modal="true"
                                        aria-label={selectedModel.name}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`${ANIM.pop} relative flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-3xl shadow-2xl ring-1 sm:max-h-[90dvh] sm:rounded-3xl ${d ? "bg-gray-900 text-gray-100 ring-gray-700" : "bg-white text-slate-700 ring-black/5"
                                            }`}
                                    >
                                        {/* close */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedModelId(null)}
                                            aria-label="Close model details"
                                            className="group absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center !rounded-[10px] bg-white/20 text-white backdrop-blur transition-all duration-300 hover:rotate-90 hover:scale-110 hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 active:scale-95 motion-reduce:hover:rotate-0 sm:h-8 sm:w-8"
                                        >
                                            <X size={16} aria-hidden="true" />
                                        </button>

                                        {/* hero */}
                                        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-4 pb-4 pt-4 md:px-6">
                                            <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                                            <span className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-white/10" />

                                            <div className="relative flex items-center gap-3 pr-11">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-indigo-200/50 backdrop-blur sm:h-12 sm:w-12">
                                                    <SelectedIcon size={24} strokeWidth={2} aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0">
                                                    <h2 className="m-0 break-words [font-size:clamp(1rem,.9rem+.8vw,1.25rem)]! font-semibold leading-tight text-white">
                                                        {selectedModel.name}
                                                    </h2>
                                                    <p className="m-0 mt-0.5 break-words text-xs text-white/80">
                                                        {selectedModel.provider} • {selectedModel.category}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative mt-3 flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase text-white ring-1 ring-indigo-200/40">
                                                    {getTypeLabel(selectedModel.type)}
                                                </span>
                                                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-indigo-200/40">
                                                    v{selectedModel.version}
                                                </span>
                                                <span
                                                    className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-[10px]! px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${heroStatus[selectedModel.status]}`}
                                                >
                                                    {selectedModel.status === "active" ? "✓" : "○"} {selectedModel.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* tabs */}
                                        {tabs.length > 1 && (
                                            <div
                                                role="tablist"
                                                className={`flex shrink-0 gap-1.5 overflow-x-auto overscroll-x-contain border-b px-4 py-2.5 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${d ? "border-gray-800" : "border-slate-100"
                                                    }`}
                                            >
                                                {tabs.map(({ key, label, Icon }) => {
                                                    const on = activeTab === key;
                                                    return (
                                                        <button
                                                            key={key}
                                                            role="tab"
                                                            aria-selected={on}
                                                            type="button"
                                                            onClick={() => setActiveTab(key)}
                                                            className={`inline-flex shrink-0 items-center gap-1.5 !rounded-[10px] px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:py-1.5 ${on
                                                                ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                                                                : d
                                                                    ? "bg-gray-800 text-slate-300 hover:bg-gray-700"
                                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                                }`}
                                                        >
                                                            <Icon size={14} aria-hidden="true" />
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* content */}
                                        <div
                                            key={`${selectedModel.id}-${activeTab}`}
                                            className={`${ANIM.fade} min-h-[140px] flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:min-h-[250px] md:px-6 [scrollbar-width:thin]`}
                                        >
                                            {activeTab === "overview" ? (
                                                <div className="space-y-4">
                                                    {selectedModel.parsed.intro && (
                                                        <p className={`mt-2 text-sm leading-relaxed ${d ? "text-slate-300" : "text-slate-600"}`}>
                                                            {selectedModel.parsed.intro}
                                                        </p>
                                                    )}

                                                    {selectedModel.highlights.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {selectedModel.highlights.map((h) => (
                                                                <span
                                                                    key={h}
                                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${d
                                                                        ? "bg-indigo-500/10 text-indigo-200 ring-indigo-400/20"
                                                                        : "bg-indigo-50 text-indigo-700 ring-indigo-100"
                                                                        }`}
                                                                >
                                                                    {h}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* metrics */}
                                                    <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3">
                                                        <div className={`min-w-0 rounded-[12px] p-3 ring-1 ${tileModal}`}>
                                                            <div className={`text-[11px] uppercase tracking-wide ${faint}`}>Usage</div>
                                                            <div className={`text-lg font-bold sm:text-xl ${title}`}>
                                                                {selectedModel.usagePercentage.toFixed(1)}%
                                                            </div>
                                                            <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${d ? "bg-gray-700" : "bg-slate-200"}`}>
                                                                <div
                                                                    className={`${ANIM.fill} relative h-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500`}
                                                                    style={
                                                                        {
                                                                            ["--ud-w" as string]: `${Math.min(selectedModel.usagePercentage, 100)}%`,
                                                                            width: `${Math.min(selectedModel.usagePercentage, 100)}%`,
                                                                        } as CSSProperties
                                                                    }
                                                                >
                                                                    <span className={`${ANIM.sheen} absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent`} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {[
                                                            { label: "RPM Limit", value: `${(selectedModel.rpmLimit / 1000).toFixed(1)}K` },
                                                            { label: "Requests", value: selectedModel.requests.toLocaleString("en-IN") },
                                                            { label: "Latency", value: `${selectedModel.latency} ms` },
                                                        ].map((m) => (
                                                            <div key={m.label} className={`min-w-0 rounded-[12px] p-3 ring-1 ${tileModal}`}>
                                                                <div className={`text-[11px] uppercase tracking-wide ${faint}`}>{m.label}</div>
                                                                <div className={`truncate text-lg font-bold sm:text-xl ${title}`}>{m.value}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {selectedModel.parsed.links.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedModel.parsed.links.map((l) => (
                                                                <button
                                                                    key={l}
                                                                    type="button"
                                                                    className={`inline-flex items-center gap-1 !rounded-[10px] border px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 active:scale-95 sm:py-1.5 ${d
                                                                        ? "border-indigo-400/20 bg-indigo-500/10 text-indigo-200"
                                                                        : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                                        }`}
                                                                >
                                                                    {l} <ArrowUpRight size={12} aria-hidden="true" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className={`text-center text-[11px] ${faint}`}>
                                                        Last Updated: {selectedModel.lastUpdated}
                                                    </div>
                                                </div>
                                            ) : (
                                                <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
                                                    {selectedModel.parsed.sections
                                                        .find((s) => s.title === activeTab)
                                                        ?.items.map((item, idx) => (
                                                            <li
                                                                key={`${item}-${idx}`}
                                                                style={{ animationDelay: `${idx * 40}ms` }}
                                                                className={`${ANIM.rise} flex items-start gap-2.5 rounded-[12px] border p-3 text-[13px] leading-snug transition-all duration-200 ${d
                                                                    ? "border-gray-700 bg-gray-800 text-slate-200 hover:border-indigo-400/30"
                                                                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60"
                                                                    }`}
                                                            >
                                                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                                                                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                                                                </span>
                                                                <span className="min-w-0 break-words">{item}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* footer (respects iPhone home bar) */}
                                        <div
                                            className={`flex shrink-0 flex-wrap gap-2 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6 ${d ? "border-gray-800" : "border-slate-100"
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedModelId(null)}
                                                className={`min-w-[110px] flex-1 !rounded-[10px] border px-2.5 py-2.5 text-center text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 sm:min-w-[80px] sm:py-2 ${d
                                                    ? "border-gray-600 bg-gray-700/60 text-gray-200"
                                                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700"
                                                    }`}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                disabled={selectedModel.status === "disabled"}
                                                onClick={() => openPlayground(selectedModel)}
                                                className={`inline-flex min-w-[110px] flex-1 items-center justify-center gap-1.5 !rounded-[10px] px-2.5 py-2.5 text-xs font-medium sm:min-w-[80px] sm:py-2 ${primaryBtn}`}
                                            >
                                                <Play size={12} fill="currentColor" aria-hidden="true" />
                                                Try in playground
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default UserDashboard;