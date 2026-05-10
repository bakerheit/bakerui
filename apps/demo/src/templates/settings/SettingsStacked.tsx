/*
 * Settings template — Stacked layout (Apple System Settings / classic
 * profile pages).
 *
 * One scrollable page with each section presented as its own Card. Best
 * when sections are short, or when you want everything visible at a
 * glance without forcing the user to navigate between tabs/categories.
 */

import { Card, Stack } from "bakerui";
import {
  AppearanceSection,
  NotificationsSection,
  ProfileSection,
  SecuritySection,
} from "./sections";

export function SettingsStacked() {
  return (
    <Stack gap="6">
      <Card padded>
        <ProfileSection />
      </Card>
      <Card padded>
        <NotificationsSection />
      </Card>
      <Card padded>
        <AppearanceSection />
      </Card>
      <Card padded>
        <SecuritySection />
      </Card>
    </Stack>
  );
}
