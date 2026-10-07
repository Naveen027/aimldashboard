import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    ChevronDown,
    Clock,
    LifeBuoy,
    Mail,
    Phone,
    Send,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";
import { useDashboardTheme } from "./ThemeToggle";

/* ---------- TODO: replace these placeholders with your real contact details ---------- */
const SUPPORT_EMAIL = "support@your-domain.com";
const SUPPORT_PHONE_DISPLAY = "1800-XXX-XXXX"; // toll-free number shown to users
const SUPPORT_PHONE_TEL = "1800XXXXXXX"; // digits only, used for the tap-to-call link
const SUPPORT_HOURS = "Mon – Sat, 10:00 AM – 6:00 PM IST";

const categories = ["General question", "API keys", "Model or playground issue", "Billing and usage", "Feedback"];

const faqs = [
    {
        q: "Where do I find my API key?",
        a: "Open the API Keys page from the sidebar. Each AI model has its own key, and you can show or copy it from the model's card.",
    },
    {
        q: "How do I try a model?",
        a: "Go to the dashboard, pick a model and choose \"Try in playground\". You can test requests there before connecting your own application.",
    },
    {
        q: "My application stopped working. What should I check?",
        a: "Confirm you are using the key that belongs to the model you are calling, and that it is sent in the x-api-key header. If it still fails, contact us with the model name, the time of the error and the message you received.",
    },
    {
        q: "How long does support take to reply?",
        a: "Our team usually responds within one business day. For urgent issues, call the toll-free number during support hours.",
    },
];

function Support() {
    const { authResponse, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode: d } = useDashboardTheme();
    const userName = authResponse?.username ?? "User";

    const [searchQuery, setSearchQuery] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState(categories[0]);
    const [message, setMessage] = useState("");

    const maxLen = 1000;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSending(true);
        // TODO: send { subject, category, message } to your backend here.
        await new Promise((r) => setTimeout(r, 600));
        setSending(false);
        setSubmitted(true);
    };

    const reset = () => {
        setSubject("");
        setCategory(categories[0]);
        setMessage("");
        setSubmitted(false);
    };

    /* ---------- theme classes ---------- */
    const title = d ? "text-white" : "text-slate-900";
    const muted = d ? "text-slate-400" : "text-slate-500";
    const card = d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700";
    const inset = d ? "border-gray-700 bg-gray-900/60" : "border-slate-200 bg-slate-50";
    const field = `w-full min-w-0 rounded-[10px] border px-3 py-2.5 text-base outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm ${d
        ? "border-gray-600 bg-gray-900 text-gray-100 placeholder:text-slate-500"
        : "border-slate-200 bg-white text-slate-700 placeholder:text-slate-400"
        }`;
    const label = `mb-1.5 block text-xs font-semibold uppercase tracking-wide ${muted}`;
    const ghostBtn = `inline-flex items-center justify-center gap-1.5 !rounded-[10px] border px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-95 sm:text-sm ${d
        ? "!border-gray-600 !bg-gray-700/60 !text-gray-100 hover:!border-indigo-400/60"
        : "!border-slate-200 !bg-white !text-slate-700 hover:!border-indigo-300 hover:!text-indigo-600"
        }`;

    /* one row of contact info: icon, label, value */
    const contactRows = [
        {
            id: "email",
            Icon: Mail,
            color: "#4285f4",
            name: "Email",
            value: SUPPORT_EMAIL,
            href: `mailto:${SUPPORT_EMAIL}`,
        },
        {
            id: "phone",
            Icon: Phone,
            color: "#34a853",
            name: "Toll-free number",
            value: SUPPORT_PHONE_DISPLAY,
            href: `tel:${SUPPORT_PHONE_TEL}`,
        },
        {
            id: "hours",
            Icon: Clock,
            color: "#fbbc04",
            name: "Support hours",
            value: SUPPORT_HOURS,
            href: undefined as string | undefined,
        },
    ];

    return (
        <div
            className={`relative isolate flex min-h-screen ${d ? "theme-dark bg-[#111827] text-[#f3f4f6]" : "theme-light bg-[#f8fafc] text-[#2c3e50]"
                }`}
        >
            <style>{`
                @keyframes sp-rise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
                @keyframes sp-pop { from { opacity: 0; transform: scale(.9) } to { opacity: 1; transform: none } }
                .sp-rise { animation: sp-rise .5s cubic-bezier(.22,1,.36,1) both }
                .sp-pop { animation: sp-pop .4s cubic-bezier(.22,1,.36,1) both }
                .sp-root { overflow-x: hidden; -webkit-text-size-adjust: 100%; }
                .sp-root h2, .sp-root h3 { overflow-wrap: anywhere; }
                /* links inside the support page never get an underline */
                .sp-root a, .sp-root a:hover, .sp-root a:focus { text-decoration: none !important; }
                @media (prefers-reduced-motion: reduce) { .sp-rise, .sp-pop { animation: none } }
            `}</style>

            <UserSidebar userName={userName} onLogout={handleLogout} />

            <main className="min-h-screen min-w-0 flex-1 bg-transparent ml-[var(--user-sidebar-width,260px)] transition-[margin] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-[767px]:ml-0">
                <UserHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                <div className="sp-root mx-auto flex w-full min-w-0 max-w-[1520px] flex-col gap-3 p-3 sm:p-[15px]">
                    {/* ---------- heading ---------- */}
                    <div className="sp-rise min-w-0">
                        <h2 className="m-0 break-words [font-size:1.35rem]! sm:[font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">Support center</h2>
                        <p className="mt-0.5 mb-0 text-sm text-[color:var(--muted)]">We are here to help</p>
                    </div>

                    {/* ---------- contact support ---------- */}
                    <article
                        className={`sp-rise flex w-full min-w-0 flex-col gap-4 rounded-2xl border p-3 shadow-sm sm:p-5 ${card}`}
                        style={{ animationDelay: "60ms" }}
                    >
                        {/* <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ color: "#1ba098", background: "#1ba0981f" }}>
                                <LifeBuoy size={22} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <h3 className={`m-0 text-base font-semibold ${title}`}>Contact support</h3>
                                <p className={`m-0 text-xs sm:text-sm ${muted}`}>
                                    Talk to our team by phone or email.
                                </p>
                            </div>
                        </div> */}

                        {/* auto-fit: 1 column on phones, 2-3 as the screen gets wider */}
                        <ul className="m-0 grid w-full list-none grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-2 p-0">
                            {contactRows.map(({ id, Icon, color, name, value, href }) => (
                                <li key={id} className={`flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 ${inset}`}>
                                    <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                        style={{ color, background: `${color}1f` }}
                                    >
                                        <Icon size={18} aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{name}</div>
                                        {href ? (
                                            <a
                                                href={href}
                                                className={`block break-words text-sm font-semibold no-underline transition-colors hover:text-indigo-500 ${title}`}
                                            >
                                                {value}
                                            </a>
                                        ) : (
                                            <div className={`break-words text-sm font-semibold ${title}`}>{value}</div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className={`rounded-xl border p-3 text-xs leading-relaxed sm:text-sm ${d ? "border-indigo-400/20 bg-indigo-500/10 text-indigo-200" : "border-indigo-100 bg-indigo-50 text-indigo-800"}`}>
                            <strong>Tip:</strong> to help us resolve things faster, share the model name, the time the
                            issue happened and any error message you saw.
                        </div>
                    </article>

                    {/* form + FAQ: stacked on tablets/phones, side by side on wide screens */}
                    <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-5">
                        {/* ---------- form ---------- */}
                        <div
                            className={`sp-rise min-w-0 rounded-2xl border p-3 shadow-sm sm:p-5 xl:col-span-3 ${card}`}
                            style={{ animationDelay: "180ms" }}
                        >
                            {submitted ? (
                                <div className="sp-pop flex flex-col items-center gap-3 py-10 text-center" role="status">
                                    <span className={`flex h-14 w-14 items-center justify-center rounded-full ${d ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-600"}`}>
                                        <CheckCircle2 size={28} aria-hidden="true" />
                                    </span>
                                    <h3 className={`m-0 [font-size:22px]! font-semibold ${title}`}>Request received</h3>
                                    <p className={`m-0 max-w-sm text-sm ${muted}`}>
                                        Thanks! Your support request has been received. We usually respond within one business day.
                                    </p>
                                    <button type="button" onClick={reset} className={`mt-1 px-4 py-2 ${ghostBtn}`}>
                                        Send another request
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
                                    <div>
                                        <h3 className={`m-0 [font-size:22px]! font-semibold ${title}`}>Send us a message</h3>
                                        <p className={`m-0 mt-0.5 text-sm ${muted}`}>Tell us what you need and we will follow up.</p>
                                    </div>

                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
                                        <div className="min-w-0">
                                            <label className={label} htmlFor="support-subject">Subject</label>
                                            <input
                                                id="support-subject"
                                                className={field}
                                                required
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="How can we help?"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <label className={label} htmlFor="support-category">Topic</label>
                                            <select
                                                id="support-category"
                                                className={field}
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                            >
                                                {categories.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <label className={label} htmlFor="support-message">Message</label>
                                        <textarea
                                            id="support-message"
                                            className={`${field} resize-y`}
                                            rows={6}
                                            required
                                            maxLength={maxLen}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Describe your question or issue"
                                        />
                                        <div className={`mt-1 text-right text-xs ${muted}`}>
                                            {message.length}/{maxLen}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="inline-flex w-full items-center justify-center gap-2 !rounded-[10px] !border-transparent !bg-gradient-to-br !from-violet-500 !to-indigo-500 px-4 py-2.5 text-sm font-medium !text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
                                    >
                                        <Send size={15} aria-hidden="true" />
                                        {sending ? "Sending..." : "Send request"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* ---------- FAQ ---------- */}
                        <aside
                            className={`sp-rise min-w-0 self-start rounded-2xl border p-3 shadow-sm sm:p-5 xl:col-span-2 ${card}`}
                            style={{ animationDelay: "240ms" }}
                        >
                            <h3 className={`m-0 mb-2 [font-size:22px]! font-semibold ${title}`}>Common questions</h3>
                            <ul className="m-0 flex list-none flex-col p-0">
                                {faqs.map((f, i) => {
                                    const open = openFaq === i;
                                    return (
                                        <li
                                            key={f.q}
                                            className={`min-w-0 border-t first:border-t-0 ${d ? "border-gray-700" : "border-slate-100"}`}
                                        >
                                            <button
                                                type="button"
                                                aria-expanded={open}
                                                onClick={() => setOpenFaq(open ? null : i)}
                                                className={`flex w-full min-w-0 items-center justify-between gap-3 !rounded-[8px] !border-0 !bg-transparent py-3 text-left text-sm font-medium transition-colors hover:text-indigo-500 ${title}`}
                                            >
                                                <span className="min-w-0 break-words">{f.q}</span>
                                                <ChevronDown
                                                    size={16}
                                                    aria-hidden="true"
                                                    className={`shrink-0 transition-transform duration-300 ${muted} ${open ? "rotate-180" : ""}`}
                                                />
                                            </button>
                                            <div
                                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                                            >
                                                <div className="overflow-hidden">
                                                    <p className={`m-0 pb-3 text-sm leading-relaxed ${muted}`}>{f.a}</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Support;