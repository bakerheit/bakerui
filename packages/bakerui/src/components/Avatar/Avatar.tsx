import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import "./Avatar.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials/icon if it fails to load. */
  src?: string;
  /** Display name; used to derive initials and as image alt. */
  name?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  /** Custom fallback content (overrides initials). */
  fallback?: ReactNode;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
}

function initials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "");
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size = "md", tone = "neutral", fallback, imgProps, className, ...rest },
  ref,
) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!src && !imgFailed;
  const fallbackContent = fallback ?? initials(name);

  return (
    <span
      ref={ref}
      className={cx(
        "bui-avatar",
        `bui-avatar--${size}`,
        tone !== "neutral" && `bui-avatar--${tone}`,
        className,
      )}
      role="img"
      aria-label={name}
      {...rest}
    >
      {showImage ? (
        <img
          className="bui-avatar__image"
          src={src}
          alt={name ?? ""}
          onError={() => setImgFailed(true)}
          {...imgProps}
        />
      ) : (
        <span className="bui-avatar__fallback" aria-hidden>
          {fallbackContent}
        </span>
      )}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** Maximum visible avatars. Extras collapse into a "+N" tile. */
  max?: number;
  /** Cascades to all children. */
  size?: AvatarSize;
}

export const AvatarGroup = forwardRef<HTMLSpanElement, AvatarGroupProps>(function AvatarGroup(
  { max, size = "md", className, children, ...rest },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const total = items.length;
  const visible = max !== undefined && total > max ? items.slice(0, max) : items;
  const hidden = max !== undefined && total > max ? total - max : 0;

  return (
    <span
      ref={ref}
      className={cx("bui-avatar-group", className)}
      style={{ ["--bui-avatar-size" as string]: cssSize(size) }}
      {...rest}
    >
      {visible.map((child, idx) =>
        cloneElement(child, {
          // Cascade group size to children that didn't set their own.
          size: child.props.size ?? size,
          key: child.key ?? idx,
        }),
      )}
      {hidden > 0 && (
        <Avatar
          size={size}
          className="bui-avatar-group__overflow"
          fallback={`+${hidden}`}
          aria-label={`${hidden} more`}
        />
      )}
    </span>
  );
});

function cssSize(size: AvatarSize): string {
  return {
    xs: "24px",
    sm: "32px",
    md: "40px",
    lg: "48px",
    xl: "64px",
  }[size];
}
