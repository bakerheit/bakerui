/*
 * Settings template — Sidebar layout (Linear / GitHub / Notion style).
 *
 * Vertical category nav on the left, content pane on the right. Best
 * when there are many categories; users can scan them quickly. The nav
 * stays sticky so it's reachable while the content pane scrolls.
 *
 * Two-column on desktop; collapses to a stacked tabs-row + content on
 * narrow screens (tabs feel more native to mobile than a hidden drawer).
 */

import { useState } from "react";
import { Card, Stack, Text } from "bakerui";
import {
  AppearanceSection,
  NotificationsSection,
  ProfileSection,
  SECTION_IDS,
  SECTIONS,
  SecuritySection,
} from "./sections";

type SectionId = keyof typeof SECTION_IDS;

const SECTION_COMPONENTS: Record<SectionId, () => JSX.Element> = {
  profile: ProfileSection,
  notifications: NotificationsSection,
  appearance: AppearanceSection,
  security: SecuritySection,
};

export function SettingsSidebar() {
  const [active, setActive] = useState<SectionId>("profile");
  const ActiveSection = SECTION_COMPONENTS[active];

  return (
    <div className="settings-sidebar-template">
      <aside className="settings-sidebar-template__nav" aria-label="Settings sections">
        <Stack gap="1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              data-active={active === s.id || undefined}
              className="settings-sidebar-template__nav-item"
            >
              <span className="settings-sidebar-template__nav-label">{s.label}</span>
              <Text tone="muted" size="xs" className="settings-sidebar-template__nav-desc">
                {s.description}
              </Text>
            </button>
          ))}
        </Stack>
      </aside>

      <Card padded className="settings-sidebar-template__content">
        <ActiveSection />
      </Card>
    </div>
  );
}
