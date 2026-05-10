import { useState } from "react";
import { Heading, Stack, Text } from "bakerui";
import { PageLayout } from "../PageLayout";
import { LoginCentered } from "../templates/auth/LoginCentered";
import { LoginMinimal } from "../templates/auth/LoginMinimal";
import { LoginSplit } from "../templates/auth/LoginSplit";
import { TemplatePicker, type TemplateOption } from "./TemplatePicker";

type LayoutId = "centered" | "split" | "minimal";

const LAYOUTS: TemplateOption<LayoutId>[] = [
  {
    id: "centered",
    label: "Centered",
    description: "Compact card pinned to the middle of the page",
    inspiration: "Linear, Notion",
  },
  {
    id: "split",
    label: "Split",
    description: "Form on the left, marketing/social-proof panel on the right",
    inspiration: "Vercel, Stripe",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "No card chrome — form sits directly on the page bg",
    inspiration: "Modern mobile-first SaaS",
  },
];

export function LoginTemplatesPage() {
  const [active, setActive] = useState<LayoutId>("centered");

  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Login templates</Heading>
          <Text tone="muted">
            Three ways to lay out a sign-in screen. Same form, different framing — pick whichever
            best matches your product's tone.
          </Text>
        </Stack>

        <Stack gap="3">
          <TemplatePicker options={LAYOUTS} active={active} onChange={setActive} />
        </Stack>

        <div className="auth-template-preview">
          {active === "centered" && <LoginCentered />}
          {active === "split" && <LoginSplit />}
          {active === "minimal" && <LoginMinimal />}
        </div>

        <Text tone="muted" size="sm">
          Source lives in <code>apps/demo/src/templates/auth/</code>. Form fields and social
          buttons are extracted into <code>sections.tsx</code>.
        </Text>
      </Stack>
    </PageLayout>
  );
}
