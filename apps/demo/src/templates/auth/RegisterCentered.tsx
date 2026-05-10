/*
 * Register template — Centered card.
 *
 * Mirror of LoginCentered but for sign-up: extra fields (name, password
 * confirm via stricter hint) and a terms checkbox gating the submit.
 */

import { Card, Stack } from "bakerui";
import {
  AuthHeading,
  Brand,
  FlowSwitchLink,
  OrDivider,
  RegisterForm,
  SocialButtons,
} from "./sections";

export function RegisterCentered() {
  return (
    <div className="auth-template auth-template--centered">
      <div className="auth-template__centered-shell">
        <Stack gap="6" align="center">
          <Brand />
          <Card padded className="auth-template__card">
            <Stack gap="5">
              <AuthHeading
                title="Create your account"
                subtitle="Free to start, no credit card required."
              />
              <SocialButtons action="Sign up" />
              <OrDivider />
              <RegisterForm />
              <FlowSwitchLink question="Already have an account?" cta="Sign in" />
            </Stack>
          </Card>
        </Stack>
      </div>
    </div>
  );
}
