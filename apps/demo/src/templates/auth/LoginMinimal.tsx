/*
 * Login template — Minimal.
 *
 * No card chrome — the form sits directly on the page bg with a brand
 * mark above it. Reads as a focused, modern flow; works especially well
 * on mobile where chrome eats screen space.
 */

import { Stack } from "bakerui";
import {
  AuthHeading,
  Brand,
  FlowSwitchLink,
  LoginForm,
  OrDivider,
  SocialButtons,
} from "./sections";

export function LoginMinimal() {
  return (
    <div className="auth-template auth-template--minimal">
      <div className="auth-template__minimal-shell">
        <Stack gap="8">
          <Brand />
          <Stack gap="6">
            <AuthHeading
              title="Sign in"
              subtitle="Welcome back. Use your workspace email or a connected provider."
            />
            <LoginForm />
            <OrDivider label="or" />
            <SocialButtons action="Sign in" />
          </Stack>
          <FlowSwitchLink question="New here?" cta="Create an account" />
        </Stack>
      </div>
    </div>
  );
}
