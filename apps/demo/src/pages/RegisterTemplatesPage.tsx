import { useState } from "react";
import { Heading, Stack, Text } from "bakerui";
import { PageLayout } from "../PageLayout";
import { RegisterCentered } from "../templates/auth/RegisterCentered";
import { RegisterSplit } from "../templates/auth/RegisterSplit";
import { RegisterStepper } from "../templates/auth/RegisterStepper";
import { TemplatePicker, type TemplateOption } from "./TemplatePicker";

type LayoutId = "centered" | "split" | "stepper";

const LAYOUTS: TemplateOption<LayoutId>[] = [
  {
    id: "centered",
    label: "Centered",
    description: "Single-card sign-up, mirrors the login centered layout",
    inspiration: "Linear, Notion",
  },
  {
    id: "split",
    label: "Split",
    description: "Form on the left, benefits / value-prop panel on the right",
    inspiration: "Vercel, Webflow",
  },
  {
    id: "stepper",
    label: "Stepper",
    description: "Multi-step wizard: account → profile → plan",
    inspiration: "Stripe, modern onboarding flows",
  },
];

export function RegisterTemplatesPage() {
  const [active, setActive] = useState<LayoutId>("centered");

  return (
    <PageLayout>
      <Stack gap="8" className="demo-section">
        <Stack gap="2">
          <Heading level={1}>Register templates</Heading>
          <Text tone="muted">
            Sign-up flows trade a few seconds of friction for higher quality signups. Each layout
            applies that trade-off differently — short and fast, benefit-led, or step-by-step.
          </Text>
        </Stack>

        <Stack gap="3">
          <TemplatePicker options={LAYOUTS} active={active} onChange={setActive} />
        </Stack>

        <div className="auth-template-preview">
          {active === "centered" && <RegisterCentered />}
          {active === "split" && <RegisterSplit />}
          {active === "stepper" && <RegisterStepper />}
        </div>

        <Text tone="muted" size="sm">
          Source lives in <code>apps/demo/src/templates/auth/</code>. The same{" "}
          <code>RegisterForm</code> is reused across the centered and split variants; the stepper
          template inlines its own per-step fields to keep wizard state local.
        </Text>
      </Stack>
    </PageLayout>
  );
}
