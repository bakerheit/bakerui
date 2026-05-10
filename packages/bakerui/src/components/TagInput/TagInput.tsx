import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cx } from "../../utils/cx";
import "./TagInput.css";

export type TagInputSize = "sm" | "md" | "lg";

export interface TagInputProps {
  /** Controlled list of tags. */
  value?: string[];
  /** Initial tags for uncontrolled use. */
  defaultValue?: string[];
  /** Fired with the new tag list whenever it changes. */
  onChange?: (tags: string[]) => void;
  /** Placeholder shown only when there are no tags. */
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Allow the same tag value to appear more than once. Default false. */
  allowDuplicates?: boolean;
  /** Cap the number of tags. Input is disabled when reached. */
  maxTags?: number;
  /**
   * KeyboardEvent.key values that commit the current input as a tag.
   * Default: `[",", "Enter", "Tab"]`. Tab on an empty input still moves
   * focus normally so it doesn't trap keyboard users.
   */
  delimiter?: string[];
  size?: TagInputSize;
  className?: string;
  /** Accessible name for the underlying input. */
  "aria-label"?: string;
}

const DEFAULT_DELIMITER: string[] = [",", "Enter", "Tab"];

function XIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 2l6 6M8 2l-6 6" />
    </svg>
  );
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder,
    disabled,
    invalid,
    allowDuplicates = false,
    maxTags,
    delimiter = DEFAULT_DELIMITER,
    size = "md",
    className,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue ?? []);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const tags = controlledValue ?? internalTags;
  const atMax = maxTags !== undefined && tags.length >= maxTags;
  const inputDisabled = disabled || atMax;

  function setTags(next: string[]): void {
    if (controlledValue === undefined) setInternalTags(next);
    onChange?.(next);
  }

  // Folds a list of candidate strings into the current tags, skipping
  // empties, duplicates (when not allowed), and stopping at maxTags.
  // Returns true iff at least one tag was added.
  function commitMany(parts: string[]): boolean {
    let next = tags;
    for (const raw of parts) {
      const candidate = raw.trim();
      if (!candidate) continue;
      if (!allowDuplicates && next.includes(candidate)) continue;
      if (maxTags !== undefined && next.length >= maxTags) break;
      next = [...next, candidate];
    }
    if (next.length === tags.length) return false;
    setTags(next);
    return true;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (delimiter.includes(e.key)) {
      // Let Tab fall through when there's nothing to commit, so keyboard
      // users aren't trapped in an empty TagInput.
      if (e.key === "Tab" && inputValue.trim() === "") return;
      e.preventDefault();
      if (commitMany([inputValue])) setInputValue("");
      return;
    }
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>): void {
    const pasted = e.clipboardData.getData("text");
    if (!/[,\n\r]/.test(pasted)) return;
    e.preventDefault();
    const parts = pasted.split(/[,\n\r]+/);
    // Prepend whatever's already typed so paste merges with in-progress text.
    if (commitMany([inputValue, ...parts])) setInputValue("");
  }

  function handleBlur(_e: FocusEvent<HTMLInputElement>): void {
    // Commit pending text on blur — otherwise typing "tag" and clicking
    // elsewhere silently drops it, which is surprising.
    if (inputValue.trim() && commitMany([inputValue])) {
      setInputValue("");
    }
  }

  function handleWrapperClick(e: MouseEvent<HTMLDivElement>): void {
    if (disabled) return;
    // Don't steal focus when the click landed on a remove button — its own
    // handler should run uninterrupted.
    if ((e.target as HTMLElement).closest(".bui-tag-input__tag-remove")) return;
    inputRef.current?.focus();
  }

  function removeTag(index: number): void {
    setTags(tags.filter((_, i) => i !== index));
  }

  return (
    <div
      className={cx(
        "bui-tag-input",
        size !== "md" && `bui-tag-input--${size}`,
        disabled && "bui-tag-input--disabled",
        invalid && "bui-tag-input--invalid",
        className,
      )}
      onClick={handleWrapperClick}
      aria-disabled={disabled || undefined}
    >
      {tags.map((tag, i) => (
        <span key={`${tag}-${i}`} className="bui-tag-input__tag">
          <span className="bui-tag-input__tag-label">{tag}</span>
          <button
            type="button"
            className="bui-tag-input__tag-remove"
            aria-label={`Remove ${tag}`}
            onClick={() => removeTag(i)}
            disabled={disabled}
          >
            <XIcon />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        className="bui-tag-input__input"
        value={inputValue}
        placeholder={tags.length === 0 ? placeholder : undefined}
        disabled={inputDisabled}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
      />
    </div>
  );
});
