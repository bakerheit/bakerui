/*
 * Login template — Centered card.
 *
 * Classic auth pattern: a small card vertically + horizontally centered
 * on a plain background. Fast to scan, works on every screen size, and
 * pairs naturally with a logo/wordmark above the card.
 */

import { Card, Stack } from "bakerui";
import {
  AuthHeading,
  Brand,
  FlowSwitchLink,
  LoginForm,
  OrDivider,
  SocialButtons,
} from "./sections";

export function LoginCentered() {
  return (
    <div className="auth-template auth-template--centered">
      <div className="auth-template__centered-shell">
        <Stack gap="6" align="center">
          <Brand />
          <Card padded className="auth-template__card">
            <Stack gap="5">
              <AuthHeading
                title="Welcome back"
                subtitle="Sign in to your bakerui workspace."
              />
              <SocialButtons action="Sign in" />
              <OrDivider />
              <LoginForm />
              <FlowSwitchLink question="Don't have an account?" cta="Sign up" />
            </Stack>
          </Card>
        </Stack>
      </div>
    </div>
  );
}
