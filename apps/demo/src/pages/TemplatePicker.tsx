import { HStack, Text } from "bakerui";

export interface TemplateOption<T extends string> {
  id: T;
  label: string;
  description: string;
  inspiration: string;
}

interface TemplatePickerProps<T extends string> {
  options: TemplateOption<T>[];
  active: T;
  onChange: (id: T) => void;
}

/**
 * Shared layout picker used across template pages (Settings / Login /
 * Register). Renders the available layouts as a row of chip-buttons with a
 * one-line description of the active selection underneath.
 */
export function TemplatePicker<T extends string>({
  options,
  active,
  onChange,
}: TemplatePickerProps<T>) {
  const current = options.find((o) => o.id === active)!;
  return (
    <>
      <HStack gap="2" wrap>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`bui-button bui-button--${active === opt.id ? "primary" : "secondary"} bui-button--sm`}
            style={{
              flexDirection: "column",
              height: "auto",
              padding: "8px 14px",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <span style={{ fontWeight: 600 }}>{opt.label}</span>
            <span style={{ fontSize: 11, opacity: 0.8 }}>Like {opt.inspiration}</span>
          </button>
        ))}
      </HStack>
      <Text tone="muted" size="sm">
        <strong>{current.label}:</strong> {current.description}.
      </Text>
    </>
  );
}
