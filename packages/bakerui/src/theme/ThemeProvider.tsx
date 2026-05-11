import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

export function ThemeProvider(props: ThemeProviderProps) {
  const {
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
  } = props;

  // Detect controlled-ness from prop *presence*, not value. Otherwise a
  // parent that controls `preset` and wants to clear it by passing
  // `preset={undefined}` falls into the `controlledPreset ?? internalPreset`
  // fallback and the stale internal value sticks. The pattern matches how
  // React itself resolves controlled vs uncontrolled inputs.
  const isThemeControlledRef = useRef("theme" in props);
  const isPresetControlledRef = useRef("preset" in props);
  const isThemeControlled = isThemeControlledRef.current;
  const isPresetControlled = isPresetControlledRef.current;

  const [internalTheme, setInternalTheme] = useState<ThemeName>(defaultTheme);
  const theme = isThemeControlled ? (controlledTheme as ThemeName) : internalTheme;

  const [internalPreset, setInternalPreset] = useState<ThemePreset | undefined>(
    defaultPreset,
  );
  const preset = isPresetControlled ? controlledPreset : internalPreset;

  const setTheme = useCallback(
    (next: ThemeName) => {
      if (!isThemeControlled) setInternalTheme(next);
      onThemeChange?.(next);
    },
    [isThemeControlled, onThemeChange],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const setPreset = useCallback(
    (next: ThemePreset | undefined) => {
      if (!isPresetControlled) setInternalPreset(next);
      onPresetChange?.(next);
    },
    [isPresetControlled, onPresetChange],
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
    const prevColorScheme = root.style.colorScheme;
    const prevBgColor = root.style.backgroundColor;
    root.setAttribute("data-theme", theme);
    if (preset) root.setAttribute("data-theme-preset", preset);
    else root.removeAttribute("data-theme-preset");

    // Declare the current color-scheme to the browser. Without this iOS
    // Safari's status bar tinting ignores theme-color in some edge cases
    // (notably when the OS-level color scheme conflicts with what we're
    // actively rendering). It also makes scrollbars and form-control
    // defaults pick the right palette.
    root.style.colorScheme = theme === "dark" ? "dark" : "light";

    // Sync <meta name="theme-color"> with the resolved page bg so mobile
    // browser chrome (iOS Safari URL bar + status bar, Android status
    // bar) tints to match. Without this, themes that paint a fancy
    // background on .bui-root-page (gradients, etc.) leave iOS unable to
    // sample a representative color and it falls back to white.
    //
    // iOS Safari is finicky about how it picks up theme-color updates:
    // mutating an existing meta's `content` attribute is sometimes
    // ignored. The reliable pattern is to remove ALL existing
    // theme-color metas and append a new one each time the theme changes
    // — Safari treats the new element as a fresh parse.
    const bg = getComputedStyle(root).getPropertyValue("--bui-color-bg").trim();

    // Paint the bg color onto <html> directly so iOS Safari's status-bar
    // sampler sees a solid color at the top of the document. Theme CSS
    // can paint fancier backgrounds on .bui-root-page (gradients, etc.)
    // but iOS often samples the underlying html element when deciding
    // status bar tint, especially when the page uses
    // background-attachment:fixed on a descendant.
    if (bg) root.style.backgroundColor = bg;

    const prevMetas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    const prevContents = prevMetas.map((m) => m.getAttribute("content"));
    prevMetas.forEach((m) => m.remove());
    let addedMeta: HTMLMetaElement | null = null;
    if (bg) {
      addedMeta = document.createElement("meta");
      addedMeta.setAttribute("name", "theme-color");
      addedMeta.setAttribute("content", bg);
      document.head.appendChild(addedMeta);
    }

    return () => {
      if (prevTheme === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", prevTheme);
      if (prevPreset === null) root.removeAttribute("data-theme-preset");
      else root.setAttribute("data-theme-preset", prevPreset);
      root.style.colorScheme = prevColorScheme;
      root.style.backgroundColor = prevBgColor;
      addedMeta?.remove();
      // Restore any pre-existing theme-color metas that were removed.
      prevMetas.forEach((m, i) => {
        const content = prevContents[i];
        if (content !== null) m.setAttribute("content", content);
        document.head.appendChild(m);
      });
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
