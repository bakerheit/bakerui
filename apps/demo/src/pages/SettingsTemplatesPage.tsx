import { useState } from "react";
import { Heading, Stack, Text } from "bakerui";
import { PageLayout } from "../PageLayout";
import { SettingsSidebar } from "../templates/settings/SettingsSidebar";
import { SettingsStacked } from "../templates/settings/SettingsStacked";
import { SettingsTabs } from "../templates/settings/SettingsTabs";
import { TemplatePicker, type TemplateOption } from "./TemplatePicker";

type LayoutId = "sidebar" | "tabs" | "stacked";

const LAYOUTS: TemplateOption<LayoutId>[] = [
  {
    id: "sidebar",
    label: "Sidebar",
    description: "Vertical category nav, content pane on the right",
    inspiration: "Linear, GitHub, Notion",
  },
  {
    id: "tabs",
    label: "Tabs",
    description: "Horizontal tabs at the top, single section visible at a time",
    inspiration: "Stripe, Vercel project settings",
  },
  {
    id: "stacked",
    label: "Stacked",
    description: "Every section as a Card on a single scrollable page",
    inspiration: "Apple System Settings, classic profile pages",
  },
];

export function SettingsTemplatesPage() {
  const [active, setActive] = useState<LayoutId>("sidebar");

  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Settings templates</Heading>
          <Text tone="muted">
            The same content (Profile, Notifications, Appearance, Security) shown three different
            ways so you can compare layouts side-by-side. Pick the one that fits your information
            density.
          </Text>
        </Stack>

        <Stack gap="3">
          <TemplatePicker options={LAYOUTS} active={active} onChange={setActive} />
        </Stack>

        <div className="settings-template-preview">
          {active === "sidebar" && <SettingsSidebar />}
          {active === "tabs" && <SettingsTabs />}
          {active === "stacked" && <SettingsStacked />}
        </div>

        <Text tone="muted" size="sm">
          Source lives in <code>apps/demo/src/templates/settings/</code>. Sections are extracted
          into <code>sections.tsx</code> so each template file is just the layout pattern.
        </Text>
      </Stack>
    </PageLayout>
  );
}
