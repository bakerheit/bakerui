/*
 * Shared content sections for the Settings page templates.
 *
 * Each template (Sidebar, Tabs, Stacked) reuses these so the only
 * meaningful difference between templates is the layout pattern itself.
 * Sections are presentational only — no real state, no validation, no
 * persistence. They're meant to be copied into a real app and wired up.
 */

import { useState } from "react";
import {
  Avatar,
  Button,
  Field,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  Toggle,
} from "bakerui";

export const SECTION_IDS = {
  profile: "settings-profile",
  notifications: "settings-notifications",
  appearance: "settings-appearance",
  security: "settings-security",
} as const;

export const SECTIONS: Array<{ id: keyof typeof SECTION_IDS; label: string; description: string }> =
  [
    { id: "profile", label: "Profile", description: "Public info and contact details" },
    { id: "notifications", label: "Notifications", description: "How and when we reach you" },
    { id: "appearance", label: "Appearance", description: "Theme and display preferences" },
    { id: "security", label: "Security", description: "Password, two-factor, and sessions" },
  ];

export function ProfileSection() {
  const [name, setName] = useState("Jamie Park");
  const [email, setEmail] = useState("jamie@example.com");
  const [bio, setBio] = useState(
    "Designer building tools for small teams. Coffee, climbing, and CSS.",
  );

  return (
    <Stack gap="5">
      <Stack gap="1">
        <Heading level={2} size="lg">
          Profile
        </Heading>
        <Text tone="muted" size="sm">
          This is how you'll appear to other people in your workspace.
        </Text>
      </Stack>

      <HStack gap="4" align="center">
        <Avatar name={name} size="xl" tone="accent" />
        <Stack gap="2">
          <HStack gap="2">
            <Button variant="secondary" size="sm">
              Upload photo
            </Button>
            <Button variant="ghost" size="sm">
              Remove
            </Button>
          </HStack>
          <Text tone="muted" size="xs">
            Recommended: square JPG or PNG, at least 256×256.
          </Text>
        </Stack>
      </HStack>

      <Field label="Display name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Field label="Bio" hint="A short blurb shown on your profile page.">
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={160}
        />
      </Field>

      <HStack gap="2" justify="flex-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Save changes</Button>
      </HStack>
    </Stack>
  );
}

export function NotificationsSection() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <Stack gap="5">
      <Stack gap="1">
        <Heading level={2} size="lg">
          Notifications
        </Heading>
        <Text tone="muted" size="sm">
          Choose what reaches your inbox and which ones we send straight to your devices.
        </Text>
      </Stack>

      <Stack gap="3">
        <SettingRow
          title="Weekly digest"
          description="A Monday-morning summary of what changed in your workspace last week."
        >
          <Toggle checked={emailDigest} onChange={(e) => setEmailDigest(e.target.checked)} aria-label="Weekly digest" />
        </SettingRow>
        <SettingRow
          title="Mentions and replies"
          description="Email me whenever someone @mentions me or replies to my comments."
        >
          <Toggle checked={mentions} onChange={(e) => setMentions(e.target.checked)} aria-label="Mentions and replies" />
        </SettingRow>
        <SettingRow
          title="Product updates"
          description="Occasional emails when we ship something noteworthy."
        >
          <Toggle
            checked={productUpdates}
            onChange={(e) => setProductUpdates(e.target.checked)}
            aria-label="Product updates"
          />
        </SettingRow>
        <SettingRow
          title="Marketing"
          description="Tips, customer stories, and the occasional offer. Unsubscribe anytime."
        >
          <Toggle
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            aria-label="Marketing emails"
          />
        </SettingRow>
      </Stack>
    </Stack>
  );
}

export function AppearanceSection() {
  const [mode, setMode] = useState<"light" | "dark" | "system">("system");
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");

  return (
    <Stack gap="5">
      <Stack gap="1">
        <Heading level={2} size="lg">
          Appearance
        </Heading>
        <Text tone="muted" size="sm">
          These preferences apply only to this device.
        </Text>
      </Stack>

      <Field label="Theme">
        <HStack gap="2" wrap>
          {(["light", "dark", "system"] as const).map((opt) => (
            <Button
              key={opt}
              variant={mode === opt ? "primary" : "secondary"}
              size="sm"
              onClick={() => setMode(opt)}
              style={{ textTransform: "capitalize" }}
            >
              {opt}
            </Button>
          ))}
        </HStack>
      </Field>

      <Field label="Density">
        <HStack gap="2" wrap>
          {(["comfortable", "compact"] as const).map((opt) => (
            <Button
              key={opt}
              variant={density === opt ? "primary" : "secondary"}
              size="sm"
              onClick={() => setDensity(opt)}
              style={{ textTransform: "capitalize" }}
            >
              {opt}
            </Button>
          ))}
        </HStack>
      </Field>
    </Stack>
  );
}

export function SecuritySection() {
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <Stack gap="5">
      <Stack gap="1">
        <Heading level={2} size="lg">
          Security
        </Heading>
        <Text tone="muted" size="sm">
          Keep your account safe with a strong password and two-factor authentication.
        </Text>
      </Stack>

      <Field label="Current password">
        <Input type="password" placeholder="••••••••" autoComplete="current-password" />
      </Field>
      <Field label="New password" hint="At least 12 characters with a mix of cases and numbers.">
        <Input type="password" placeholder="••••••••" autoComplete="new-password" />
      </Field>

      <SettingRow
        title="Two-factor authentication"
        description="Require a second factor when signing in from a new device."
      >
        <Toggle
          checked={twoFactor}
          onChange={(e) => setTwoFactor(e.target.checked)}
          aria-label="Two-factor authentication"
        />
      </SettingRow>

      <SettingRow
        title="Active sessions"
        description="You're currently signed in on 2 other devices."
      >
        <Button variant="secondary" size="sm">
          Review sessions
        </Button>
      </SettingRow>

      <HStack gap="2" justify="flex-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Update password</Button>
      </HStack>
    </Stack>
  );
}

/* A two-column row: title + description on the left, control on the right. */
function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <HStack gap="4" align="center" justify="space-between" style={{ width: "100%" }}>
      <Stack gap="1" style={{ flex: 1, minWidth: 0 }}>
        <Text weight="medium">{title}</Text>
        <Text tone="muted" size="sm">
          {description}
        </Text>
      </Stack>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </HStack>
  );
}
