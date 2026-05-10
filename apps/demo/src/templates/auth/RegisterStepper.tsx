/*
 * Register template — Multi-step.
 *
 * A 3-step wizard pattern: collect account → profile → plan choice.
 * Useful when you want to keep each screen short and increase the
 * perceived "smallness" of the commitment. Uses bakerui's Stepper for
 * the progress indicator and standard form fields per step.
 */

import { useState } from "react";
import {
  Button,
  Card,
  Field,
  HStack,
  Heading,
  Input,
  Stack,
  Stepper,
  Text,
} from "bakerui";
import { Brand, FlowSwitchLink } from "./sections";

const STEPS = [
  { title: "Account", description: "Email and password" },
  { title: "Profile", description: "Tell us about you" },
  { title: "Plan", description: "Pick how you'll use it" },
];

const PLANS = [
  { id: "solo", name: "Solo", price: "Free", description: "For individuals just starting." },
  { id: "team", name: "Team", price: "$12/mo", description: "Up to 10 members, shared workspace." },
  { id: "growth", name: "Growth", price: "$48/mo", description: "Unlimited members and history." },
] as const;

export function RegisterStepper() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<(typeof PLANS)[number]["id"]>("solo");
  const [done, setDone] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="auth-template auth-template--centered">
      <div className="auth-template__centered-shell auth-template__stepper-shell">
        <Stack gap="6">
          <Brand />

          <Card padded>
            <Stack gap="6">
              <Stepper activeStep={step}>
                {STEPS.map((s) => (
                  <Stepper.Step key={s.title} title={s.title} description={s.description} />
                ))}
              </Stepper>

              {done ? (
                <Stack gap="4" align="center">
                  <Heading level={2} size="xl">
                    You're in.
                  </Heading>
                  <Text tone="muted">We sent a verification link to your email.</Text>
                </Stack>
              ) : (
                <>
                  {step === 0 && <AccountStep />}
                  {step === 1 && <ProfileStep />}
                  {step === 2 && <PlanStep plan={plan} setPlan={setPlan} />}
                  <HStack justify="space-between">
                    <Button variant="ghost" onClick={back} disabled={step === 0}>
                      Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                      <Button onClick={next}>Continue</Button>
                    ) : (
                      <Button onClick={() => setDone(true)}>Create account</Button>
                    )}
                  </HStack>
                </>
              )}
            </Stack>
          </Card>

          <FlowSwitchLink question="Already have an account?" cta="Sign in" />
        </Stack>
      </div>
    </div>
  );
}

function AccountStep() {
  return (
    <Stack gap="4">
      <Field label="Work email">
        <Input type="email" placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field label="Password" hint="At least 12 characters.">
        <Input type="password" placeholder="••••••••" autoComplete="new-password" />
      </Field>
    </Stack>
  );
}

function ProfileStep() {
  return (
    <Stack gap="4">
      <Field label="Full name">
        <Input placeholder="Jamie Park" autoComplete="name" />
      </Field>
      <Field label="Company / team" hint="Optional — helps us tailor your defaults.">
        <Input placeholder="Northwind" />
      </Field>
    </Stack>
  );
}

function PlanStep({
  plan,
  setPlan,
}: {
  plan: (typeof PLANS)[number]["id"];
  setPlan: (id: (typeof PLANS)[number]["id"]) => void;
}) {
  return (
    <Stack gap="3">
      {PLANS.map((p) => {
        const active = plan === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlan(p.id)}
            data-active={active || undefined}
            className="auth-template__plan-card"
          >
            <HStack gap="4" align="flex-start" justify="space-between">
              <Stack gap="1" align="flex-start">
                <Text weight="semibold">{p.name}</Text>
                <Text size="sm" tone="muted">
                  {p.description}
                </Text>
              </Stack>
              <Text weight="semibold">{p.price}</Text>
            </HStack>
          </button>
        );
      })}
    </Stack>
  );
}
