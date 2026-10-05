import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    LoaderCircle,
    Moon,
    ShieldCheck,
    Sun,
    UserRound,
} from "lucide-react";
import seal from "../assets/Seal_of_Karnataka.svg";
import { useAuth } from "../context/AuthContext";
import { useDashboardTheme } from "../user/ThemeToggle";
import type { SignupData } from "../services/authService";

type AuthRole = "user" | "admin";

interface AuthPageProps {
    mode: "login" | "signup";
}

function AuthPage({ mode }: AuthPageProps) {
    const { login, signup } = useAuth();
    const { isDarkMode, toggleTheme } = useDashboardTheme();
    const navigate = useNavigate();
    const [role, setRole] = useState<AuthRole>("user");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [signupComplete, setSignupComplete] = useState(false);
    const isLogin = mode === "login";

    const selectRole = (selectedRole: AuthRole) => {
        setRole(selectedRole);
        setError("");

        if (isLogin) {
            setEmail(selectedRole === "admin" ? "admin" : "user");
            setPassword(selectedRole === "admin" ? "admin@123" : "user@123");
        }
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!isLogin && password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const response = await login(email.trim(), password, false);

                if (response.status !== 200 || !response.role) {
                    setError(response.message || "Unable to sign in.");
                    return;
                }

                navigate(
                    response.role === "admin"
                        ? "/admin-dashboard"
                        : "/user-dashboard"
                );
                return;
            }

            const signupData: SignupData = {
                username: name.trim(),
                gmail: email.trim(),
                phone: "",
                password,
            };
            await signup(signupData);
            setSignupComplete(true);
            window.setTimeout(() => navigate("/"), 1200);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // text-base on small screens prevents iOS Safari from zooming on focus;
    // min-h-11 (44px) keeps the touch target comfortable.
    const inputBase =
        "block w-full min-w-0 min-h-11 rounded-xl border px-3.5 py-2.5 text-base outline-none transition focus:ring-2 sm:text-sm";
    const inputTheme = isDarkMode
        ? "!border-slate-700 !bg-[#0b1220] !text-white placeholder:!text-slate-400 focus:!border-indigo-400 focus:!ring-indigo-400/30"
        : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20";
    const inputClass = `${inputBase} ${inputTheme}`;

    return (
        <div
            className={`grid min-h-screen [min-height:100dvh] w-full overflow-x-hidden lg:grid-cols-2 ${
                isDarkMode
                    ? "theme-dark bg-[#020617] text-white"
                    : "theme-light bg-white text-[#111827]"
            }`}
        >
            {/* Brand panel: desktop / large tablet landscape only */}
            <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white lg:flex xl:p-14 2xl:p-16">
                <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-2xl" />
                <img
                    src={seal}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 w-[min(72%,520px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.12] mix-blend-screen"
                />
                <div className="relative flex items-center gap-3 text-xl font-bold 2xl:text-2xl">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                        <img
                            src={seal}
                            alt=""
                            aria-hidden="true"
                            className="size-9 object-contain"
                        />
                    </span>
                    Karnataka AI Cell
                </div>
                <div className="relative py-10">
                    <h2 className="text-3xl font-bold leading-tight xl:text-4xl 2xl:text-5xl">
                        AI models.
                        <br />
                        One simple platform.
                    </h2>
                    <p className="mt-4 max-w-md text-base text-white/80 2xl:max-w-lg 2xl:text-lg">
                        Chat, code, vision, voice, translation and embeddings,
                        all built in-house and ready to use.
                    </p>
                </div>
                <p className="relative text-sm text-white/60">
                    © 2026 Karnataka AI Cell
                </p>
            </section>

            <main className="relative flex min-h-screen [min-height:100dvh] min-w-0 flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pb-8 sm:pt-6 lg:px-10 xl:px-14">
                {signupComplete && (
                    <div
                        role="status"
                        className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-50 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg sm:inset-x-auto sm:right-5 sm:top-5 sm:text-left"
                    >
                        Sign up successful! Redirecting to sign in…
                    </div>
                )}

                {/* Top bar: brand (mobile/tablet) + theme toggle */}
                <div className="flex w-full items-center justify-between gap-3 lg:justify-end">
                    <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
                        <span
                            className={`inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full sm:size-10 ${
                                isDarkMode ? "bg-white/10" : "bg-indigo-50"
                            }`}
                        >
                            <img
                                src={seal}
                                alt=""
                                aria-hidden="true"
                                className="size-7 object-contain sm:size-8"
                            />
                        </span>
                        <span className="truncate text-base font-bold sm:text-lg">
                            Karnataka AI Cell
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={
                            isDarkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-[#475569] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-white dark:hover:bg-slate-800"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* Form area: centered when there's room, scrolls naturally when not
                    (small phones, landscape, on-screen keyboard open) */}
                <div className="flex flex-1 items-center justify-center py-6 sm:py-8">
                    <div className="w-full max-w-md 2xl:max-w-lg">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl 2xl:text-4xl">
                            {isLogin ? "Welcome back" : "Create your account"}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 2xl:text-base">
                            {isLogin
                                ? "Sign in to continue to Karnataka AI Cell."
                                : "Get started with Karnataka AI Cell."}
                        </p>

                        {isLogin && (
                            <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80 sm:mt-6">
                                {(["user", "admin"] as const).map(
                                    (selectedRole) => (
                                        <button
                                            key={selectedRole}
                                            type="button"
                                            onClick={() =>
                                                selectRole(selectedRole)
                                            }
                                            aria-pressed={
                                                role === selectedRole
                                            }
                                            className={`auth-role-button flex min-h-10 items-center justify-center gap-2 rounded-[10px] py-2 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                                role === selectedRole
                                                    ? isDarkMode
                                                        ? "bg-slate-700/70 text-white shadow-none  !rounded-[10px]"
                                                        : "bg-white text-slate-900 shadow-sm "
                                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            {selectedRole === "admin" ? (
                                                <ShieldCheck
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <UserRound
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {selectedRole}
                                        </button>
                                    )
                                )}
                            </div>
                        )}

                        <form
                            onSubmit={submit}
                            className="mt-5 space-y-4 sm:mt-6"
                        >
                            {!isLogin && (
                                <div>
                                    <label
                                        htmlFor="auth-name"
                                        className="mb-1.5 block text-sm font-medium"
                                    >
                                        Full name
                                    </label>
                                    <input
                                        id="auth-name"
                                        required
                                        autoComplete="name"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        className={inputClass}
                                        placeholder="Jane Doe"
                                    />
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="auth-username-email"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    Email
                                </label>
                                <input
                                    id="auth-username-email"
                                    required
                                    type={isLogin ? "text" : "email"}
                                    inputMode={isLogin ? undefined : "email"}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    autoComplete={isLogin ? "username" : "email"}
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder={
                                        isLogin
                                            ? "Enter your email"
                                            : "you@company.com"
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="auth-password"
                                    className="mb-1.5 block text-sm font-medium"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="auth-password"
                                        required
                                        type={showPassword ? "text" : "password"}
                                        autoComplete={
                                            isLogin
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        className={`${inputClass} !pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (visible) => !visible
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-white"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p
                                    role="alert"
                                    className="break-words rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                                >
                                    {error}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={loading || signupComplete}
                                className="inline-flex min-h-11 w-full items-center  !rounded-[10px] justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-base font-semibold text-white transition hover:from-indigo-700 hover:to-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                            >
                                {loading && (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {isLogin ? "Sign in" : "Create account"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            {isLogin
                                ? "Don't have an account? "
                                : "Already have an account? "}
                            <Link
                                to={isLogin ? "/signup" : "/"}
                                className="inline-block py-1 !font-medium !text-indigo-600 !no-underline hover:!underline dark:!text-indigo-400"
                            >
                                {isLogin ? "Sign up" : "Sign in"}
                            </Link>
                        </p>

                        {/* Footer copyright for screens where the brand panel is hidden */}
                        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 lg:hidden">
                            © 2026 Karnataka AI Cell
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AuthPage;