import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export type ThemeName = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (next: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

export interface ThemeProviderProps {
  /** Initial theme; ignored if `theme` is controlled. */
  defaultTheme?: ThemeName;
  /** Controlled theme. */
  theme?: ThemeName;
  /** Called when user toggles the theme. */
  onThemeChange?: (theme: ThemeName) => void;
  /**
   * Inline token overrides applied to the wrapper. Keys are CSS variable
   * names (e.g. "--bui-color-accent"). Lets consumers tweak tokens without
   * writing CSS files.
   */
  tokens?: Record<string, string>;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function ThemeProvider({
  defaultTheme = "light",
  theme: controlledTheme,
  onThemeChange,
  tokens,
  className,
  style,
  children,
}: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<ThemeName>(defaultTheme);
  const theme = controlledTheme ?? internalTheme;

  const setTheme = useCallback(
    (next: ThemeName) => {
      if (controlledTheme === undefined) setInternalTheme(next);
      onThemeChange?.(next);
    },
    [controlledTheme, onThemeChange],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  // Also reflect on <html> so portal-rendered components inherit the theme.
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute("data-theme");
    root.setAttribute("data-theme", theme);
    return () => {
      if (prev === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", prev);
    };
  }, [theme]);

  const mergedStyle = tokens ? { ...(style ?? {}), ...tokens } : style;

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={cx("bui-root", className)}
        data-theme={theme}
        style={mergedStyle as CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
