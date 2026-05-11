import rawChangelog from "../../../CHANGELOG.md?raw";

/**
 * The set of section labels we recognize, matching Keep a Changelog v1.1.
 * Anything outside this set is silently ignored — parser is lenient on
 * purpose so a typo in the source doesn't break the demo build.
 */
export type EntryKind =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "security"
  | "deprecated";

const KNOWN_KINDS: ReadonlyArray<EntryKind> = [
  "added",
  "changed",
  "fixed",
  "removed",
  "security",
  "deprecated",
];

/** Inline content inside a bullet — a flat sequence of text / code / link / strong runs. */
export type InlineNode =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "link"; text: string; href: string };

export interface Entry {
  kind: EntryKind;
  content: InlineNode[];
}

export interface EntryGroup {
  kind: EntryKind;
  entries: Entry[];
}

export interface Release {
  /** "Unreleased" or a semver string like "0.4.0". */
  version: string;
  /** ISO date if present in the heading (e.g. "## [0.4.0] - 2026-05-10"). */
  date?: string;
  groups: EntryGroup[];
  /** Anchor-friendly slug derived from the version. */
  id: string;
}

/**
 * Parse a Keep-a-Changelog markdown source into a typed structure.
 *
 * Recognised shape:
 *   ## [Unreleased]
 *   ## [x.y.z] - YYYY-MM-DD
 *   ### Added / Changed / Fixed / Removed / Security / Deprecated
 *   - bullet text with `code`, **strong**, and [links](https://…)
 *
 * Anything that doesn't fit (intro paragraphs, blockquotes, prose between
 * the heading and the first ###) is dropped — the demo only renders the
 * structured release entries.
 */
export function parseChangelog(md: string): Release[] {
  const lines = md.split(/\r?\n/);
  const releases: Release[] = [];
  let current: Release | null = null;
  let currentGroup: EntryGroup | null = null;

  for (const line of lines) {
    const versionMatch = /^##\s+\[([^\]]+)\](?:\s*[-–]\s*(.+))?\s*$/.exec(line);
    if (versionMatch) {
      const version = versionMatch[1].trim();
      const date = versionMatch[2]?.trim();
      current = {
        version,
        date,
        groups: [],
        id: slug(version),
      };
      currentGroup = null;
      releases.push(current);
      continue;
    }
    if (!current) continue;

    const groupMatch = /^###\s+([A-Za-z]+)\s*$/.exec(line);
    if (groupMatch) {
      const candidate = groupMatch[1].toLowerCase() as EntryKind;
      if (KNOWN_KINDS.includes(candidate)) {
        currentGroup = { kind: candidate, entries: [] };
        current.groups.push(currentGroup);
      } else {
        currentGroup = null;
      }
      continue;
    }

    const bulletMatch = /^[-*]\s+(.+)$/.exec(line);
    if (bulletMatch && currentGroup) {
      currentGroup.entries.push({
        kind: currentGroup.kind,
        content: parseInline(bulletMatch[1]),
      });
      continue;
    }

    // Continuation lines for a previous bullet (indented body). Append to
    // the last entry's text with a leading space so multi-line bullets
    // wrap naturally.
    const continuationMatch = /^\s{2,}(.+)$/.exec(line);
    if (continuationMatch && currentGroup && currentGroup.entries.length > 0) {
      const last = currentGroup.entries[currentGroup.entries.length - 1];
      const tail = parseInline(" " + continuationMatch[1]);
      last.content.push(...tail);
      continue;
    }
  }

  return releases;
}

/**
 * Tokenize one bullet's text into inline runs. Order matters here — the
 * regex alternates so an inline `code` containing brackets won't be
 * mistaken for a link.
 */
function parseInline(text: string): InlineNode[] {
  const tokens: InlineNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({ kind: "text", value: text.slice(cursor, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith("`")) {
      tokens.push({ kind: "code", value: raw.slice(1, -1) });
    } else if (raw.startsWith("**")) {
      tokens.push({ kind: "strong", value: raw.slice(2, -2) });
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(raw);
      if (linkMatch) {
        tokens.push({ kind: "link", text: linkMatch[1], href: linkMatch[2] });
      }
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) {
    tokens.push({ kind: "text", value: text.slice(cursor) });
  }
  return tokens;
}

function slug(version: string): string {
  return version
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const CHANGELOG: Release[] = parseChangelog(rawChangelog);
