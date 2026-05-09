import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import "./Radio.css";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (next: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Form field name. Auto-generated when omitted. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Layout direction. Default is column (vertical). */
  orientation?: "row" | "column";
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    name,
    value: controlledValue,
    defaultValue,
    onChange,
    disabled,
    orientation = "column",
    className,
    children,
    ...rest
  },
  ref,
) {
  const generatedName = useId();
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const value = controlledValue ?? internalValue;

  const setValue = useCallback(
    (next: string) => {
      if (controlledValue === undefined) setInternalValue(next);
      onChange?.(next);
    },
    [controlledValue, onChange],
  );

  const ctx = useMemo<RadioGroupContextValue>(
    () => ({ name: name ?? generatedName, value, setValue, disabled }),
    [name, generatedName, value, setValue, disabled],
  );

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        ref={ref}
        role="radiogroup"
        className={cx("bui-radio-group", orientation === "row" && "bui-radio-group--row", className)}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "onChange"> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, description, disabled, className, ...rest },
  ref,
) {
  const ctx = useContext(RadioGroupContext);
  const isInGroup = ctx !== null;
  const checked = isInGroup ? ctx.value === value : undefined;
  const isDisabled = disabled || (isInGroup && ctx.disabled);

  return (
    <label className={cx("bui-radio", className)}>
      <input
        ref={ref}
        type="radio"
        className="bui-radio__input"
        name={ctx?.name}
        value={value}
        checked={checked}
        disabled={isDisabled}
        onChange={(event) => {
          if (event.target.checked && ctx) ctx.setValue(value);
        }}
        {...rest}
      />
      <span className="bui-radio__circle" aria-hidden />
      {(label || description) && (
        <span className="bui-radio__body">
          {label && <span className="bui-radio__label">{label}</span>}
          {description && <span className="bui-radio__description">{description}</span>}
        </span>
      )}
    </label>
  );
});
