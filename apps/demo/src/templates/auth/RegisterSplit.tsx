/*
 * Register template — Split-screen with benefits panel.
 *
 * Form on the left, a "what you get" benefits list on the right. The
 * benefits panel reduces friction by addressing common sign-up
 * hesitations ("what's the catch?") right next to the form.
 */

import { Heading, Stack, Text } from "bakerui";
import {
  Brand,
  FlowSwitchLink,
  OrDivider,
  RegisterForm,
  SocialButtons,
} from "./sections";

const BENEFITS = [
  {
    title: "Free forever for solo accounts",
    description: "No credit card, no time limit. Upgrade only when your team grows.",
  },
  {
    title: "Plays well with your stack",
    description: "Plain CSS variables, no runtime style engine. Drop into any React app.",
  },
  {
    title: "Tokens, not theme objects",
    description: "Override one CSS variable to retheme every component instantly.",
  },
];

export function RegisterSplit() {
  return (
    <div className="auth-template auth-template--split">
      <div className="auth-template__split-form">
        <div className="auth-template__split-form-inner">
          <Stack gap="6">
            <Brand />
            <Stack gap="2">
              <Heading level={1} size="2xl">
                Create your account
              </Heading>
              <Text tone="muted">Two minutes to set up. No card required.</Text>
            </Stack>
            <SocialButtons action="Sign up" />
            <OrDivider />
            <RegisterForm />
            <FlowSwitchLink question="Already have an account?" cta="Sign in" />
          </Stack>
        </div>
      </div>

      <aside className="auth-template__split-hero auth-template__split-hero--benefits">
        <div className="auth-template__split-hero-overlay">
          <Stack gap="6">
            <Heading level={2} size="xl" style={{ color: "inherit" }}>
              Why bakerui
            </Heading>
            <Stack gap="5">
              {BENEFITS.map((b) => (
                <Stack key={b.title} gap="1">
                  <Text style={{ color: "inherit", fontWeight: 600 }}>
                    <CheckGlyph /> {b.title}
                  </Text>
                  <Text size="sm" style={{ color: "inherit", opacity: 0.85 }}>
                    {b.description}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </div>
      </aside>
    </div>
  );
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: 6, verticalAlign: "-2px" }}
      aria-hidden
    >
      <path d="M3 8l3 3 7-7" />
    </svg>
  );
}
