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

/**
 * A theme preset's identifier. Maps to a CSS file that registers
 * `[data-theme-preset="<id>"]` selectors. Built-in presets ship in
 * `bakerui/themes/*.css`; custom presets can use any string.
 */
export type ThemePreset = string;

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (next: ThemeName) => void;
  toggleTheme: () => void;
  preset: ThemePreset | undefined;
  setPreset: (next: ThemePreset | undefined) => void;
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
  /** Initial mode; ignored if `theme` is controlled. */
  defaultTheme?: ThemeName;
  /** Controlled mode (light/dark). */
  theme?: ThemeName;
  /** Called when the mode changes. */
  onThemeChange?: (theme: ThemeName) => void;
  /** Initial preset; ignored if `preset` is controlled. */
  defaultPreset?: ThemePreset;
  /** Controlled preset. Set `undefined` for the built-in look. */
  preset?: ThemePreset;
  /** Called when the preset changes. */
  onPresetChange?: (preset: ThemePreset | undefined) => void;
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
  defaultPreset,
  preset: controlledPreset,
  onPresetChange,
  tokens,
  className,
  style,
  children,
}: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<ThemeName>(defaultTheme);
  const theme = controlledTheme ?? internalTheme;

  const [internalPreset, setInternalPreset] = useState<ThemePreset | undefined>(
    defaultPreset,
  );
  const preset = controlledPreset ?? internalPreset;

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

  const setPreset = useCallback(
    (next: ThemePreset | undefined) => {
      if (controlledPreset === undefined) setInternalPreset(next);
      onPresetChange?.(next);
    },
    [controlledPreset, onPresetChange],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, preset, setPreset }),
    [theme, setTheme, toggleTheme, preset, setPreset],
  );

  // Reflect mode + preset on <html> so portal-rendered components inherit them.
  useEffect(() => {
    const root = document.documentElement;
    const prevTheme = root.getAttribute("data-theme");
    const prevPreset = root.getAttribute("data-theme-preset");
    root.setAttribute("data-theme", theme);
    if (preset) root.setAttribute("data-theme-preset", preset);
    else root.removeAttribute("data-theme-preset");
    return () => {
      if (prevTheme === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", prevTheme);
      if (prevPreset === null) root.removeAttribute("data-theme-preset");
      else root.setAttribute("data-theme-preset", prevPreset);
    };
  }, [theme, preset]);

  const mergedStyle = tokens ? { ...(style ?? {}), ...tokens } : style;

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={cx("bui-root bui-root-page", className)}
        data-theme={theme}
        data-theme-preset={preset || undefined}
        style={mergedStyle as CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
