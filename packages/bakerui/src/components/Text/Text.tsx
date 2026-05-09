import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./Text.css";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextTone = "default" | "muted" | "accent" | "danger" | "success";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
  mono?: boolean;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as: Tag = "p", size = "md", weight = "regular", tone = "default", mono, className, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx(
        "bui-text",
        `bui-text--${size}`,
        `bui-text--${weight}`,
        tone !== "default" && `bui-text--${tone}`,
        mono && "bui-text--mono",
        className,
      )}
      {...rest}
    />
  );
});

export interface HeadingProps extends Omit<TextProps, "as"> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const headingDefaults: Record<NonNullable<HeadingProps["level"]>, TextSize> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "md",
};

export const Heading = forwardRef<HTMLElement, HeadingProps>(function Heading(
  { level = 2, weight = "semibold", size, ...rest },
  ref,
) {
  return (
    <Text
      ref={ref}
      as={`h${level}` as ElementType}
      size={size ?? headingDefaults[level]}
      weight={weight}
      {...rest}
    />
  );
});
