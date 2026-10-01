import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

interface ThemeContextValue {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(
        () => localStorage.getItem("dashboard-theme") === "dark"
    );

    useEffect(() => {
        localStorage.setItem(
            "dashboard-theme",
            isDarkMode ? "dark" : "light"
        );
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleTheme: () => setIsDarkMode((current) => !current),
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useDashboardTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useDashboardTheme must be used inside ThemeProvider");
    }

    return context;
}

export function GlobalThemeToggle() {
    const { isDarkMode, toggleTheme } = useDashboardTheme();

    return <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />;
}

export interface ThemeToggleProps {
    isDarkMode: boolean;
    onToggle: () => void;
}

export function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
    return (
        <button
            className="ml-5 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-lg transition-[background-color,transform] duration-300 hover:rotate-[18deg] hover:scale-[1.08] hover:bg-[#f5f6fa] focus:rotate-[18deg] focus:scale-[1.08] focus:bg-[#f5f6fa] focus:outline-none max-[768px]:ml-0 [.theme-dark_&]:hover:bg-[#111827] [.theme-dark_&]:focus:bg-[#111827]"
            type="button"
            onClick={onToggle}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDarkMode ? "☀️" : "🌙"}
        </button>
    );
}

export default ThemeToggle;
