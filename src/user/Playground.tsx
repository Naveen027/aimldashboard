import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Bot,
    CheckCircle2,
    Cpu,
    FileSearch,
    Fingerprint,
    ImagePlus,
    Languages,
    Loader2,
    MessageSquareText,
    Play,
    RotateCcw,
    ScanFace,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { aiModelCatalog } from "../data/aiModels";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import { useDashboardTheme } from "./ThemeToggle";

// TODO: replace this with your real API call.
// e.g. const form = new FormData(); files.forEach((f) => form.append("files", f));
//      const res = await fetch(`/api/models/${modelId}/run`, { method: "POST", body: form });
//      const data = await res.json();
//      return data.result; // return a readable string (or format the response into text here)
const runModel = async (
    modelName: string,
    input: { text: string; files: File[] }
): Promise<string> => {
    await new Promise((r) => setTimeout(r, 1200));

    const received = input.files.length
        ? input.files.map((f) => f.name).join(", ")
        : input.text.length > 120
            ? `${input.text.slice(0, 120)}...`
            : input.text;

    return [
        `API integration is pending for "${modelName}".`,
        "",
        "This is a placeholder response. Connect the real model API to get an accurate result.",
        "",
        `Input received: ${received}`,
    ].join("\n");
};

function Playground() {
    const { authResponse, logout } = useAuth();
    const { isDarkMode: d } = useDashboardTheme();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const userName = authResponse?.username ?? "Alex Johnson";

    /* ---------- state ---------- */
    const [search, setSearch] = useState("");
    const [text, setText] = useState("");
    const [files, setFiles] = useState<(File | null)[]>([null, null]);
    const [previews, setPreviews] = useState<(string | null)[]>([null, null]);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [seconds, setSeconds] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    /* ---------- selected model (from ?model=<id>) ---------- */
    const modelLook: Record<string, { color: string; Icon: LucideIcon }> = {
        "kartavya-face-matching": { color: "#4285f4", Icon: ScanFace },
        "muzzle-print-identification": { color: "#34a853", Icon: Fingerprint },
        "grievance-management": { color: "#fbbc04", Icon: MessageSquareText },
        "government-order-information": { color: "#9c27b0", Icon: FileSearch },
        "ai-enabled-chatbots": { color: "#1ba098", Icon: Bot },
        "kannada-kasthuri": { color: "#ea4335", Icon: Languages },
    };

    const model = aiModelCatalog.find((m) => m.id === params.get("model")) ?? aiModelCatalog[0];
    const visibleModels = aiModelCatalog.filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()));

    // what the model needs: text, one image, or two images (face matching)
    const kind = model.id === "kartavya-face-matching" ? "two-images" : model.type === "vision" ? "image" : "text";
    const slots = kind === "two-images" ? [1, 2] : kind === "image" ? [1] : [];
    const hint = {
        text: "Type or paste your input below.",
        image: "Upload an image for the model to analyse.",
        "two-images": "Upload two face images to compare them.",
    }[kind];

    const canRun = !loading && (kind === "text" ? text.trim().length > 0 : slots.every((_, i) => files[i]));

    /* ---------- effects ---------- */
    // clear everything when the user switches model
    const reset = () => {
        setText("");
        setFiles([null, null]);
        setOutput(null);
        setSeconds(null);
        setError(null);
    };
    useEffect(reset, [model.id]);

    // create image previews, and free them again when the files change
    useEffect(() => {
        const urls = files.map((f) => (f ? URL.createObjectURL(f) : null));
        setPreviews(urls);
        return () => urls.forEach((u) => u && URL.revokeObjectURL(u));
    }, [files]);

    /* ---------- handlers ---------- */
    const setFile = (index: number, file: File | undefined | null) => {
        if (!file || !file.type.startsWith("image/")) return;
        setFiles((prev) => prev.map((f, i) => (i === index ? file : f)));
    };

    const handleRun = async () => {
        setLoading(true);
        setError(null);
        setOutput(null);
        const start = performance.now();
        try {
            const res = await runModel(model.name, {
                text,
                files: files.slice(0, slots.length).filter(Boolean) as File[],
            });
            setOutput(res);
            setSeconds((performance.now() - start) / 1000);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    /* ---------- theme classes ---------- */
    const title = d ? "text-white" : "text-slate-900";
    const muted = d ? "text-slate-400" : "text-slate-500";
    const card = d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700";
    const inset = d ? "border-gray-700 bg-gray-900/60" : "border-slate-200 bg-slate-50";
    const bone = d ? "bg-gray-700" : "bg-slate-200";
    const field = d
        ? "border-gray-700 bg-gray-900 text-gray-100 placeholder:text-slate-500"
        : "border-slate-200 bg-white text-slate-700 placeholder:text-slate-400";

    /* ---------- UI ---------- */
    return (
        <div
            className={`flex min-h-screen ${d ? "theme-dark bg-[#111827] text-[#f3f4f6]" : "theme-light bg-[#f8fafc] text-[#2c3e50]"
                }`}
        >
            <style>{`
                @keyframes pg-rise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
                @keyframes pg-fade { from { opacity: 0 } to { opacity: 1 } }
                .pg-rise { animation: pg-rise .5s cubic-bezier(.22,1,.36,1) both }
                .pg-fade { animation: pg-fade .35s ease-out both }
                @media (prefers-reduced-motion: reduce) { .pg-rise, .pg-fade { animation: none } }
            `}</style>

            <UserSidebar userName={userName} onLogout={handleLogout} />

            <main className="min-h-screen min-w-0 flex-1 ml-[var(--user-sidebar-width,260px)] transition-[margin] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-[767px]:ml-0">
                <UserHeader searchQuery={search} onSearchChange={setSearch} />

                <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-0  p-[15px]">
                    {/* ---------- heading ---------- */}
                    <header className="pg-rise mb-2">
                        <h2 className="m-0 break-words [font-size:1.35rem]! sm:[font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">Playground</h2>
                        <p className="mt-0.5 mb-0 text-sm text-[color:var(--muted)]">Pick a model, give it an input and see what it returns.</p>
                    </header>

                    {/* ---------- model picker ---------- */}
                    <nav
                        className="pg-rise flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        style={{ animationDelay: "60ms" }}
                        aria-label="Choose a model"
                    >
                        {visibleModels.map((m) => {
                            const on = m.id === model.id;
                            const { color, Icon } = modelLook[m.id] ?? { color: "#6366f1", Icon: Cpu };
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setParams({ model: m.id }, { replace: true })}
                                    className={`inline-flex shrink-0 items-center gap-2 !rounded-[10px] border px-3.5 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${on
                                        ? "!border-transparent !bg-gradient-to-br !from-violet-500 !to-indigo-500 !text-white shadow-md shadow-indigo-500/30"
                                        : d
                                            ? "!border-gray-700 !bg-gray-800 !text-gray-200 hover:-translate-y-0.5 hover:!border-indigo-400/40"
                                            : "!border-slate-200 !bg-white !text-slate-700 hover:-translate-y-0.5 hover:!border-indigo-200 hover:shadow-sm"
                                        }`}
                                >
                                    <span style={{ color: on ? "#fff" : color }}>
                                        <Icon size={16} aria-hidden="true" />
                                    </span>
                                    {m.name}
                                </button>
                            );
                        })}
                        {visibleModels.length === 0 && <p className={`m-0 text-sm ${muted}`}>No models found.</p>}
                    </nav>

                    {/* ---------- workspace (re-animates when the model changes) ---------- */}
                    <section key={model.id} className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
                        {/* input */}
                        <div className={`pg-rise flex flex-col rounded-2xl border p-4 ${card}`}>
                            <h3 className={`m-0 [font-size:22px]! font-semibold ${title}`}>{model.name}</h3>
                            <p className={`m-0 mt-0.5 text-sm ${muted}`}>{model.category}</p>
                            <p className={`mb-3 mt-3 text-sm ${muted}`}>{hint}</p>

                            {kind === "text" ? (
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={9}
                                    placeholder="Enter your input here..."
                                    className={`w-full resize-y rounded-xl border p-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${field}`}
                                />
                            ) : (
                                <div className={`grid grid-cols-1 gap-3 ${slots.length > 1 ? "sm:grid-cols-2" : ""}`}>
                                    {slots.map((n, i) => (
                                        <label
                                            key={n}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDragIndex(i);
                                            }}
                                            onDragLeave={() => setDragIndex(null)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setDragIndex(null);
                                                setFile(i, e.dataTransfer.files[0]);
                                            }}
                                            className={`group flex h-52 p-2 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed text-sm transition-all duration-300 hover:border-indigo-500 ${dragIndex === i
                                                ? "scale-[1.02] border-indigo-500 bg-indigo-500/10"
                                                : d
                                                    ? "border-gray-600 bg-gray-900/60 text-slate-400"
                                                    : "border-slate-300 bg-slate-50 text-slate-500"
                                                }`}
                                        >
                                            {previews[i] ? (
                                                <img src={previews[i]!} alt={`Preview ${n}`} className="pg-fade h-full w-full object-contain" />
                                            ) : (
                                                <>
                                                    <ImagePlus
                                                        size={26}
                                                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-indigo-500"
                                                        aria-hidden="true"
                                                    />
                                                    <span>{slots.length > 1 ? `Image ${n}` : "Image"}: click or drop here</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => setFile(i, e.target.files?.[0])}
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleRun}
                                    disabled={!canRun}
                                    className="inline-flex flex-1 items-center justify-center gap-2 !rounded-[10px] !border-transparent !bg-gradient-to-br !from-violet-500 !to-indigo-500 px-4 py-2.5 text-sm font-medium !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    {loading ? (
                                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                                    ) : (
                                        <Play size={14} fill="currentColor" aria-hidden="true" />
                                    )}
                                    {loading ? "Running..." : "Run model"}
                                </button>
                                <button
                                    type="button"
                                    onClick={reset}
                                    className={`inline-flex items-center gap-1.5 !rounded-[10px] border px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${d
                                        ? "!border-gray-600 !bg-gray-700/60 !text-gray-100 hover:!border-indigo-400/60"
                                        : "!border-slate-200 !bg-white !text-slate-700 hover:!border-indigo-300 hover:!text-indigo-600"
                                        }`}
                                >
                                    <RotateCcw size={14} aria-hidden="true" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* result */}
                        <div className={`pg-rise flex flex-col rounded-2xl border p-4 ${card}`} style={{ animationDelay: "80ms" }}>
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <h3 className={`m-0 [font-size:22px]! font-semibold ${title}`}>Result</h3>
                                {output && seconds !== null && (
                                    <span
                                        className={`pg-fade inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${d ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                                            }`}
                                    >
                                        <CheckCircle2 size={13} aria-hidden="true" /> Done in {seconds.toFixed(1)}s
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                // loading skeleton
                                <div className={`flex-1 animate-pulse space-y-3 rounded-xl border p-4 ${inset}`}>
                                    <div className={`h-3 w-2/3 rounded ${bone}`} />
                                    <div className={`h-3 w-full rounded ${bone}`} />
                                    <div className={`h-3 w-5/6 rounded ${bone}`} />
                                    <div className={`h-3 w-1/2 rounded ${bone}`} />
                                </div>
                            ) : error ? (
                                <p
                                    className={`pg-fade m-0 rounded-xl border p-4 text-sm ${d ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700"
                                        }`}
                                >
                                    {error}
                                </p>
                            ) : output ? (
                                <pre className={`pg-fade m-0 max-h-[460px] flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border p-4 text-xs leading-relaxed ${inset}`}>
                                    {output}
                                </pre>
                            ) : (
                                // empty state
                                <div className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center ${inset}`}>
                                    <Sparkles size={26} className="text-indigo-500" aria-hidden="true" />
                                    <p className={`m-0 text-sm ${muted}`}>Run the model to see its output here.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Playground;