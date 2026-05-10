/*
 * Shared building blocks for auth templates (Login / Register).
 *
 * Brand mark, social login row, "or continue with email" divider, and the
 * field stacks for both flows. Templates compose these in different
 * layouts (centered, split-screen, multi-step, etc.).
 */

import { useState } from "react";
import {
  Button,
  Field,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
} from "bakerui";

export function Brand({ name = "bakerui" }: { name?: string }) {
  return (
    <HStack gap="2" align="center">
      <span aria-hidden className="auth-template__mark" />
      <span className="auth-template__brand-name">{name}</span>
    </HStack>
  );
}

export function SocialButtons({ action = "Continue" }: { action?: string }) {
  return (
    <Stack gap="2">
      <Button variant="secondary" fullWidth>
        <GoogleIcon /> {action} with Google
      </Button>
      <Button variant="secondary" fullWidth>
        <GithubIcon /> {action} with GitHub
      </Button>
      <Button variant="secondary" fullWidth>
        <AppleIcon /> {action} with Apple
      </Button>
    </Stack>
  );
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="auth-template__or" aria-hidden>
      <span>{label}</span>
    </div>
  );
}

export function LoginForm() {
  return (
    <Stack gap="4">
      <Field label="Email">
        <Input type="email" placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Field>
      <HStack justify="flex-end">
        <a href="#" className="auth-template__link">
          Forgot password?
        </a>
      </HStack>
      <Button fullWidth size="lg">
        Sign in
      </Button>
    </Stack>
  );
}

export function RegisterForm() {
  const [agreed, setAgreed] = useState(false);
  return (
    <Stack gap="4">
      <Field label="Full name">
        <Input placeholder="Jamie Park" autoComplete="name" />
      </Field>
      <Field label="Work email">
        <Input type="email" placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field label="Password" hint="At least 12 characters.">
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>
      <label className="auth-template__terms">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <Text size="sm" tone="muted">
          I agree to the <a href="#" className="auth-template__link">Terms</a> and{" "}
          <a href="#" className="auth-template__link">Privacy Policy</a>.
        </Text>
      </label>
      <Button fullWidth size="lg" disabled={!agreed}>
        Create account
      </Button>
    </Stack>
  );
}

export function FlowSwitchLink({
  question,
  cta,
  href = "#",
}: {
  question: string;
  cta: string;
  href?: string;
}) {
  return (
    <Text size="sm" tone="muted" style={{ textAlign: "center" }}>
      {question}{" "}
      <a href={href} className="auth-template__link">
        {cta}
      </a>
    </Text>
  );
}

export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Stack gap="2">
      <Heading level={1} size="2xl">
        {title}
      </Heading>
      <Text tone="muted">{subtitle}</Text>
    </Stack>
  );
}

/* Icons — minimal, monochrome glyphs that pick up currentColor. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M8 6.5v3h4.2c-.2 1-.8 1.9-1.7 2.5l2.7 2.1c1.6-1.5 2.5-3.6 2.5-6.1 0-.6 0-1.1-.1-1.6H8z" />
      <path d="M3.6 9.5l-.7.5-2.4 1.9C2 14.3 4.8 16 8 16c2.2 0 4-.7 5.4-2l-2.7-2.1c-.7.5-1.7.8-2.7.8-2.1 0-3.9-1.4-4.4-3.2z" opacity="0.55" />
      <path d="M.5 4.1C-.1 5.3-.5 6.6-.5 8s.4 2.7 1 3.9l3.1-2.4C3.4 8.9 3.3 8.5 3.3 8s.1-.9.3-1.5L.5 4.1z" opacity="0.35" />
      <path d="M8 3.2c1.2 0 2.3.4 3.1 1.2l2.4-2.4C12.1.7 10.2 0 8 0 4.8 0 2 1.7.5 4.1l3.1 2.4C4.1 4.6 5.9 3.2 8 3.2z" opacity="0.75" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M8 .2a8 8 0 00-2.5 15.6c.4.1.6-.2.6-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.7-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1 0-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.5 1.1.1 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.9 3.6-3.6 3.9.3.2.5.7.5 1.4v2.1c0 .2.2.5.6.4A8 8 0 008 .2z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M11.6 8.5c0-2 1.6-2.9 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.4 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6 1.2 0 1.5.6 2.6.6 1.1 0 1.7-1 2.4-2 .5-.7.8-1.4 1-2.1-1-.4-2-1.4-2-2.7zM10 2.6c.5-.7.9-1.6.8-2.6-.8 0-1.7.5-2.3 1.2-.5.6-1 1.6-.9 2.5.9.1 1.8-.4 2.4-1.1z" />
    </svg>
  );
}
