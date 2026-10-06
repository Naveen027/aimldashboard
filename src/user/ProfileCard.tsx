
import type { LucideIcon } from "lucide-react";
import { useDashboardTheme } from "./ThemeToggle";

interface ProfileCardProps {
    label: string;
    value: string;
    Icon: LucideIcon;
    gradient?: string;
    /** shows a green pulse dot next to the value (for status) */
    live?: boolean;
}

function ProfileCard({
    label,
    value,
    Icon,
    gradient = "from-violet-500 to-indigo-500",
    live = false,
}: ProfileCardProps) {
    const { isDarkMode: d } = useDashboardTheme();

    return (
        <div
            className={`group flex min-w-0 items-center gap-2.5 rounded-xl border p-3 transition-shadow hover:shadow-md max-[360px]:flex-col max-[360px]:items-start sm:gap-4 sm:p-5 lg:p-6 ${
                d
                    ? "border-gray-700 bg-gray-800 text-gray-100"
                    : "border-slate-200 bg-white text-slate-700"
            }`}
        >
            {/* Icon */}
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg text-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-[50px] sm:w-[50px] sm:text-2xl ${gradient}`}
            >
                <Icon
                    size={20}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="sm:h-6 sm:w-6"
                />
            </span>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div
                    className={`truncate text-xs sm:text-[15px] ${
                        d ? "text-slate-400" : "text-slate-500"
                    }`}
                >
                    {label}
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    {live && (
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                    )}

                    <span
                        className={`truncate text-lg font-bold leading-tight sm:text-2xl lg:text-[25px] ${
                            d ? "text-white" : "text-slate-900"
                        }`}
                    >
                        {value}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProfileCard;
