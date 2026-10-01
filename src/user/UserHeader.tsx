import { Bell, Search } from "lucide-react";
import { GlobalThemeToggle } from "./ThemeToggle";

interface UserHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

function UserHeader({
    searchQuery,
    onSearchChange,
}: UserHeaderProps) {
    return (
        <header className="sticky top-0 z-20 flex h-[54px] items-center justify-end gap-0 border-b border-[#eef0f4] bg-white px-8 py-2 shadow-[0_1px_3px_rgba(20,30,60,0.08)] transition-colors duration-300 max-[768px]:gap-3 max-[768px]:px-4 [.theme-dark_&]:border-[#374151] [.theme-dark_&]:bg-[#1f2937] [.theme-dark_&]:shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center rounded bg-transparent p-0 text-[#2c3e50] transition-colors duration-300 hover:bg-[#f5f6fa] [.theme-dark_&]:text-[#f3f4f6] [.theme-dark_&]:hover:bg-[#111827]"
                aria-label="Notifications"
            >
                <Bell strokeWidth={1.5} aria-hidden="true" />
            </button>
            <div className="relative ml-5 w-full max-w-[300px] max-[768px]:ml-0 max-[768px]:max-w-full">
                <label
                    htmlFor="search-input"
                    className="sr-only"
                >
                    Search
                </label>
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 z-[3] h-[18px] w-[18px] -translate-y-1/2 text-[#5f6b7a] [.theme-dark_&]:text-[#c1c8d3]"
                    size={18}
                    aria-hidden="true"
                />
                <input
                    id="search-input"
                    type="search"
                    className="w-full rounded-md border border-[#e0e6ed] bg-[#f5f6fa] py-2 pl-[42px] pr-3 text-sm text-[#2c3e50] transition-all duration-300 placeholder:text-[#5f6b7a] placeholder:opacity-100 focus:border-[#1ba098] focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(27,160,152,0.1)] max-[576px]:px-2.5 max-[576px]:py-1.5 max-[576px]:pl-[42px] max-[576px]:text-xs [.theme-dark_&]:border-[#374151] [.theme-dark_&]:bg-[#111827] [.theme-dark_&]:text-[#f3f4f6] [.theme-dark_&]:placeholder:text-[#d1d5db] [.theme-dark_&]:focus:bg-[#111827]"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                />
            </div>
            <GlobalThemeToggle />
        </header>
    );
}

export default UserHeader;