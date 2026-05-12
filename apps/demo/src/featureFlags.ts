/**
 * Demo-site feature flags driven by Vite env vars.
 *
 * Set in `.env.production` (or via the deploy workflow) to control what
 * ships on the public GitHub Pages site. Defaults:
 *
 *  - In dev (`vite dev`) everything is visible — `import.meta.env.DEV === true`.
 *  - In a production build, packs are hidden unless explicitly flipped on.
 *
 * `showAddons` is the master switch. When `false`, the "Addon Packs" sidebar
 * entry and every per-pack section disappear, regardless of the per-pack
 * flags. When `true`, each pack still respects its individual flag.
 */

function readFlag(name: string, fallback: boolean): boolean {
  const raw = (import.meta.env as Record<string, unknown>)[name];
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const v = raw.toLowerCase().trim();
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
  }
  return fallback;
}

const defaultEnabled = import.meta.env.DEV;

const showAddons = readFlag("VITE_SHOW_ADDONS", defaultEnabled);

export interface FeatureFlags {
  showAddons: boolean;
  showAudioPack: boolean;
  showVideoPack: boolean;
  showCalendarPack: boolean;
  showCommercePack: boolean;
  showPosPack: boolean;
  showChatPack: boolean;
}

export const flags: FeatureFlags = {
  showAddons,
  showAudioPack: showAddons && readFlag("VITE_SHOW_PACK_AUDIO", defaultEnabled),
  showVideoPack: showAddons && readFlag("VITE_SHOW_PACK_VIDEO", defaultEnabled),
  showCalendarPack:
    showAddons && readFlag("VITE_SHOW_PACK_CALENDAR", defaultEnabled),
  showCommercePack:
    showAddons && readFlag("VITE_SHOW_PACK_COMMERCE", defaultEnabled),
  showPosPack: showAddons && readFlag("VITE_SHOW_PACK_POS", defaultEnabled),
  showChatPack: showAddons && readFlag("VITE_SHOW_PACK_CHAT", defaultEnabled),
};
