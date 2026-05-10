/*
 * Settings template — Tabs layout (Stripe / Vercel project settings).
 *
 * Horizontal tabs at the top, content below. Best when categories are
 * few enough to fit in a row, and you want to keep the user's eye
 * focused on a single section at a time.
 */

import { Card, Tabs } from "bakerui";
import {
  AppearanceSection,
  NotificationsSection,
  ProfileSection,
  SECTIONS,
  SecuritySection,
} from "./sections";

const SECTION_COMPONENTS = {
  profile: <ProfileSection />,
  notifications: <NotificationsSection />,
  appearance: <AppearanceSection />,
  security: <SecuritySection />,
} as const;

export function SettingsTabs() {
  return (
    <Card padded>
      <Tabs defaultValue="profile">
        <Tabs.List>
          {SECTIONS.map((s) => (
            <Tabs.Trigger key={s.id} value={s.id}>
              {s.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {SECTIONS.map((s) => (
          <Tabs.Panel key={s.id} value={s.id}>
            <div style={{ paddingTop: "var(--bui-space-5)" }}>{SECTION_COMPONENTS[s.id]}</div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Card>
  );
}
