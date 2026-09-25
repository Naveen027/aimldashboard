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
            className="theme-toggle"
            type="button"
            onClick={onToggle}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDarkMode ? "☀️" : "🌙"}
        </button>
    );
}

export default ThemeToggle;
