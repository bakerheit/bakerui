import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import "./Stepper.css";

export type StepStatus =
  | "upcoming"
  | "active"
  | "complete"
  | "error"
  | "disabled";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperSize = "sm" | "md";

export interface StepperProps extends HTMLAttributes<HTMLElement> {
  /** 0-indexed active step. Steps before are auto-marked "complete"; after are "upcoming". */
  activeStep: number;
  /** Layout direction. */
  orientation?: StepperOrientation;
  /** Visual size. */
  size?: StepperSize;
  children?: ReactNode;
}

export interface StepperStepProps {
  title: ReactNode;
  description?: ReactNode;
  /** Custom indicator content (e.g., an icon). Otherwise renders the step number / status icon. */
  icon?: ReactNode;
  /** Override the auto-derived status. */
  status?: StepStatus;
  // Injected by parent — consumers shouldn't pass these directly.
  index?: number;
  total?: number;
  activeStep?: number;
}

const StepperRoot = forwardRef<HTMLElement, StepperProps>(function Stepper(
  {
    activeStep,
    orientation = "horizontal",
    size = "md",
    className,
    children,
    ...rest
  },
  ref,
) {
  const items = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<StepperStepProps>[];
  const total = items.length;

  return (
    <nav
      ref={ref}
      aria-label="Progress"
      className={cx(
        "bui-stepper",
        `bui-stepper--${orientation}`,
        `bui-stepper--${size}`,
        className,
      )}
      {...rest}
    >
      <ol className="bui-stepper__list">
        {items.map((step, idx) =>
          cloneElement(step, {
            key: step.key ?? idx,
            index: idx,
            total,
            activeStep,
          }),
        )}
      </ol>
    </nav>
  );
});

function deriveStatus(
  index: number,
  activeStep: number,
  override?: StepStatus,
): StepStatus {
  if (override) return override;
  if (index < activeStep) return "complete";
  if (index === activeStep) return "active";
  return "upcoming";
}

const StepperStep = forwardRef<HTMLLIElement, StepperStepProps>(
  function StepperStep(
    {
      title,
      description,
      icon,
      status,
      index = 0,
      total = 1,
      activeStep = 0,
    },
    ref,
  ) {
    const computed = deriveStatus(index, activeStep, status);
    const isLast = index === total - 1;
    let indicator: ReactNode;
    if (icon) indicator = icon;
    else if (computed === "complete") indicator = <CheckIcon />;
    else if (computed === "error") indicator = <ErrorIcon />;
    else indicator = <span>{index + 1}</span>;

    return (
      <li
        ref={ref}
        className="bui-step"
        data-status={computed}
        data-last={isLast || undefined}
        aria-current={computed === "active" ? "step" : undefined}
      >
        <div className="bui-step__indicator" aria-hidden>
          {indicator}
        </div>
        <div className="bui-step__text">
          <div className="bui-step__title">{title}</div>
          {description ? (
            <div className="bui-step__description">{description}</div>
          ) : null}
        </div>
      </li>
    );
  },
);

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 7.5l3 3 5-6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4l6 6M10 4l-6 6" />
    </svg>
  );
}

type StepperComponent = typeof StepperRoot & {
  Step: typeof StepperStep;
};

export const Stepper = StepperRoot as StepperComponent;
Stepper.Step = StepperStep;
