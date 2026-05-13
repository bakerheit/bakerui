import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Versioned-documentation plumbing.
 *
 * Each `DocSection` and `PropDef` can be tagged with `since` and
 * `deprecated` semver strings. A `<VersionProvider>` higher in the tree
 * holds the version the reader is "viewing as," and the doc components
 * filter / badge / strike-through their content accordingly.
 *
 * The version list is derived from the parsed `CHANGELOG` — anything we
 * surface here matches a real release (or `"Unreleased"` for in-flight
 * changes).
 *
 * Default visibility rules:
 *   - `since` omitted → treated as the library's earliest version,
 *     always visible, no badge rendered.
 *   - `since` set     → hidden when the selected version is older than
 *     `since`; otherwise rendered with a `"v<since>+"` badge.
 *   - `deprecated` set → when the selected version is `deprecated` or
 *     newer, the entry shows with a deprecation indicator; before that,
 *     it renders normally.
 */

export type DocVersion = string;

export interface DocVersionContextValue {
  /** The version the reader is currently viewing as. */
  version: DocVersion;
  /** Latest version in the list — also the default. */
  latest: DocVersion;
  /** Ordered list of selectable versions (latest first). */
  versions: DocVersion[];
  setVersion: (v: DocVersion) => void;
}

const DocVersionContext = createContext<DocVersionContextValue | null>(null);

export interface VersionProviderProps {
  /** Available versions, in any order. They'll be sorted internally. */
  versions: DocVersion[];
  /** Optional default — falls back to the latest entry. */
  defaultVersion?: DocVersion;
  children: ReactNode;
}

export function VersionProvider({
  versions,
  defaultVersion,
  children,
}: VersionProviderProps) {
  const sorted = useMemo(
    () => [...versions].sort((a, b) => -compareVersions(a, b)),
    [versions],
  );
  // "Latest" means latest *released* version — skip the leading "Unreleased"
  // entry so the version picker defaults to a real shipped release rather
  // than the in-flight one. Fall back to whatever's first if every entry is
  // Unreleased (shouldn't happen, but keeps the type total).
  const latest =
    sorted.find((v) => v !== "Unreleased") ?? sorted[0] ?? "0.0.0";
  const [version, setVersion] = useState<DocVersion>(defaultVersion ?? latest);

  const value = useMemo<DocVersionContextValue>(
    () => ({
      version,
      latest,
      versions: sorted,
      setVersion,
    }),
    [version, latest, sorted],
  );

  return (
    <DocVersionContext.Provider value={value}>
      {children}
    </DocVersionContext.Provider>
  );
}

/**
 * Read the current doc version context. Returns `null` when used outside
 * a provider — callers should handle that as "show everything" so docs
 * still work on pages that haven't opted into the version dropdown yet.
 */
export function useDocVersion(): DocVersionContextValue | null {
  return useContext(DocVersionContext);
}

/* ------------------------------------------------------------------ */
/* Comparison + visibility helpers                                    */
/* ------------------------------------------------------------------ */

/**
 * Compare two version strings. `"Unreleased"` sorts above every released
 * version. Plain semver compares numerically segment-by-segment;
 * non-numeric segments fall back to lexicographic compare so weird
 * tags like `"0.5.0-rc.1"` don't crash.
 */
export function compareVersions(a: DocVersion, b: DocVersion): number {
  if (a === b) return 0;
  if (a === "Unreleased") return 1;
  if (b === "Unreleased") return -1;
  const ap = a.split(".");
  const bp = b.split(".");
  const len = Math.max(ap.length, bp.length);
  for (let i = 0; i < len; i++) {
    const av = ap[i] ?? "0";
    const bv = bp[i] ?? "0";
    const an = Number(av);
    const bn = Number(bv);
    if (Number.isFinite(an) && Number.isFinite(bn)) {
      if (an !== bn) return an < bn ? -1 : 1;
    } else if (av !== bv) {
      return av < bv ? -1 : 1;
    }
  }
  return 0;
}

export interface VersionGate {
  since?: DocVersion;
  deprecated?: DocVersion;
}

/**
 * Decide how a versioned entry should render at the current view version.
 *
 * - `hidden`     → the entry shouldn't appear at all (added after).
 * - `deprecated` → render with a strike-through / banner.
 * - `visible`    → render normally.
 */
export function entryStateAt(
  gate: VersionGate,
  current: DocVersion,
): "hidden" | "deprecated" | "visible" {
  if (gate.since && compareVersions(current, gate.since) < 0) {
    return "hidden";
  }
  if (gate.deprecated && compareVersions(current, gate.deprecated) >= 0) {
    return "deprecated";
  }
  return "visible";
}
