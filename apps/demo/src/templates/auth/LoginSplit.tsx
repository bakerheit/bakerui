/*
 * Login template — Split-screen.
 *
 * Form on the left, marketing/hero panel on the right. Common for B2B
 * SaaS where the right panel reinforces brand or shows social proof.
 * Collapses to a single column on narrow screens (the hero panel hides).
 */

import { Heading, Stack, Text } from "bakerui";
import {
  Brand,
  FlowSwitchLink,
  LoginForm,
  OrDivider,
  SocialButtons,
} from "./sections";

export function LoginSplit() {
  return (
    <div className="auth-template auth-template--split">
      <div className="auth-template__split-form">
        <div className="auth-template__split-form-inner">
          <Stack gap="6">
            <Brand />
            <Stack gap="2">
              <Heading level={1} size="2xl">
                Welcome back
              </Heading>
              <Text tone="muted">Sign in to keep building.</Text>
            </Stack>
            <SocialButtons action="Sign in" />
            <OrDivider />
            <LoginForm />
            <FlowSwitchLink question="Don't have an account?" cta="Sign up" />
          </Stack>
        </div>
      </div>

      <aside className="auth-template__split-hero" aria-hidden>
        <div className="auth-template__split-hero-overlay">
          <Stack gap="4">
            <Heading level={2} size="xl" style={{ color: "inherit" }}>
              "We replaced three tools with bakerui in a weekend."
            </Heading>
            <Stack gap="0">
              <Text style={{ color: "inherit", fontWeight: 600 }}>Aria Chen</Text>
              <Text size="sm" style={{ color: "inherit", opacity: 0.85 }}>
                Engineering Lead, Northwind
              </Text>
            </Stack>
          </Stack>
        </div>
      </aside>
    </div>
  );
}
