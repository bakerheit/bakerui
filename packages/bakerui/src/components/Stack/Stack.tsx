import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

type SpaceToken =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12"
  | "16";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  direction?: "row" | "column";
  /** Token from the bakerui spacing scale, or any CSS length. */
  gap?: SpaceToken | string;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
  inline?: boolean;
}

const isToken = (v?: string): v is SpaceToken =>
  !!v && /^(0|1|2|3|4|5|6|8|10|12|16)$/.test(v);

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    as: Tag = "div",
    direction = "column",
    gap = "4",
    align,
    justify,
    wrap,
    inline,
    style,
    className,
    ...rest
  },
  ref,
) {
  const gapValue = isToken(gap) ? `var(--bui-space-${gap})` : gap;
  return (
    <Tag
      ref={ref}
      className={cx("bui-stack", className)}
      style={{
        display: inline ? "inline-flex" : "flex",
        flexDirection: direction,
        gap: gapValue,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      {...rest}
    />
  );
});

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  function HStack(props, ref) {
    return <Stack ref={ref} direction="row" align="center" {...props} />;
  },
);

export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  function VStack(props, ref) {
    return <Stack ref={ref} direction="column" {...props} />;
  },
);
